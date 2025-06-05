import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "src/company/entities/company.entity";

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn()
    productID: number;

    @Column({ length: 255 })  // Matching VARCHAR(255)
    productName: string;

    @Column("numeric", { precision: 10, scale: 2 })  // Ensuring numeric type consistency
    gstRate: number;

    @Column("text")  // Matching TEXT in the database
    productDescription: string;

    @Column({ nullable: true, length: 255 })  // Matching VARCHAR(255)
    transactionHash: string;

    @Column({ type: 'text' })  // Matching VARCHAR(255)
    image_url: string;

    @Column({ length: 255, nullable: true })  // Matching VARCHAR(255)
    image_id: string;

    @Column("numeric", { precision: 10, scale: 2 })  // Ensuring numeric type consistency
    unitPrice: number;

    @Column({ length: 255, nullable: true })  // New service column
    service: string;


    // here i have change
    @Column({ type: 'uuid' }) // Store the tenantId from Company
    company_tenant_id: string;

   
}
