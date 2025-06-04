import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    name ?: string;

    @IsOptional()
    @IsString()
    email ?: string;

    @IsOptional()
    @IsString()
    gstNumber?: string;

    @IsOptional()
    @IsString()
    phone ?: string;

    @IsOptional()
    @IsString()
    billingAddress?: string;

    @IsOptional()
    @IsString()
    createdAt: Date;
}