import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/users.entity';
import { Invoice } from 'src/invoice/entities/invoice.entity';


@Entity('company') // Explicitly define table name
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Company_Name', type: 'varchar' })
  companyName: string;

  @Column({ name: 'GST_Number', type: 'varchar' })
  gstNumber: string;

  @Column({ name: 'Transaction_Hash', type: 'varchar', nullable: true })
  transactionHash: string | null;

  @Column({ name: 'Legal_Representative', type: 'varchar', unique: true })
  legalRepresentative: string;

  @Column({ type: 'text' })  // Matching VARCHAR(255)
  image_url: string;

  @Column({ length: 255 })  // Matching VARCHAR(255)
  image_id: string;


  @Column({ name: 'First_name', type: 'varchar' })
  firstName: string;  

  @Column({ name: 'Last_name', type: 'varchar' })
  lastName: string;

  @Column({ name: 'Email', type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'Password', type: 'varchar', nullable: true })
  password: string;

  @Column({ name: 'categoryID', type: 'bigint', nullable: true,})
  categoryID : number;

  @Column({ name: 'address', type: 'varchar', nullable: true })
  address: string;

  @Column({name: 'stateID', type: 'bigint', nullable: true})
  stateID : number;

  @Column({ name: 'tenant_id', type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  tenantId: string;


  @OneToMany(() => Invoice, (invoice) => invoice.seller)
  invoices: Invoice[];
}
