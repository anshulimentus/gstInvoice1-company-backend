import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { CustomerType } from '../enum/customer-type.enum';
import { Company } from './company.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 15 })
  gstNumber: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  panNumber: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.INDIVIDUAL,
  })
  customerType: CustomerType;

  @Column({ type: 'text' })
  billingAddress: string;

  @Column({ type: 'int' })
  stateCode: number;

  @Column({ type: 'int', default: 0 })
  totalInvoices: number;

  @Column({ type: 'int', default: 0 })
  totalAmountBilled: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  transactionHash: string;

  @Column({ type: 'varchar', length: 255 })
  walletAddress: string;

  @Column({ type: 'int', nullable: true })
  blockchainCustomerId: number;

  // Relationships
  @OneToMany(() => Invoice, (invoice) => invoice.buyer)
  invoices: Invoice[];

  @ManyToOne(() => Company, (company) => company.customers)
  @JoinColumn({ name: 'company_tenant_id', referencedColumnName: 'tenantId' })
  company: Company;

  @Column({ type: 'uuid' })
  companyTenantId: string;
}
