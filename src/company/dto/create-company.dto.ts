import { IsString, IsEthereumAddress, IsOptional, IsEmail, MinLength, IsNotEmpty, IsInt, IsUrl, Matches } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty()
  @IsString()
  gstNumber: string;

  @IsNotEmpty()
  @IsInt()
  categoryID: number;

  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address' }) // Ensure valid blockchain address
  legalRepresentative: string;

  @IsNotEmpty()
  @IsString()
  addressline1: string; // Company's physical address

  @IsString()
  addressline2: string; // Company's physical address

  @IsString()
  district: string; // Company's district

  @IsInt()
  stateID: number; // Company's state ID

}  
