import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    UseGuards, 
    Request,
    Param,
    HttpException,
    HttpStatus
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { ITCService } from './itc.service';
  import {
    CreateITCRecordDto,
    ClaimITCDto,
    BulkClaimITCDto,
    ApproveITCDto,
    RejectITCDto
  } from './dto/itc.dto';
  
  @ApiTags('ITC Management')
  @Controller('itc')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  export class ITCController {
    constructor(private readonly itcService: ITCService) {}
  
    @Post('process-invoice')
    @ApiOperation({ summary: 'Process invoice for ITC calculation' })
    @ApiResponse({ status: 201, description: 'Invoice processed successfully' })
    async processInvoiceForITC(@Body() invoiceData: any, @Request() req) {
      return this.itcService.processInvoiceForITC(invoiceData, req.user);
    }
  
    @Post('create-record')
    @ApiOperation({ summary: 'Create ITC record manually' })
    @ApiResponse({ status: 201, description: 'ITC record created successfully' })
    async createITCRecord(@Body() createITCDto: CreateITCRecordDto, @Request() req) {
      console.log('Creating ITC record:', createITCDto);
      return this.itcService.createITCRecord(createITCDto, req.user);
    }
  
    @Post('claim')
    @ApiOperation({ summary: 'Claim ITC for a specific invoice' })
    @ApiResponse({ status: 200, description: 'ITC claimed successfully' })
    async claimITC(@Body() claimITCDto: ClaimITCDto, @Request() req) {
      return this.itcService.claimITC(claimITCDto, req.user);
    }
  
    @Post('bulk-claim')
    @ApiOperation({ summary: 'Bulk claim multiple ITCs' })
    @ApiResponse({ status: 200, description: 'Bulk ITC claim processed' })
    async bulkClaimITC(@Body() bulkClaimDto: BulkClaimITCDto, @Request() req) {
      return this.itcService.bulkClaimITC(bulkClaimDto, req.user);
    }
  
    @Get('summary')
    @ApiOperation({ summary: 'Get company ITC summary' })
    @ApiResponse({ status: 200, description: 'ITC summary retrieved successfully' })
    async getCompanySummary(@Request() req) {
      return this.itcService.getCompanySummary(req.user);
    }
  
    @Get('claimable')
    @ApiOperation({ summary: 'Get claimable ITC invoices' })
    @ApiResponse({ status: 200, description: 'Claimable ITCs retrieved successfully' })
    async getClaimableITCs(@Request() req) {
      return this.itcService.getClaimableITCs(req.user);
    }
  
    @Get('claimable-amount')
    @ApiOperation({ summary: 'Get total claimable amount' })
    @ApiResponse({ status: 200, description: 'Total claimable amount retrieved successfully' })
    async getTotalClaimableAmount(@Request() req) {
      const amount = await this.itcService.getTotalClaimableAmount(req.user);
      return { totalClaimableAmount: amount };
    }
  
    @Get('record/:invoiceNumber')
    @ApiOperation({ summary: 'Get ITC record by invoice number' })
    @ApiResponse({ status: 200, description: 'ITC record retrieved successfully' })
    async getITCRecord(@Param('invoiceNumber') invoiceNumber: string, @Request() req) {
      return this.itcService.getITCRecord(invoiceNumber, req.user);
    }
  
    @Post('approve')
    @ApiOperation({ summary: 'Approve ITC claim (Admin only)' })
    @ApiResponse({ status: 200, description: 'ITC approved successfully' })
    async approveITC(@Body() approveDto: ApproveITCDto, @Request() req) {
      // Add admin role check here
      if (req.user.role !== 'admin') {
        throw new HttpException('Only admins can approve ITC', HttpStatus.FORBIDDEN);
      }
      return this.itcService.approveITC(approveDto);
    }
  
    @Post('reject')
    @ApiOperation({ summary: 'Reject ITC claim (Admin only)' })
    @ApiResponse({ status: 200, description: 'ITC rejected successfully' })
    async rejectITC(@Body() rejectDto: RejectITCDto, @Request() req) {
      // Add admin role check here
      if (req.user.role !== 'admin') {
        throw new HttpException('Only admins can reject ITC', HttpStatus.FORBIDDEN);
      }
      return this.itcService.rejectITC(rejectDto);
    }
  }