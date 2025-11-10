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
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.User)
export class InvoiceController {
  constructor(private readonly service: InvoiceService) {}

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
  async approve(@Param('invoiceId') invoiceId: string, @Request() req: any) {
    return this.service.approveInvoiceByBuyer(invoiceId, req.user.walletAddress);
  }

  @Patch('buyer/reject/:invoiceId')
  @ApiOperation({ summary: 'Buyer rejects invoice' })
  async reject(@Param('invoiceId') invoiceId: string, @Request() req: any) {
    return this.service.rejectInvoiceByBuyer(invoiceId, req.user.walletAddress);
  }

  @Get('buyer/stats/:wallet')
  @ApiOperation({ summary: 'Get buyer invoice stats' })
  async stats(@Param('wallet') wallet: string) {
    return this.service.getBuyerInvoiceStats(wallet);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete invoice' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteInvoice(id);
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