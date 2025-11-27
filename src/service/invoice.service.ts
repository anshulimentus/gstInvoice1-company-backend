import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
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
  ) { }

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

  async claimItcForInvoice(invoiceId: string, transactionHash: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { invoiceId } });
    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);

    if (invoice.status !== InvoiceStatus.FINALIZED) {
      throw new BadRequestException(
        `Only finalized invoices can be claimed for ITC. Current: ${invoice.status}`,
      );
    }

    if (invoice.isClaimedForITC) {
      throw new BadRequestException('ITC already claimed for this invoice');
    }

    invoice.status = InvoiceStatus.ITC_CLAIMED;
    invoice.isClaimedForITC = true;
    // Optionally store the transaction hash if not already set
    if (!invoice.transactionHash) {
      invoice.transactionHash = transactionHash;
    }

    const updated = await this.invoiceRepository.save(invoice);
    this.logger.log(`💰 Invoice ${invoice.invoiceNo} ITC claimed with tx: ${transactionHash}`);
    return updated;
  }

  async findInvoicesByTenantId(tenantId: string): Promise<Invoice[]> {
    try {
      // 1. Fetch invoices directly from the database
      const dbInvoices = await this.invoiceRepository.find({
        where: {
          seller: { tenantId },
        },
        relations: ['seller', 'buyer'],
        order: { createdAt: 'DESC' },
      });

      // 2. Return DB results (empty array if none found)
      return dbInvoices || [];

    } catch (error) {
      this.logger.error(`Error fetching invoices for tenantId ${tenantId}:`, error.stack);
      throw error;
    }
  }

  /**
   * Get invoices where the current company is the BUYER/RECIPIENT
   * These are invoices RECEIVED from suppliers, not invoices CREATED for others
   * Used for ITC claim eligibility - only buyer/recipient can claim ITC on-chain
   */
  async findBuyerInvoicesByTenantId(tenantId: string): Promise<Invoice[]> {
    try {
      this.logger.log(`Fetching received invoices (buyer perspective) for tenantId: ${tenantId}`);

      // Fetch invoices where this company is the BUYER (received invoices)
      // NOT invoices where they are the SELLER (created/issued invoices)
      const buyerInvoices = await this.invoiceRepository.find({
        where: {
          buyer: { companyTenantId: tenantId }, // Company is the BUYER
        },
        relations: ['seller', 'buyer'],
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`✅ Found ${buyerInvoices.length} received invoices for buyer company ${tenantId}`);
      return buyerInvoices || [];

    } catch (error) {
      this.logger.error(`Error fetching buyer invoices for tenantId ${tenantId}:`, error.stack);
      throw error;
    }
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
    if (inv.status !== InvoiceStatus.PENDING)
      throw new BadRequestException(`Invoice already ${inv.status}`);

    inv.status = InvoiceStatus.REJECTED;
    inv.buyerApprovalDate = new Date();
    inv.approvedBy = inv.buyer.id;
    return this.invoiceRepository.save(inv);
  }

  async finalizeInvoiceOnChain(invoiceId: string, transactionHash: string, userWallet: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { invoiceId }
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.APPROVED) {
      throw new BadRequestException('Invoice must be approved before finalization');
    }

    if (invoice.isFinal) {
      throw new BadRequestException('Invoice already finalized');
    }

    // Update invoice with blockchain transaction details
    invoice.isFinal = true;
    invoice.status = InvoiceStatus.FINALIZED;
    invoice.transactionHash = transactionHash;
    invoice.approvedBy = userWallet;

    await this.invoiceRepository.save(invoice);

    return {
      message: 'Invoice finalized successfully',
      transactionHash,
      invoiceId: invoice.invoiceId
    };
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
  // GET BUYER INVOICES BY WALLET
  // ============================================================
  async getBuyerInvoices(wallet: string, eligible = false): Promise<Invoice[]> {
    const customer = await this.customerRepository.findOne({ where: { walletAddress: wallet } });
    if (!customer) return [];

    if (!eligible) {
      return this.invoiceRepository.find({
        where: { buyer: { id: customer.id } },
        relations: ['seller', 'buyer'],
        order: { createdAt: 'DESC' },
      });
    }

    // If eligible flag is true, return only invoices that are eligible for ITC claim:
    // - buyer is this customer
    // - status = FINALIZED
    // - buyerApprovalDate is set
    // - transactionHash is set (seller finalized on-chain)
    // - isClaimedForITC = false
    // - seller.tenantId != buyer.companyTenantId (exclude self-issued invoices)
    return this.invoiceRepository.find({
      where: {
        buyer: { id: customer.id },
        status: InvoiceStatus.FINALIZED,
        buyerApprovalDate: Not(IsNull()),
        transactionHash: Not(IsNull()),
        isClaimedForITC: false,
        seller: { tenantId: Not(customer.companyTenantId) },
      },
      relations: ['seller', 'buyer'],
      order: { invoiceDate: 'DESC' },
    });
  }

  async getBuyerEligibleInvoicesByWallet(wallet: string): Promise<Invoice[]> {
  const customer = await this.customerRepository.findOne({
    where: { walletAddress: wallet },
  });

  if (!customer) return [];

  return this.invoiceRepository.find({
    where: {
      buyer: { id: customer.id },
      status: InvoiceStatus.FINALIZED,
      isClaimedForITC: false,
      // buyerApprovalDate: Not(IsNull()),
      // transactionHash: Not(IsNull()),
      // seller: { tenantId: Not(customer.companyTenantId) }, // prevent self-claim
    },
    relations: ['seller', 'buyer'],
    order: { invoiceDate: 'DESC' },
  });
}


    async getEligibleITCInvoice(wallet: string, eligible = false): Promise<Invoice[]> {
    const customer = await this.customerRepository.findOne({ where: { walletAddress: wallet } });
    if (!customer) return [];

    if (!eligible) {
      return this.invoiceRepository.find({
        where: { buyer: { id: customer.id } },
        relations: ['seller', 'buyer'],
        order: { createdAt: 'DESC' },
      });
    }

    // If eligible flag is true, return only invoices that are eligible for ITC claim:
    // - buyer is this customer
    // - status = FINALIZED
    // - buyerApprovalDate is set
    // - transactionHash is set (seller finalized on-chain)
    // - isClaimedForITC = false
    // - seller.tenantId != buyer.companyTenantId (exclude self-issued invoices)
    return this.invoiceRepository.find({
      where: {
        buyer: { id: customer.id },
        status: InvoiceStatus.FINALIZED,
        buyerApprovalDate: Not(IsNull()),
        transactionHash: Not(IsNull()),
        isClaimedForITC: false,
        seller: { tenantId: Not(customer.companyTenantId) },
      },
      relations: ['seller', 'buyer'],
      order: { invoiceDate: 'DESC' },
    });
  }

  // ============================================================
  // GET BUYER PENDING INVOICES BY WALLET
  // ============================================================
  async getBuyerPendingInvoices(wallet: string): Promise<Invoice[]> {
    const customer = await this.customerRepository.findOne({ where: { walletAddress: wallet } });
    if (!customer) return [];

    return this.invoiceRepository.find({
      where: { buyer: { id: customer.id }, status: InvoiceStatus.PENDING },
      relations: ['seller', 'buyer'],
      order: { createdAt: 'DESC' },
    });
  }

async getBuyerFinalizedInvoices(walletAddress: string): Promise<Invoice[]> {
  this.logger.log(`📥 Filtering FINALIZED and ITC_CLAIMED invoices for buyer.walletAddress = ${walletAddress}`);

  const invoices = await this.invoiceRepository.find({
    where: [
      {
        status: InvoiceStatus.FINALIZED,
        buyer: { walletAddress },
      },
      {
        status: InvoiceStatus.ITC_CLAIMED,
        buyer: { walletAddress },
      }
    ],
    relations: ['buyer', 'seller'],
  });

  this.logger.log(`📦 Found ${invoices.length} invoices for wallet: ${walletAddress}`);
  return invoices;
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


  // ============================================================
  // GET FINALIZED & NOT-ITC-CLAIMED INVOICES BY TENANT
  // ============================================================
  async findFinalizedUnclaimedByTenantId(tenantId: string): Promise<Invoice[]> {
    try {
      const invoices = await this.invoiceRepository.find({
        where: {
          seller: { tenantId },
          status: InvoiceStatus.FINALIZED,
          isClaimedForITC: false,
        },
        relations: ['seller', 'buyer'],
        order: { createdAt: 'DESC' },
      });

      return invoices || [];
    } catch (error) {
      this.logger.error(
        `Error fetching finalized & unclaimed invoices for tenantId ${tenantId}:`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch finalized unclaimed invoices');
    }
  }


}
