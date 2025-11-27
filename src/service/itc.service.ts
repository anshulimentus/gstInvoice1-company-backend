// service/itc.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { ItcClaim } from '../entities/itc-claim.entity';
import { Invoice } from '../entities/invoice.entity';
import { Company } from '../entities/company.entity';
import { InvoiceStatus } from '../enum/invoice-status.enum';
import { ItcClaimStatus } from '../enum/itc-claim-status.enum';

@Injectable()
export class ItcService {
  private readonly logger = new Logger(ItcService.name);

  constructor(
    @InjectRepository(ItcClaim)
    private readonly itcClaimRepo: Repository<ItcClaim>,

    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) { }

  /**
   * Create ITC claim after successful blockchain transaction
   */
  async createItcClaim(
    invoiceId: string,
    user: any,
    transactionHash: string
  ): Promise<ItcClaim> {
    const { walletAddress, tenant_id } = user;

    this.logger.log(`Creating ITC claim for invoice: ${invoiceId}, user: ${walletAddress}, txHash: ${transactionHash}`);

    // Validate transactionHash
    if (!transactionHash || transactionHash.trim() === '') {
      throw new BadRequestException('Transaction hash is required');
    }

    // 1️⃣ Find and validate invoice
    const invoice = await this.invoiceRepo.findOne({
      where: { invoiceId },
      relations: ['buyer', 'seller', 'itcClaim'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    // Check if ITC claim already exists
    if (invoice.itcClaim) {
      throw new BadRequestException('ITC already claimed for this invoice');
    }

    // 2️⃣ Check eligibility using database status
    const eligibility = await this.checkItcEligibility(invoice);
    if (!eligibility.eligible) {
      throw new BadRequestException(`Invoice not eligible for ITC: ${eligibility.reasons.join(', ')}`);
    }

    // 3️⃣ Verify claiming company is the buyer (using wallet address validation)
    // Note: Invoice eligibility is already validated through wallet address in the controller
    this.logger.log(`Claiming ITC for invoice ${invoiceId} by wallet ${walletAddress}, buyer company: ${invoice.buyer.companyTenantId}, user tenant: ${tenant_id}`);

    // 4️⃣ Check if already claimed
    if (invoice.isClaimedForITC) {
      throw new BadRequestException('ITC already claimed for this invoice');
    }

    // 5️⃣ Calculate claimable amount (only GST amount)
    const inputGst = Number(invoice.totalGstAmount);
    const outputGst = this.calculateOutputGst(invoice);
    const claimableAmount = Math.min(inputGst, outputGst);

    // 6️⃣ Create ITC claim
    const itcClaim = this.itcClaimRepo.create({
      invoiceId: invoice.invoiceId,
      companyId: tenant_id,
      companyWallet: walletAddress,
      inputGst,
      outputGst,
      claimableAmount,
      transactionHash,
      status: ItcClaimStatus.PROCESSED,
    });

    const savedClaim = await this.itcClaimRepo.save(itcClaim);

    // 7️⃣ Update invoice status in database
    try {
      invoice.isClaimedForITC = true;
      invoice.status = InvoiceStatus.ITC_CLAIMED;
      await this.invoiceRepo.save(invoice);
      this.logger.log(`✅ Invoice status updated to ITC_CLAIMED for ${invoice.invoiceNo}`);
    } catch (updateError) {
      this.logger.error(`❌ Failed to update invoice status for ${invoiceId}, but ITC claim was created:`, updateError);
      // Still return the claim since it was successfully created
    }

    this.logger.log(`✅ ITC claim created successfully for invoice ${invoice.invoiceNo}`);

    return savedClaim;
  }

  /**
   * Check ITC eligibility using database status only
   */
  private async checkItcEligibility(invoice: Invoice): Promise<{ eligible: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // Check database status
    if (invoice.status !== InvoiceStatus.FINALIZED) {
      reasons.push(`Invoice status must be FINALIZED. Current status: ${invoice.status}`);
    }

    if (invoice.isClaimedForITC) {
      reasons.push('ITC already claimed for this invoice');
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
   * Calculate output GST (simplified - based on sales)
   */
  private calculateOutputGst(invoice: Invoice): number {
    // In real scenario, this would come from your sales data
    // For demo, using a percentage of taxable value
    return invoice.totalTaxableValue * 0.18; // 18% output GST
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
   * Get proper ITC summary for company
   */
  async getCompanyItcSummary(companyTenantId: string) {
    try {
      // 1. Get all invoices where company is buyer (input GST from purchases)
      const buyerInvoices = await this.invoiceRepo.find({
        where: {
          buyer: { companyTenantId },
          status: InvoiceStatus.FINALIZED
        },
        relations: ['buyer', 'seller']
      });

      // 2. Get all ITC claims
      const claims = await this.itcClaimRepo.find({
        where: { companyId: companyTenantId },
        relations: ['invoice']
      });

      // 3. Calculate totals from invoices (only GST amount)
      const totalInputGST = buyerInvoices.reduce((sum, invoice) => {
        return sum + Number(invoice.totalGstAmount);
      }, 0);

      // 4. Calculate output GST from sales (simplified)
      const sellerInvoices = await this.invoiceRepo.find({
        where: {
          seller: { tenantId: companyTenantId },
          status: InvoiceStatus.FINALIZED
        }
      });

      const totalOutputGST = sellerInvoices.reduce((sum, invoice) => {
        return sum + (Number(invoice.totalTaxableValue) * 0.18);
      }, 0);

      // 5. Calculate claimed amount
      const totalClaimed = claims.reduce((sum, claim) => {
        return sum + Number(claim.claimableAmount);
      }, 0);

      // 6. Calculate claimable amount
      const maxClaimable = Math.min(totalInputGST, totalOutputGST);
      const totalClaimable = Math.max(0, maxClaimable - totalClaimed);

      const netITC = totalInputGST - totalOutputGST;

      this.logger.log('📊 ITC Summary Calculation:', {
        buyerInvoices: buyerInvoices.length,
        sellerInvoices: sellerInvoices.length,
        claims: claims.length,
        totalInputGST,
        totalOutputGST,
        totalClaimed,
        totalClaimable,
        netITC
      });

      return {
        totalClaims: claims.length,
        totalInputGST,
        totalOutputGST,
        totalClaimed,
        totalClaimable,
        netITC,
        buyerInvoiceCount: buyerInvoices.length,
        sellerInvoiceCount: sellerInvoices.length
      };
    } catch (error) {
      this.logger.error('Error calculating ITC summary:', error);
      return {
        totalClaims: 0,
        totalInputGST: 0,
        totalOutputGST: 0,
        totalClaimed: 0,
        totalClaimable: 0,
        netITC: 0,
        buyerInvoiceCount: 0,
        sellerInvoiceCount: 0
      };
    }
  }

  /**
   * Get eligible invoices for ITC claim
   * IMPORTANT: These are invoices where:
   * 1. Current company is the BUYER (received invoices) - NOT where they are the seller
   * 2. Buyer has APPROVED the invoice (buyerApprovalDate is set)
   * 3. Seller has FINALIZED it on-chain (transactionHash is set)
   * 4. Status is FINALIZED
   * 5. ITC has NOT been claimed yet (isClaimedForITC = false)
   */
  async getEligibleInvoicesForITC(companyTenantId: string): Promise<Invoice[]> {
    try {
      this.logger.log(`Fetching eligible invoices for tenant (buyer): ${companyTenantId}`);

      // First, check total invoices for this tenant as buyer
      const totalBuyerInvoices = await this.invoiceRepo.count({
        where: { buyer: { companyTenantId } }
      });
      this.logger.log(`Total buyer invoices for tenant ${companyTenantId}: ${totalBuyerInvoices}`);

      // Check approved invoices (buyer approval) where seller is NOT the same company
      const approvedInvoices = await this.invoiceRepo.count({
        where: {
          buyer: { companyTenantId },
          buyerApprovalDate: Not(IsNull()),
          seller: { tenantId: Not(companyTenantId) },
        }
      });
      this.logger.log(`Approved external buyer invoices for tenant ${companyTenantId}: ${approvedInvoices}`);

      // Check finalized invoices (seller finalization on-chain) where seller is NOT the same company
      const finalizedInvoices = await this.invoiceRepo.count({
        where: {
          buyer: { companyTenantId },
          status: InvoiceStatus.FINALIZED,
          transactionHash: Not(IsNull()),
          seller: { tenantId: Not(companyTenantId) },
        }
      });
      this.logger.log(`Finalized external buyer invoices for tenant ${companyTenantId}: ${finalizedInvoices}`);

      // Check unclaimed finalized invoices (external suppliers only)
      const unclaimedFinalized = await this.invoiceRepo.count({
        where: {
          buyer: { companyTenantId },
          status: InvoiceStatus.FINALIZED,
          transactionHash: Not(IsNull()),
          isClaimedForITC: false,
          seller: { tenantId: Not(companyTenantId) },
        }
      });
      this.logger.log(`Unclaimed finalized external buyer invoices for tenant ${companyTenantId}: ${unclaimedFinalized}`);

      // ✅ CRITICAL: Fetch ONLY invoices that meet ALL these criteria:
      // 1. Current company is the BUYER (received invoices) - NOT where they are the seller
      // 2. Buyer has APPROVED (buyerApprovalDate is set)
      // 3. Seller has FINALIZED on-chain (transactionHash is set)
      // 4. Status is FINALIZED
      // 5. Not yet claimed for ITC
      const invoices = await this.invoiceRepo.find({
        where: {
          buyer: { companyTenantId: companyTenantId }, // Current company is the BUYER
          status: InvoiceStatus.FINALIZED, // Invoice is finalized
          buyerApprovalDate: Not(IsNull()), // Buyer has approved
          transactionHash: Not(IsNull()), // Seller has finalized on-chain
          isClaimedForITC: false, // ITC not yet claimed
          seller: { tenantId: Not(companyTenantId) }, // Exclude invoices issued by same company
        },
        relations: ['seller', 'buyer'],
        order: { invoiceDate: 'DESC' }
      });

      this.logger.log(`✅ Found ${invoices.length} eligible invoices for ITC claim`);
      this.logger.log(`✅ Criteria: Current company is BUYER + Buyer Approved + Seller Finalized + ITC Not Claimed`);
      
      if (invoices.length > 0) {
        this.logger.log('Sample invoice:', {
          invoiceId: invoices[0].invoiceId,
          invoiceNo: invoices[0].invoiceNo,
          status: invoices[0].status,
          buyerApprovalDate: invoices[0].buyerApprovalDate,
          transactionHash: invoices[0].transactionHash,
          isClaimed: invoices[0].isClaimedForITC,
          buyerCompanyTenantId: invoices[0].buyer?.companyTenantId,
          sellerCompanyName: invoices[0].seller?.companyName,
          sellerTenantId: invoices[0].seller?.tenantId,
          verifyBuyer: invoices[0].buyer?.companyTenantId === companyTenantId ? 'BUYER ✅' : 'NOT BUYER ❌',
          verifyApproval: invoices[0].buyerApprovalDate ? 'APPROVED ✅' : 'NOT APPROVED ❌',
          verifyFinalization: invoices[0].transactionHash ? 'FINALIZED ✅' : 'NOT FINALIZED ❌'
          });
      }
      
      return invoices;
    } catch (error) {
      this.logger.error('Error fetching eligible invoices:', error);
      throw new InternalServerErrorException('Failed to fetch eligible invoices');
    }
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
      status: claim.status,
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
      if (!acc[month]) {
        acc[month] = {
          inputGST: 0,
          outputGST: 0,
          claimableAmount: 0,
          count: 0
        };
      }
      acc[month].inputGST += Number(claim.inputGst);
      acc[month].outputGST += Number(claim.outputGst);
      acc[month].claimableAmount += Number(claim.claimableAmount);
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalClaims: claims.length,
      monthlyBreakdown: Object.entries(monthlyBreakdown).map(([month, data]) => ({
        month,
        ...data
      })),
      averageClaim: claims.length > 0 ?
        claims.reduce((sum, claim) => sum + Number(claim.claimableAmount), 0) / claims.length : 0,
    };
  }

  /**
   * Get monthly ITC breakdown for dashboard
   */
  async getMonthlyItcBreakdown(companyTenantId: string) {
    const claims = await this.getCompanyItcClaims(companyTenantId);

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

    const result = Object.values(monthlyData).sort((a: any, b: any) => {
      const dateA = new Date(a.month + ' 1');
      const dateB = new Date(b.month + ' 1');
      return dateA.getTime() - dateB.getTime();
    });

    return result;
  }
}