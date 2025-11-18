import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItcClaim } from '../entities/itc-claim.entity';
import { Invoice } from '../entities/invoice.entity';
import { Company } from '../entities/company.entity';
import { InvoiceStatus } from '../enum/invoice-status.enum';

@Injectable()
export class ItcService {
  constructor(
    @InjectRepository(ItcClaim)
    private readonly itcClaimRepo: Repository<ItcClaim>,

    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  /**
   * Create ITC claim for a finalized invoice
   */
  async createItcClaim(
    invoiceId: string, 
    user: any, 
    transactionHash: string
  ): Promise<ItcClaim> {
    const { walletAddress, tenant_id } = user;

    // 1️⃣ Find and validate invoice
    const invoice = await this.invoiceRepo.findOne({
      where: { invoiceId },
      relations: ['buyer', 'seller'],
    });

    if (!invoice) throw new NotFoundException(`Invoice ${invoiceId} not found`);
    
    // Check eligibility
    const eligibility = await this.checkItcEligibility(invoice);
    if (!eligibility.eligible) {
      throw new BadRequestException(`Invoice not eligible for ITC: ${eligibility.reasons.join(', ')}`);
    }

    // 2️⃣ Check if already claimed
    if (invoice.isClaimedForITC) {
      throw new BadRequestException('ITC already claimed for this invoice');
    }

    // 3️⃣ Verify claiming company is the buyer
    if (invoice.buyer.companyTenantId !== tenant_id) {
      throw new BadRequestException('Only the buyer company can claim ITC for this invoice');
    }

    // 4️⃣ Calculate claimable amounts
    const inputGst = Number(invoice.totalGstAmount);
    const outputGst = this.calculateOutputGst(invoice);
    const claimableAmount = inputGst - outputGst;

    // 5️⃣ Create ITC claim
    const itcClaim = this.itcClaimRepo.create({
      invoiceId: invoice.invoiceId,
      companyId: tenant_id,
      companyWallet: walletAddress,
      inputGst,
      outputGst,
      claimableAmount,
      transactionHash,
    });

    const savedClaim = await this.itcClaimRepo.save(itcClaim);

    // 6️⃣ Update invoice
    invoice.isClaimedForITC = true;
    invoice.status = InvoiceStatus.ITC_CLAIMED;
    await this.invoiceRepo.save(invoice);

    return savedClaim;
  }

  /**
   * Check ITC eligibility for invoice
   */
  private async checkItcEligibility(invoice: Invoice): Promise<{ eligible: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    if (invoice.status !== InvoiceStatus.FINALIZED) {
      reasons.push('Invoice not finalized');
    }

    if (!invoice.transactionHash) {
      reasons.push('Invoice not recorded on blockchain');
    }

    if (invoice.isClaimedForITC) {
      reasons.push('ITC already claimed');
    }

    if (invoice.totalGstAmount <= 0) {
      reasons.push('No GST amount available for claim');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Calculate output GST (simplified)
   */
  private calculateOutputGst(invoice: Invoice): number {
    return invoice.totalTaxableValue * 0.18; // Example: 18% output GST
  }

  /**
   * Get all ITC claims for a company
   */
  async getCompanyItcClaims(companyTenantId: string): Promise<ItcClaim[]> {
    return this.itcClaimRepo.find({
      where: { companyId: companyTenantId },
      relations: ['invoice', 'invoice.seller', 'invoice.buyer'],
      order: { claimedAt: 'DESC' },
    });
  }

  /**
   * Get ITC claim by ID
   */
  async getItcClaimById(claimId: string, companyTenantId: string): Promise<ItcClaim> {
    const claim = await this.itcClaimRepo.findOne({
      where: { id: claimId, companyId: companyTenantId },
      relations: ['invoice', 'invoice.seller', 'invoice.buyer'],
    });

    if (!claim) {
      throw new NotFoundException(`ITC claim ${claimId} not found`);
    }

    return claim;
  }

  /**
   * Get ITC summary for company dashboard
   */
  async getCompanyItcSummary(companyTenantId: string) {
    const claims = await this.getCompanyItcClaims(companyTenantId);

    const totalClaims = claims.length;
    const totalInputGst = claims.reduce((sum, claim) => sum + Number(claim.inputGst), 0);
    const totalOutputGst = claims.reduce((sum, claim) => sum + Number(claim.outputGst), 0);
    const totalClaimable = claims.reduce((sum, claim) => sum + Number(claim.claimableAmount), 0);

    return {
      totalClaims,
      totalInputGst,
      totalOutputGst,
      totalClaimable,
      netItc: totalInputGst - totalOutputGst,
    };
  }

  /**
   * Legacy method for compatibility
   */
  async claimForCompany(user: any): Promise<ItcClaim> {
    const { invoiceNo, transactionHash } = user.body || {};
    
    if (!invoiceNo || !transactionHash) {
      throw new BadRequestException('invoiceNo and transactionHash are required in request body');
    }

    // Find invoice by invoiceNo
    const invoice = await this.invoiceRepo.findOne({
      where: { invoiceNo },
      relations: ['buyer', 'seller'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with number ${invoiceNo} not found`);
    }

    return this.createItcClaim(invoice.invoiceId, user, transactionHash);
  }

  async getAllClaimsWithDetails(user: any) {
    const { tenant_id } = user;
    const claims = await this.getCompanyItcClaims(tenant_id);

    return claims.map((claim) => ({
      claimId: claim.id,
      invoiceNumber: claim.invoice?.invoiceNo ?? 'N/A',
      invoiceDate: claim.invoice?.invoiceDate ?? null,
      sellerName: claim.invoice?.seller?.companyName ?? 'N/A',
      inputGST: claim.inputGst,
      outputGST: claim.outputGst,
      claimableAmount: claim.claimableAmount,
      transactionHash: claim.transactionHash,
      claimedAt: claim.claimedAt,
    }));
  }

  async getSummaryForCompany(user: any) {
    const { tenant_id } = user;
    return this.getCompanyItcSummary(tenant_id);
  }

  async getDetailedItcAnalysis(user: any) {
    const { tenant_id } = user;
    const claims = await this.getCompanyItcClaims(tenant_id);

    const monthlyBreakdown = claims.reduce((acc, claim) => {
      const month = claim.claimedAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + Number(claim.claimableAmount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClaims: claims.length,
      monthlyBreakdown,
      averageClaim: claims.length > 0 ?
        claims.reduce((sum, claim) => sum + Number(claim.claimableAmount), 0) / claims.length : 0,
    };
  }

  /**
   * Get monthly ITC breakdown for dashboard
   */
  async getMonthlyItcBreakdown(companyTenantId: string) {
    const claims = await this.getCompanyItcClaims(companyTenantId);

    // Group claims by month
    const monthlyData = claims.reduce((acc, claim) => {
      const date = new Date(claim.claimedAt);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          inputGST: 0,
          outputGST: 0,
          netITC: 0
        };
      }

      acc[monthKey].inputGST += Number(claim.inputGst);
      acc[monthKey].outputGST += Number(claim.outputGst);
      acc[monthKey].netITC += Number(claim.claimableAmount);

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    const result = Object.values(monthlyData).sort((a: any, b: any) => {
      const dateA = new Date(a.month + ' 1');
      const dateB = new Date(b.month + ' 1');
      return dateA.getTime() - dateB.getTime();
    });

    return result;
  }
}