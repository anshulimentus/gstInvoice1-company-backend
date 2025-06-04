import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    productName?: string;

    @IsOptional()
    @IsNumber()
    gstRate?: number;

    @IsOptional()
    @IsString()
    productDescription?: string;

    @IsOptional()
    @IsString()
    transactionHash?: string;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsString()
    image_id?: string;
    
    @IsOptional()
    @IsString()
    service?: string;

    @IsOptional()
    @IsNumber()
    unitPrice?: number;
}
