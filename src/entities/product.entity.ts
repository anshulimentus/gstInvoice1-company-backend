import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductType } from '../enum/product-type.enum';
import { Company } from './company.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  productID: number;

  @Column({ length: 255 })
  productName: string;

  @Column('numeric', { precision: 10, scale: 2 })
  gstRate: number;

  @Column('text')
  productDescription: string;

  @Column({ nullable: true, length: 255 })
  transactionHash: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column('numeric', { precision: 10, scale: 2 })
  basePrice: number;

  @Column('numeric', { precision: 10, scale: 2 })
  finalPrice: number;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.PRODUCT,
  })
  type: ProductType;

  @Column({ type: 'int' })
  blockchainProductId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company, (company) => company.products)
  @JoinColumn({ name: 'company_tenant_id', referencedColumnName: 'tenantId' })
  company: Company;

  @Column({ type: 'uuid' })
  company_tenant_id: string;
}