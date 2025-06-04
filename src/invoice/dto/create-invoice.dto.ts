import { IsString, IsNotEmpty, IsNumber, IsDateString, IsBoolean, IsArray, ValidateNested, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {

  @IsNumber()
  @IsNotEmpty()
  serialNo: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  gstRate: number;

  @IsNumber()
  @IsNotEmpty()
  totalAmount: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNo: string;

  @IsDateString()
  invoiceDate: string;

  @IsString()
  @IsNotEmpty()
  supplyType: string;
  
  @IsUUID()
  @IsNotEmpty()
  buyerId: string;

  @IsNumber()
  @IsNotEmpty()
  sellerId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @IsNotEmpty()
  totalTaxableValue: number;

  @IsNumber()
  @IsNotEmpty()
  totalGstAmount: number;

  @IsNumber()
  @IsNotEmpty()
  grandTotal: number;

  @IsString()
  @IsNotEmpty()
  paymentTerms: string;

  @IsBoolean()
  isFinal: boolean;
}