import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { Customer } from '../entities/customer.entity';
import { InvoiceStatus } from '../enum/invoice-status.enum';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  // ============================================================
  // CREATE INVOICE
  // ============================================================
  async createInvoice(createDto: CreateInvoiceDto): Promise<Invoice> {
    try {
      const {
        invoiceNo,
        invoiceDate,
        supplyType,
        items,
        totalTaxableValue,
        totalGstAmount,
        grandTotal,
        paymentTerms,
        isFinal,
        sellerId,
        buyerId,
        transactionHash,
        placeOfSupply,
        dueDate,
      } = createDto;

      if (!items?.length) throw new BadRequestException('Items cannot be empty');

      const invoice = this.invoiceRepository.create({
        invoiceNo,
        invoiceDate: new Date(invoiceDate),
        supplyType,
        items,
        totalTaxableValue,
        totalGstAmount,
        grandTotal,
        paymentTerms,
        isFinal: isFinal || false,
        transactionHash: transactionHash || undefined,
        status: InvoiceStatus.PENDING,
        seller: { id: sellerId },
        buyer: { id: buyerId },
        placeOfSupply,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });

      const saved = await this.invoiceRepository.save(invoice);

      // Update customer statistics
      await this.updateCustomerStats(buyerId, grandTotal);

      return this.findOne(saved.invoiceId);
    } catch (error) {
      this.logger.error('❌ Invoice creation failed', error.stack);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ============================================================
  // UPDATE INVOICE
  // ============================================================
  async updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { invoiceId: id } });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);

    if (dto.status) this.ensureValidTransition(invoice.status, dto.status);
    Object.assign(invoice, dto);

    return this.invoiceRepository.save(invoice);
  }

  // ============================================================
  // STATUS TRANSITION VALIDATION
  // ============================================================
  private ensureValidTransition(current: InvoiceStatus, next: InvoiceStatus) {
    const allowed: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.PENDING]: [InvoiceStatus.APPROVED, InvoiceStatus.REJECTED],
      [InvoiceStatus.APPROVED]: [InvoiceStatus.FINALIZED],
      [InvoiceStatus.FINALIZED]: [InvoiceStatus.ITC_CLAIMED],
      [InvoiceStatus.ITC_CLAIMED]: [],
      [InvoiceStatus.REJECTED]: [InvoiceStatus.PENDING], // Allow re-submission
    };
    if (!allowed[current].includes(next)) {
      throw new BadRequestException(`Invalid transition: ${current} → ${next}`);
    }
  }

  // ============================================================
  // MARK AS FINALIZED (after on-chain tx)
  // ============================================================
  async markInvoiceOnChainFinalized(invoiceId: string, txHash: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);

    if (invoice.status !== InvoiceStatus.APPROVED) {
      throw new BadRequestException(
        `Only approved invoices can be finalized. Current: ${invoice.status}`,
      );
    }

    invoice.status = InvoiceStatus.FINALIZED;
    invoice.transactionHash = txHash;
    invoice.isFinal = true;

    const updated = await this.invoiceRepository.save(invoice);
    this.logger.log(`✅ Invoice ${invoice.invoiceNo} finalized on-chain`);
    return updated;
  }

  // ============================================================
  // MARK AS ITC CLAIMED
  // ============================================================
  async markInvoiceItcClaimed(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);

    if (invoice.status !== InvoiceStatus.FINALIZED) {
      throw new BadRequestException(
        `Only finalized invoices can be marked as ITC claimed. Current: ${invoice.status}`,
      );
    }

    invoice.status = InvoiceStatus.ITC_CLAIMED;
    invoice.isClaimedForITC = true;

    const updated = await this.invoiceRepository.save(invoice);
    this.logger.log(`💰 Invoice ${invoice.invoiceNo} marked as ITC claimed`);
    return updated;
  }

  // ============================================================
  // DELETE
  // ============================================================
  async deleteInvoice(id: string): Promise<void> {
    const result = await this.invoiceRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Invoice ${id} not found`);
  }

  // ============================================================
  // FIND ONE / ALL
  // ============================================================
  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceId: id },
      relations: ['seller', 'buyer'],
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      relations: ['seller', 'buyer'],
      order: { createdAt: 'DESC' },
    });
  }

  // ============================================================
  // BUYER INVOICE ACTIONS
  // ============================================================
  async approveInvoiceByBuyer(invoiceId: string, wallet: string) {
    const inv = await this.invoiceRepository.findOne({
      where: { invoiceId },
      relations: ['buyer'],
    });
    if (!inv) throw new NotFoundException();
    if (inv.buyer.walletAddress !== wallet)
      throw new ForbiddenException('Unauthorized action');
    if (inv.status !== InvoiceStatus.PENDING)
      throw new BadRequestException(`Invoice already ${inv.status}`);

    inv.status = InvoiceStatus.APPROVED;
    inv.buyerApprovalDate = new Date();
    inv.approvedBy = inv.buyer.id;
    return this.invoiceRepository.save(inv);
  }

  async rejectInvoiceByBuyer(invoiceId: string, wallet: string) {
    const inv = await this.invoiceRepository.findOne({
      where: { invoiceId },
      relations: ['buyer'],
    });
    if (!inv) throw new NotFoundException();
    if (inv.buyer.walletAddress !== wallet)
      throw new ForbiddenException('Unauthorized action');
    if (inv.status !== InvoiceStatus.PENDING)
      throw new BadRequestException(`Invoice already ${inv.status}`);

    inv.status = InvoiceStatus.REJECTED;
    inv.buyerApprovalDate = new Date();
    inv.approvedBy = inv.buyer.id;
    return this.invoiceRepository.save(inv);
  }

  // ============================================================
  // BUYER STATS
  // ============================================================
  async getBuyerInvoiceStats(wallet: string) {
    const customer = await this.customerRepository.findOne({ where: { walletAddress: wallet } });
    if (!customer) throw new NotFoundException();

    const totalInvoices = await this.invoiceRepository.count({ where: { buyer: { id: customer.id } } });
    const counts: Record<InvoiceStatus, number> = {
      [InvoiceStatus.PENDING]: 0,
      [InvoiceStatus.APPROVED]: 0,
      [InvoiceStatus.REJECTED]: 0,
      [InvoiceStatus.FINALIZED]: 0,
      [InvoiceStatus.ITC_CLAIMED]: 0,
    };

    for (const status of Object.values(InvoiceStatus)) {
      counts[status] = await this.invoiceRepository.count({
        where: { buyer: { id: customer.id }, status },
      });
    }

    return {
      buyer: customer.name,
      statistics: counts,
    };
  }

  // ============================================================
  // PDF GENERATION
  // ============================================================
  async generateInvoicePDF(id: string): Promise<Buffer> {
    const invoice = await this.findOne(id);
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', (b) => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.fontSize(18).text(`Invoice #${invoice.invoiceNo}`, { align: 'center' });
      doc.text(`Status: ${invoice.status}`);
      doc.text(`Date: ${invoice.invoiceDate}`);
      doc.text(`Seller: ${invoice.seller.companyName}`);
      doc.text(`Buyer: ${invoice.buyer.name}`);
      doc.text(`Grand Total: ₹${invoice.grandTotal}`);
      doc.end();
    });
  }

  // ============================================================
  // UPDATE CUSTOMER STATISTICS
  // ============================================================
  private async updateCustomerStats(customerId: string, invoiceAmount: number): Promise<void> {
    try {
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) {
        this.logger.warn(`Customer ${customerId} not found for stats update`);
        return;
      }

      customer.totalInvoices += 1;
      customer.totalAmountBilled += invoiceAmount;

      await this.customerRepository.save(customer);
      this.logger.log(`✅ Updated customer ${customer.name} stats: invoices=${customer.totalInvoices}, total=${customer.totalAmountBilled}`);
    } catch (error) {
      this.logger.error('❌ Failed to update customer stats', error.stack);
      // Don't throw error to avoid breaking invoice creation
    }
  }

  // ============================================================
  // ITC ELIGIBILITY CHECK
  // ============================================================
  async checkItcEligibility(invoiceId: string): Promise<{ eligible: boolean; reasons: string[] }> {
    const invoice = await this.findOne(invoiceId);
    const reasons: string[] = [];

    if (invoice.status !== InvoiceStatus.FINALIZED) {
      reasons.push('Invoice must be finalized');
    }

    if (invoice.isClaimedForITC) {
      reasons.push('ITC already claimed for this invoice');
    }

    if (!invoice.transactionHash) {
      reasons.push('Invoice not recorded on blockchain');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }
}