import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne, // Add this import
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Company } from './company.entity';
import { ItcClaim } from './itc-claim.entity'; // Make sure this import exists
import { InvoiceStatus } from '../enum/invoice-status.enum';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  invoiceId: string;

  @Column({ type: 'varchar', length: 255 })
  invoiceNo: string;

  @Column({ type: 'date' })
  invoiceDate: Date;

  @Column({ type: 'varchar', length: 255 })
  supplyType: string;

  @ManyToOne(() => Company, (company) => company.invoices, { eager: true })
  @JoinColumn({ name: 'seller_id' })
  seller: Company;

  @ManyToOne(() => Customer, (customer) => customer.invoices, { eager: true })
  @JoinColumn({ name: 'buyer_id' })
  buyer: Customer;

  @Column('decimal', { precision: 10, scale: 2 })
  totalTaxableValue: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalGstAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  grandTotal: number;

  @Column({ type: 'varchar', length: 255 })
  paymentTerms: string;

  @Column({ type: 'varchar', nullable: true })
  transactionHash: string;

  @Column({ type: 'boolean', default: false })
  isFinal: boolean;

  @Column('json')
  items: {
    serialNo: number;
    name: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    totalAmount: number;
  }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({ type: 'timestamp', nullable: true })
  buyerApprovalDate: Date;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'boolean', default: false })
  isClaimedForITC: boolean;

  // ✅ ADD THIS RELATIONSHIP - This was missing!
  @OneToOne(() => ItcClaim, (itcClaim) => itcClaim.invoice)
  itcClaim: ItcClaim;

  @Column({ type: 'varchar', nullable: true })
  placeOfSupply: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;
}