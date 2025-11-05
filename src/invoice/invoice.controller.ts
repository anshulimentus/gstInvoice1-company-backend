


import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  ParseUUIDPipe,
  Res,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  Request
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { RolesGuard } from "../auth/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { Role } from "../users/roles.enum";
import { Customer } from '../customer/entities/customer.entity';
import { info } from 'console';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';


@ApiTags('invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly invoiceService: InvoiceService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createInvoiceDto: CreateInvoiceDto) {
    return await this.invoiceService.createInvoice(createInvoiceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'List of all invoices' })
  async findAll() {
    return await this.invoiceService.findAll();
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.invoiceService.findOne(id);
  }

  @Get('buyer/wallet/:walletAddress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get all invoices for a buyer by wallet address' })
  @ApiParam({ name: 'walletAddress', description: 'Wallet address of the buyer' })
  @ApiResponse({ status: 200, description: 'List of invoices for the buyer' })
  @ApiResponse({ status: 404, description: 'No invoices found for this wallet address' })
  async findInvoicesByBuyerWallet(@Param('walletAddress') walletAddress: string) {
    // console.log(`Fetching invoices for buyer wallet: ${walletAddress}`);
    return await this.invoiceService.findInvoicesByBuyerWallet(walletAddress);
  }

  @Get('buyer/wallet/:walletAddress/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get pending invoices for a buyer by wallet address' })
  @ApiParam({ name: 'walletAddress', description: 'Wallet address of the buyer' })
  @ApiResponse({ status: 200, description: 'List of pending invoices for the buyer' })
  @ApiResponse({ status: 404, description: 'No pending invoices found for this wallet address' })
  async findPendingInvoicesByBuyerWallet(@Param('walletAddress') walletAddress: string) {
    // console.log(`Fetching pending invoices for buyer wallet: ${walletAddress}`);
    return await this.invoiceService.findPendingInvoicesByBuyerWallet(walletAddress);
  }

  @Patch('buyer/approve/:invoiceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Approve invoice by buyer' })
  @ApiParam({ name: 'invoiceId', description: 'Invoice UUID' })
  // ❌ Removed walletAddress as Param — it's coming from JWT now
  @ApiResponse({ status: 200, description: 'Invoice approved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to approve this invoice' })
  async approveInvoiceByBuyer(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Request() req: any
  ) {
    const buyerWalletAddress = req.user.walletAddress; // ✅ JWT extraction
    return await this.invoiceService.approveInvoiceByBuyer(invoiceId, buyerWalletAddress);
  }
  

  @Patch('buyer/reject/:invoiceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Reject invoice by buyer' })
  @ApiParam({ name: 'invoiceId', description: 'Invoice UUID' })
  @ApiParam({ name: 'walletAddress', description: 'Wallet address of the buyer' })
  @ApiResponse({ status: 200, description: 'Invoice rejected successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 403, description: 'Not authorized to reject this invoice' })
  async rejectInvoiceByBuyer(
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Request() req: any
  ) {
    // Get wallet address from JWT token or request body
    const buyerWalletAddress = req.user.walletAddress; // Assuming wallet address is in JWT
    return await this.invoiceService.rejectInvoiceByBuyer(invoiceId, buyerWalletAddress);
  }

  @Get('buyer/wallet/:walletAddress/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get invoice statistics for a buyer by wallet address' })
  @ApiParam({ name: 'walletAddress', description: 'Wallet address of the buyer' })
  @ApiResponse({ status: 200, description: 'Invoice statistics for the buyer' })
  @ApiResponse({ status: 404, description: 'Buyer not found' })
  async getBuyerInvoiceStatistics(@Param('walletAddress') walletAddress: string) {
    // console.log(`Fetching invoice statistics for buyer wallet: ${walletAddress}`);
    return await this.invoiceService.getBuyerInvoiceStats(walletAddress);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Download invoice as PDF' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'PDF file downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async downloadInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.invoiceService.generateInvoicePDF(id);
    const invoice = await this.invoiceService.findOne(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice_${invoice.invoiceNo}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }



  @Get('seller/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get all invoices for a seller by tenantId' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID of the seller (UUID)' })
  @ApiResponse({ status: 200, description: 'List of invoices for the seller' })
  @ApiResponse({ status: 404, description: 'No invoices found for this tenant ID' })

  async findInvoicesByTenantId(@Param('tenantId') tenantId: string) {
    info(`Fetching invoices for tenant ID: ${tenantId}`);
    return await this.invoiceService.findInvoicesByTenantId(tenantId);
  }


  @Get('invoice-number/:invoiceNo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get invoice by invoice number' })
  @ApiParam({ name: 'invoiceNo', description: 'Invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findByInvoiceNo(@Param('invoiceNo') invoiceNo: string) {
    return await this.invoiceService.findByInvoiceNo(invoiceNo);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Update invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return await this.invoiceService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Delete invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 204, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.invoiceService.deleteInvoice(id);
  }

  // Blockchain specific endpoints
  @Get('blockchain/:invoiceNo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get invoice from blockchain' })
  @ApiParam({ name: 'invoiceNo', description: 'Invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice data from blockchain' })
  @ApiResponse({ status: 404, description: 'Invoice not found on blockchain' })
  async getFromBlockchain(@Param('invoiceNo') invoiceNo: string) {
    return await this.invoiceService.getInvoiceFromBlockchain(invoiceNo);
  }

  @Get('blockchain/total/count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get total invoices count from blockchain' })
  @ApiResponse({ status: 200, description: 'Total invoices count' })
  async getTotalFromBlockchain() {
    return await this.invoiceService.getTotalInvoicesFromBlockchain();
  }

  @Post('sync/:invoiceNo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Sync invoice with blockchain' })
  @ApiParam({ name: 'invoiceNo', description: 'Invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice synced successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async syncWithBlockchain(@Param('invoiceNo') invoiceNo: string) {
    return await this.invoiceService.syncWithBlockchain(invoiceNo);
  }
}