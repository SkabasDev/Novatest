import { randomUUID } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { DistributedLockPort } from './distributed-lock.port';
import { DomainError, DomainErrorCode } from './domain-error';
import { Result } from './result';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

const ACQUIRE_RETRY_DELAY_MS = 50;
const ACQUIRE_TIMEOUT_MS = 3000;

/** Only deletes the key if it still holds our token — never releases a lock acquired by someone else after ours expired. */
const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

/**
 * Single-node Redis lock: SET NX PX to acquire (retried with a short backoff until
 * ACQUIRE_TIMEOUT_MS), a token-checked Lua DEL to release. A full multi-node Redlock isn't
 * needed for this app's single-Redis deployment — this is enough to serialize app instances
 * around a key (e.g. a product's stock) so concurrent payments can't both decrement from a
 * stale read.
 */
@Injectable()
export class RedisDistributedLockAdapter implements DistributedLockPort {
  private readonly logger = new Logger(RedisDistributedLockAdapter.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<Result<T, DomainError>> {
    const lockKey = `lock:${key}`;
    const token = randomUUID();
    const acquired = await this.acquire(lockKey, token, ttlMs);

    if (!acquired) {
      return Result.fail(
        new DomainError(
          DomainErrorCode.TRANSACTION_LOCKED,
          `Could not acquire lock for "${key}" — another transaction is in progress`,
        ),
      );
    }

    try {
      const value = await fn();
      return Result.ok(value);
    } finally {
      await this.release(lockKey, token);
    }
  }

  private async acquire(lockKey: string, token: string, ttlMs: number): Promise<boolean> {
    const deadline = Date.now() + ACQUIRE_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const result = await this.redis.set(lockKey, token, 'PX', ttlMs, 'NX');
      if (result === 'OK') return true;
      await this.sleep(ACQUIRE_RETRY_DELAY_MS);
    }

    return false;
  }

  private async release(lockKey: string, token: string): Promise<void> {
    try {
      await this.redis.eval(RELEASE_SCRIPT, 1, lockKey, token);
    } catch (error) {
      this.logger.warn(`Failed to release lock "${lockKey}": ${(error as Error).message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
