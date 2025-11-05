// src/invoice/dto/buyer-invoice-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class BuyerInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  walletAddress: string;
}

export class InvoiceStatisticsDto {
  @ApiProperty()
  totalInvoices: number;

  @ApiProperty()
  pendingInvoices: number;

  @ApiProperty()
  approvedInvoices: number;

  @ApiProperty()
  rejectedInvoices: number;

  @ApiProperty()
  totalApprovedAmount: number;
}

export class BuyerInvoiceStatsResponseDto {
  @ApiProperty({ type: BuyerInfoDto })
  customer: BuyerInfoDto;

  @ApiProperty({ type: InvoiceStatisticsDto })
  statistics: InvoiceStatisticsDto;
}

export class InvoiceApprovalResponseDto {
  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  invoiceNo: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  buyerApprovalDate: Date;

  @ApiProperty()
  approvedBy: string;

  @ApiProperty()
  message: string;
}
