import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString } from 'class-validator';
import { IsNotEmpty, IsEthereumAddress } from 'class-validator';

@Entity('customer')
export class CreateCustomerDto {
  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: false })
  gstNumber: string;

  @Column({ type: 'varchar', length: 10, unique: true, nullable: true })
  panNumber: string;

  @Column({ type: 'enum', enum: ['individual', 'business'], nullable: false })
  customerType: 'individual' | 'business';

  @Column({ type: 'text', nullable: false })
  billingAddress: string;

  @Column({ type: 'bigint', length: 100, nullable: false })
  stateCode: number;

  @Column({ type: 'int', default: 0 })
  totalInvoices: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalAmountBilled: number;

  @IsNotEmpty()
  @IsEthereumAddress({ message: 'Invalid Ethereum address' }) // Ensure valid blockchain address
  wallet_address: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @IsString()
  company_tenant_id: string;
}
