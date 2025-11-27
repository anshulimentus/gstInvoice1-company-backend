import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Length,
  IsUUID,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @Length(15, 15, { message: 'GST number must be exactly 15 characters' })
  gstNumber: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  stateId?: number;

  @IsOptional()
  categoryId?: number;
}
