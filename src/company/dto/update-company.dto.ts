import { IsString, IsOptional, IsInt, IsEmail, MinLength, IsUrl } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  legalRepresentative?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  image_id?: string;

  // ✅ Address fields (used for constructing `address`)
  @IsOptional()
  @IsString()
  addressline1?: string;

  @IsOptional()
  @IsString()
  addressline2?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsInt()
  stateID?: number;

  @IsOptional()
  @IsInt()
  categoryID?: number;
}
