import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Company } from 'src/company/entities/company.entity';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  invoiceId: string;

  @Column({ name: 'invoicenumber' })
  invoiceNo: string;

  @Column({ name: 'invoicedate', type: 'date' })
  invoiceDate: Date;

  @Column({ name: 'supplyType' })
  supplyType: string;

  @ManyToOne(() => Company, (company) => company.invoices, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller: Company;

  @ManyToOne(() => Customer, (customer) => customer.invoices, { eager: true })
  @JoinColumn({ name: 'buyerId' })
  buyer: Customer;

  @Column('decimal', { name: 'totalamount', precision: 10, scale: 2 })
  totalTaxableValue: number;

  @Column('decimal', { name: 'gstamount', precision: 10, scale: 2 })
  totalGstAmount: number;

  @Column('decimal', { name: 'grandtotal', precision: 10, scale: 2 })
  grandTotal: number;

  @Column({ name: 'paymentTerms' })
  paymentTerms: string;

  @Column({ name: 'transactionHash', nullable: true })
  transactionHash: string;

  @Column({ name: 'isFinal' })
  isFinal: boolean;

  @Column('json', { name: 'items' })
  items: {
    serialNo: number,
    name: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    totalAmount: number;
  }[];

  @CreateDateColumn({ name: 'createdat' })
  createdAt: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ nullable: true })
  buyerApprovalDate: Date;

  @Column({ nullable: true })
  approvedBy: string; 
}
