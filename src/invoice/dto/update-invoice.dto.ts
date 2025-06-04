import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsNumber()
  @IsOptional()
  serialNo?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  gstRate?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;
}

export class UpdateInvoiceDto {
  @IsString()
  @IsOptional()
  invoiceNo?: string;

  @IsDateString()
  @IsOptional()
  invoiceDate?: string;

  @IsString()
  @IsOptional()
  supplyType?: string;

  @IsUUID()
  @IsOptional()
  buyerId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number) 
  sellerId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsOptional()
  items?: InvoiceItemDto[];

  @IsNumber()
  @IsOptional()
  totalTaxableValue?: number;

  @IsNumber()
  @IsOptional()
  totalGstAmount?: number;

  @IsNumber()
  @IsOptional()
  grandTotal?: number;


  @IsString()
  @IsOptional()
  paymentTerms?: string;


  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;

  @IsString()
  @IsOptional()
  transactionHash?: string;
}