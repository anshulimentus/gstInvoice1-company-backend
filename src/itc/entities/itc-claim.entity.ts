import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('itc_claims')
export class ItcClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({name: 'invoice_id'})
  invoiceId: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'company_wallet' })
  companyWallet: string;

  @Column('numeric', { precision: 12, scale: 2, name: 'input_gst' })
  inputGst: number;

  @Column('numeric', { precision: 12, scale: 2,  name: 'output_gst' })
  outputGst: number;

  @Column('numeric', { precision: 12, scale: 2, name: 'claimable_amount' })
  claimableAmount: number;

  @Column({ name: 'transaction_hash' })
  transactionHash: string;

  @CreateDateColumn({ name: 'claimed_at', type: 'timestamp with time zone' })
  claimedAt: Date;
}
