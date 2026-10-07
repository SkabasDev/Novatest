import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ name: 'price_in_cents', type: 'int' })
  priceInCents: number;

  @Column({ default: 'COP' })
  currency: string;

  @Column('int')
  stock: number;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
