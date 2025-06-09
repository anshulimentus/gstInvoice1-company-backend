


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
    
  } from '@nestjs/common';
  import { InvoiceService } from './invoice.service';
  import { CreateInvoiceDto } from './dto/create-invoice.dto';
  import { UpdateInvoiceDto } from './dto/update-invoice.dto';
  import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
  import { Response } from 'express';
  import { RolesGuard } from "src/auth/roles.guard";
  import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
  import { Roles } from "src/auth/roles.decorator";
  import { Role } from "src/users/roles.enum";
import { info } from 'console';
  
  
  @ApiTags('invoices')
  @Controller('invoices')
  export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}
  
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    @ApiOperation({ summary: 'Generate next invoice number' })
    @ApiResponse({ status: 200, description: 'Next invoice number generated' })
    @Get('next-invoice-no')
    async getNextInvoiceNo() {
      const invoiceNo = await this.invoiceService.generateInvoiceNumber();
      return { invoiceNo };
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