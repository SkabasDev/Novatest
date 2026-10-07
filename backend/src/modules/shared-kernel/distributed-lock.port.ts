import { DomainError } from './domain-error';
import { Result } from './result';

export const DISTRIBUTED_LOCK = Symbol('DISTRIBUTED_LOCK');

/**
 * Serializes a critical section across every app instance (Redis-backed in production), so two
 * concurrent requests for the same key — e.g. two payments for the same product — can't both read
 * stale state and both write, overselling stock. `fn` runs only once the lock is held, and the
 * lock is always released afterward, success or failure.
 */
export interface DistributedLockPort {
  /** Fails with DomainErrorCode.TRANSACTION_LOCKED if `key` is still held after `acquireTimeoutMs`. */
  withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<Result<T, DomainError>>;
}
