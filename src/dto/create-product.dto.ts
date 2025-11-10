import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductType } from '../enum/product-type.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  gstRate: number;

  @IsString()
  @IsNotEmpty()
  productDescription: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Type(() => Number)
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Type(() => Number)
  finalPrice?: number; // auto-calculated, optional in payload

  @IsEnum(ProductType)
  @IsNotEmpty()
  type: ProductType;

  @IsOptional()
  @IsNumber()
  blockchainProductId?: number;

  @IsUUID()
  company_tenant_id: string;
}
