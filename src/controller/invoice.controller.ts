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
} from '@nestjs/common';
import { InvoiceService } from '../service/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enum/roles.enum';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User)
export class InvoiceController {
  constructor(private readonly service: InvoiceService) { }

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

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Mark invoice as finalized after on-chain transaction' })
  async finalize(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('transactionHash') txHash: string,
  ) {
    return this.service.markInvoiceOnChainFinalized(id, txHash);
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

  @Patch('buyer/approve/:invoiceNo')
  @ApiOperation({ summary: 'Buyer approves invoice' })
  async approve(@Param('invoiceNo') invoiceNo: string, @Request() req: any) {
    return this.service.approveInvoiceByBuyer(invoiceNo, req.user.walletAddress);
  }

  @Patch('buyer/reject/:invoiceNo')
  @ApiOperation({ summary: 'Buyer rejects invoice' })
  async reject(@Param('invoiceNo') invoiceNo: string, @Request() req: any) {
    return this.service.rejectInvoiceByBuyer(invoiceNo, req.user.walletAddress);
  }

  @Get('buyer/stats/:wallet')
  @ApiOperation({ summary: 'Get buyer invoice stats' })
  async stats(@Param('wallet') wallet: string) {
    return this.service.getBuyerInvoiceStats(wallet);
  }

  @Get('buyer/wallet/:wallet')
  @ApiOperation({ summary: 'Get invoices for buyer by wallet address' })
  async getBuyerInvoices(@Param('wallet') wallet: string) {
    return this.service.getBuyerInvoices(wallet);
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

  @Get('eligible-itc')
  @ApiOperation({ summary: 'Get invoices eligible for ITC claim' })
  async getEligibleItcInvoices(@Request() req: any) {
    console.log('getEligibleItcInvoices called by user:', req.user);
    return this.service.getEligibleItcInvoices(req.user.tenant_id);
  }
}
