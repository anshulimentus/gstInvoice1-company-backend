import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('itc_claims')
export class ItcClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceId: string;

  @Column()
  companyId: string;

  @Column()
  companyWallet: string;

  @Column('numeric', { precision: 12, scale: 2 })
  inputGst: number;

  @Column('numeric', { precision: 12, scale: 2 })
  outputGst: number;

  @Column('numeric', { precision: 12, scale: 2 })
  claimableAmount: number;

  @Column()
  transactionHash: string;

  @CreateDateColumn()
  claimedAt: Date;
}
