import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
  IsOptional,
} from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  placeOfSupply: string;

  @IsDateString()
  dueDate: string;

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

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsNotEmpty()
  totalTaxableValue: number;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsNotEmpty()
  totalGstAmount: number;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsNotEmpty()
  grandTotal: number;

  @IsString()
  @IsNotEmpty()
  paymentTerms: string;

  @IsString()
  @IsOptional()
  transactionHash?: string;

  @IsBoolean()
  isFinal: boolean;
}
