import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { Product } from './product.entity';
import { Customer } from './customer.entity';
import { ItcClaim } from './itc-claim.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName: string;

  @Column({ name: 'gst_number', type: 'varchar', length: 15, unique: true })
  gstNumber: string;

  @Column({ name: 'transaction_hash', type: 'varchar', nullable: true })
  transactionHash: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  categoryId: number;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  address: string;

  @Column({ name: 'state_id', type: 'bigint', nullable: true })
  stateId: number;

  @Column({
    name: 'tenant_id',
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()',
  })
  tenantId: string;

  @Column({ name: 'wallet_address', type: 'varchar', length: 255, nullable: true })
  walletAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Invoice, (invoice) => invoice.seller)
  invoices: Invoice[];

  @OneToMany(() => Product, (product) => product.company)
  products: Product[];

  @OneToMany(() => Customer, (customer) => customer.company)
  customers: Customer[];

  @OneToMany(() => ItcClaim, (itcClaim) => itcClaim.company)
  itcClaims: ItcClaim[];
}
