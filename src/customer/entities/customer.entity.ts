import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OneToMany } from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'bigint', nullable: false })
  stateCode: number;

  @Column({ type: 'int', default: 0 })
  totalInvoices: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalAmountBilled: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ nullable: true })
  transactionHash: string;

  @OneToMany(() => Invoice, (invoice) => invoice.buyer)
  invoices: Invoice[];

  @Column({ name: 'wallet_address', type: 'varchar', unique: true })
  wallet_address: string;

  @Column({ type: 'uuid' }) // Store the tenantId from Company
  company_tenant_id: string;

  @Column({ type: 'int', nullable: true })
  blockchainCustomerId: number;
}
