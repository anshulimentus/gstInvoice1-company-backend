import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from "typeorm";
import { Invoice } from "./invoice.entity";
import { Product } from "src/product/entities/product.entity";

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, invoice => invoice.items, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  quantity: number;

  @Column('decimal')
  lineTotal: number; // Can be calculated in the service as `product.unitPrice * quantity`
}


