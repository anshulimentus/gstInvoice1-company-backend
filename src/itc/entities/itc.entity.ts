import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('itc_claims')
export class Itc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column('decimal', { name: 'gst_amount', precision: 12, scale: 2 })
  gstAmount: number;

  @Column({ name: 'claim_status', default: 'pending' })
  claimStatus: 'pending' | 'claimed' | 'rejected';

  @Column({ name: 'claim_date', type: 'timestamp', nullable: true })
  claimDate: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
