import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('deliveries')
export class DeliveryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'transaction_reference', unique: true })
  transactionReference: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  region: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
