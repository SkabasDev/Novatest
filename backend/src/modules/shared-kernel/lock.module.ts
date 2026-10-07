import { Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DISTRIBUTED_LOCK } from './distributed-lock.port';
import { REDIS_CLIENT, RedisDistributedLockAdapter } from './redis-distributed-lock.adapter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          maxRetriesPerRequest: 3,
        }),
    },
    { provide: DISTRIBUTED_LOCK, useClass: RedisDistributedLockAdapter },
  ],
  exports: [DISTRIBUTED_LOCK],
})
export class LockModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
