import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Request,
  Res,
  BadRequestException
} from '@nestjs/common';
import { InvoiceService } from '../service/invoice.service';
import { ItcService } from '../service/itc.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enum/roles.enum';
import { InvoiceStatus } from '../enum/invoice-status.enum';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User)
export class InvoiceController {
  constructor(
    private readonly service: InvoiceService,
    private readonly itcService: ItcService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  async create(@Body() dto: CreateInvoiceDto) {
    return this.service.createInvoice(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice status or ITC claim flag' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInvoiceDto) {
    return this.service.updateInvoice(id, dto);
  }

  @Patch(':id/itc-claimed')
  @ApiOperation({ summary: 'Mark invoice as ITC claimed' })
  async markItcClaimed(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.markInvoiceItcClaimed(id);
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Update invoice after blockchain finalization' })
  async finalizeOnChain(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { transactionHash: string },
    @Request() req: any,
  ) {
    return this.service.finalizeInvoiceOnChain(id, body.transactionHash, req.user.walletAddress);
  }

  @Get('eligible-invoices')
  @ApiOperation({ summary: 'Get eligible invoices for ITC claim (Status: FINALIZED + isClaimedForITC: false + Buyer Approved + Seller Finalized on-chain)' })
  async getEligibleInvoices(@Request() req: any) {
    try {
      // Fetch invoices where:
      // 1. Current company is the BUYER (received invoices)
      // 2. Status is FINALIZED
      // 3. isClaimedForITC is false (not yet claimed)
      // 4. Buyer has approved (buyerApprovalDate is set)
      // 5. Seller has finalized on-chain (transactionHash is set)
      const eligibleInvoices = await this.itcService.getEligibleInvoicesForITC(req.user.tenant_id);
      
      // Additional client-side filtering to ensure criteria are met
      const filtered = eligibleInvoices.filter(inv => 
        inv.status === InvoiceStatus.FINALIZED && 
        inv.isClaimedForITC === false
      );

      return {
        success: true,
        data: filtered,
        count: filtered.length,
        criteria: {
          buyerTenantId: req.user.tenant_id,
          status: InvoiceStatus.FINALIZED,
          isClaimedForITC: false,
          requiresBuyerApproval: true,
          requiresSellerFinalization: true
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/check-itc-eligibility')
  @ApiOperation({ summary: 'Check if invoice is eligible for ITC claim' })
  async checkItcEligibility(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.checkItcEligibility(id);
  }

  @Patch('buyer/approve/:invoiceId')
  @ApiOperation({ summary: 'Buyer approves invoice' })
  async approve(@Param('invoiceId', ParseUUIDPipe) invoiceId: string, @Request() req: any) {
    return this.service.approveInvoiceByBuyer(invoiceId, req.user.walletAddress);
  }

  @Patch('buyer/reject/:invoiceId')
  @ApiOperation({ summary: 'Buyer rejects invoice' })
  async reject(@Param('invoiceId', ParseUUIDPipe) invoiceId: string, @Request() req: any) {
    return this.service.rejectInvoiceByBuyer(invoiceId, req.user.walletAddress);
  }

  @Get('buyer/stats/:wallet')
  @ApiOperation({ summary: 'Get buyer invoice stats' })
  async stats(@Param('wallet') wallet: string) {
    return this.service.getBuyerInvoiceStats(wallet);
  }

  @Get('seller/:tenantId/finalized-unclaimed')
  @ApiOperation({
    summary: 'Get finalized invoices not yet claimed for ITC for a seller by tenantId',
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID of the seller (UUID)' })
  async findFinalizedUnclaimedByTenantId(@Param('tenantId') tenantId: string) {
    return this.service.findFinalizedUnclaimedByTenantId(tenantId);
  }


  @Get('buyer/wallet/:wallet')
  @ApiOperation({ summary: 'Get invoices for buyer by wallet address (optional ?eligible=true for eligible ITC invoices)' })
  async getBuyerInvoices(@Param('wallet') wallet: string, @Request() req: any) {
    const eligible = req?.query?.eligible === 'true';
    return this.service.getBuyerInvoices(wallet, eligible);
  }

    @Get('buyer/wallet/:wallet')
  @ApiOperation({ summary: 'Get invoices for buyer by wallet address (optional ?eligible=true for eligible ITC invoices)' })
  async getEligibleITCInvoice(@Param('wallet') wallet: string, @Request() req: any) {
    const eligible = req?.query?.eligible === 'true';
    return this.service.getEligibleITCInvoice(wallet, eligible);
  }

  @Get('buyer/eligible-itc')
@ApiOperation({ summary: 'Get finalized and unclaimed invoices for authenticated buyer' })
async getEligibleInvoicesForBuyer(@Request() req: any) {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    throw new BadRequestException('Invalid user tenant in JWT');
  }

  // Fetch all invoices where this company is the BUYER (received invoices)
  const buyerInvoices = await this.service.findBuyerInvoicesByTenantId(tenantId);

  // Return only invoices that are finalized and not yet claimed for ITC
  const filtered = buyerInvoices.filter(
    (inv) => inv.status === InvoiceStatus.FINALIZED && inv.isClaimedForITC === false,
  );

  return {
    success: true,
    data: filtered,
    count: filtered.length,
  };
}



  @Get('buyer/wallet/:wallet/statistics')
  @ApiOperation({ summary: 'Get buyer invoice statistics' })
  async getBuyerStatistics(@Param('wallet') wallet: string) {
    return this.service.getBuyerInvoiceStats(wallet);
  }

  @Get('buyer/wallet/:wallet/pending')
  @ApiOperation({ summary: 'Get pending invoices for buyer by wallet address' })
  async getBuyerPendingInvoices(@Param('wallet') wallet: string) {
    return this.service.getBuyerPendingInvoices(wallet);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteInvoice(id);
  }

  @Get('seller/:tenantId')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.User)
  @ApiOperation({ summary: 'Get all invoices for a seller by tenantId' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID of the seller (UUID)' })
  async findInvoicesByTenantId(@Param('tenantId') tenantId: string) {
    return await this.service.findInvoicesByTenantId(tenantId);
  }

  @Get('buyer/:tenantId')
  @ApiOperation({ 
    summary: 'Get all invoices for a buyer/recipient by tenantId (Invoices received from suppliers)' 
  })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID of the buyer/recipient company (UUID)' })
  async findBuyerInvoicesByTenantId(@Param('tenantId') tenantId: string) {
    return await this.service.findBuyerInvoicesByTenantId(tenantId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download invoice PDF' })
  async download(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const pdf = await this.service.generateInvoicePDF(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice_${id}.pdf`,
    });
    res.end(pdf);
  }

}
