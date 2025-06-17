import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateITCRecordDto {
  @ApiProperty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  companyWallet: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  inputGST: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  outputGST: number;

  @ApiProperty()
  @IsBoolean()
  isApproved: boolean;
}

export class ClaimITCDto {
  @ApiProperty()
  @IsString()
  invoiceNumber: string;
}

export class BulkClaimITCDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  invoiceNumbers: string[];
}

export class ApproveITCDto {
  @ApiProperty()
  @IsString()
  invoiceNumber: string;
}

export class RejectITCDto {
  @ApiProperty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @IsString()
  reason: string;
}

// Interface for ITC Record
export interface ITCRecord {
  invoiceNumber: string;
  companyId: string;
  companyWallet: string;
  inputGST: number;
  outputGST: number;
  netITC: number;
  claimableAmount: number;
  claimedAmount: number;
  timestamp: number;
  isApproved: boolean;
  isClaimed: boolean;
  status: string;
}

export interface ITCSummary {
  totalInputGST: number;
  totalOutputGST: number;
  totalClaimableITC: number;
  totalClaimedITC: number;
  pendingITC: number;
  recordCount: number;
}
