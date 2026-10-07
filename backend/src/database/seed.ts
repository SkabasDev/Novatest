import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { ProductOrmEntity } from '../modules/product/infrastructure/persistence/product.orm-entity';

const DUMMY_PRODUCTS: Partial<ProductOrmEntity>[] = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear noise-cancelling wireless headphones, 30h battery life.',
    priceInCents: 29_900_00,
    currency: 'COP',
    stock: 25,
    imageUrl: 'https://images.example.com/headphones.png',
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact 65% mechanical keyboard with hot-swappable switches.',
    priceInCents: 18_500_00,
    currency: 'COP',
    stock: 40,
    imageUrl: 'https://images.example.com/keyboard.png',
  },
  {
    name: 'Smartwatch',
    description: 'Fitness smartwatch with heart-rate and sleep tracking.',
    priceInCents: 45_000_00,
    currency: 'COP',
    stock: 15,
    imageUrl: 'https://images.example.com/smartwatch.png',
  },
];

async function seed(): Promise<void> {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(ProductOrmEntity);

  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log(`Seed skipped: ${existingCount} product(s) already exist.`);
    await AppDataSource.destroy();
    return;
  }

  await repository.save(repository.create(DUMMY_PRODUCTS));
  console.log(`Seeded ${DUMMY_PRODUCTS.length} dummy products.`);
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
