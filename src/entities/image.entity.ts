import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('images')
export class ImageEntity {
  @Column({ type: 'uuid', primary: true, generated: 'uuid' })
  id: string;

  @Column()
  filename: string;

  @Column({ name: 'base64data', type: 'text' })
  base64data: string;

  @Column({ name: 'mimetype' })
  mimeType: string;

  @CreateDateColumn({ name: 'uploadedat' })
  uploadedAt: Date;
}
