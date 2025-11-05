import {
  IsBase64,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Type(() => Number)
  gstRate: number;

  @IsNotEmpty()
  @IsString()
  productDescription: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Type(() => Number)
  unitPrice: number;

  // here i have changed
  @IsString()
  company_tenant_id: string;
}
