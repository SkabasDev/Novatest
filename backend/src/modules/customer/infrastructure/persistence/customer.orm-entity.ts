import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('customers')
export class CustomerOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
