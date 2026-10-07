import { plainToInstance } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsUrl, Length, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV = 'development';

  @IsInt()
  PORT = 3000;

  @IsNotEmpty()
  CORS_ORIGIN!: string;

  @IsNotEmpty()
  DB_HOST!: string;

  @IsInt()
  DB_PORT = 5432;

  @IsNotEmpty()
  DB_USERNAME!: string;

  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsNotEmpty()
  DB_NAME!: string;

  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsInt()
  REDIS_PORT = 6379;

  @IsUrl({ require_tld: false })
  PAYMENT_GATEWAY_BASE_URL!: string;

  @IsNotEmpty()
  PAYMENT_GATEWAY_PUBLIC_KEY!: string;

  @IsNotEmpty()
  PAYMENT_GATEWAY_PRIVATE_KEY!: string;

  @IsInt()
  BASE_FEE_IN_CENTS = 350000;

  @IsNotEmpty()
  @Length(32, 256)
  JWT_SECRET!: string;

  @IsOptional()
  @IsNotEmpty()
  JWT_EXPIRES_IN = '2h';
}

/** Fails fast at boot time if required env vars are missing or malformed. */
export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration: ${errors.toString()}`);
  }

  return validated;
}
