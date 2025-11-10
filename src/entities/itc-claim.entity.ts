import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Company } from './company.entity';

@Entity('itc_claims')
export class ItcClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  @OneToOne(() => Invoice, (invoice) => invoice.itcClaim)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.itcClaims)
  @JoinColumn({ name: 'company_id', referencedColumnName: 'tenantId' })
  company: Company;

  @Column({ type: 'varchar', length: 255 })
  companyWallet: string;

  @Column('numeric', { precision: 12, scale: 2, name: 'input_gst' })
  inputGst: number;

  @Column('numeric', { precision: 12, scale: 2, name: 'output_gst' })
  outputGst: number;

  @Column('numeric', { precision: 12, scale: 2, name: 'claimable_amount' })
  claimableAmount: number;

  @Column({ type: 'varchar', length: 255 })
  transactionHash: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  claimedAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}