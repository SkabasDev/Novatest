import 'dotenv/config';
import { DataSource } from 'typeorm';

/** Used by the TypeORM CLI (migration:generate / migration:run). Kept separate from the Nest module config on purpose. */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'nova',
  password: process.env.DB_PASSWORD ?? 'nova',
  database: process.env.DB_NAME ?? 'nova_checkout',
  entities: [__dirname + '/../modules/**/infrastructure/persistence/*.orm-entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
});
