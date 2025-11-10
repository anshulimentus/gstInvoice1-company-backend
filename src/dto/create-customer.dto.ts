import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  IsEthereumAddress,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  @IsString()
  @Length(10, 15, { message: 'Phone number must be between 10–15 digits' })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @Length(15, 15, { message: 'GST number must be exactly 15 characters' })
  gstNumber: string;

  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'PAN number must be exactly 10 characters' })
  panNumber?: string;

  @IsEnum(CustomerType, {
    message: 'customerType must be either "individual" or "business"',
  })
  customerType: CustomerType;

  @IsString()
  @IsNotEmpty()
  billingAddress: string;

  @IsNumber({}, { message: 'stateCode must be a valid number' })
  @Min(1, { message: 'stateCode must be a positive number' })
  stateCode: number;

  @IsOptional()
  @IsNumber()
  totalInvoices?: number;

  @IsOptional()
  @IsNumber()
  totalAmountBilled?: number;

  @IsEthereumAddress({ message: 'Invalid Ethereum wallet address' })
  walletAddress: string;

  @IsUUID('4', { message: 'Invalid companyTenantId UUID format' })
  companyTenantId: string;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsOptional()
  @IsNumber()
  blockchainCustomerId?: number;
}
