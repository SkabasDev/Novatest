import { DomainErrorCode } from './domain-error';
import { RedisDistributedLockAdapter } from './redis-distributed-lock.adapter';

function buildFakeRedis() {
  const store = new Map<string, string>();
  return {
    set: jest.fn(async (key: string, value: string, _px: 'PX', _ttl: number, _nx: 'NX') => {
      if (store.has(key)) return null;
      store.set(key, value);
      return 'OK';
    }),
    eval: jest.fn(async (_script: string, _numKeys: number, key: string, token: string) => {
      if (store.get(key) === token) {
        store.delete(key);
        return 1;
      }
      return 0;
    }),
  };
}

describe('RedisDistributedLockAdapter', () => {
  it('runs fn while holding the lock, and releases it afterward', async () => {
    const redis = buildFakeRedis();
    const adapter = new RedisDistributedLockAdapter(redis as never);

    const result = await adapter.withLock('product-stock:p-1', 5000, async () => 'done');

    expect(result.isOk).toBe(true);
    expect(result.getValue()).toBe('done');
    expect(redis.set).toHaveBeenCalledTimes(1);
    expect(redis.eval).toHaveBeenCalledTimes(1);
  });

  it('releases the lock even when fn throws', async () => {
    const redis = buildFakeRedis();
    const adapter = new RedisDistributedLockAdapter(redis as never);

    await expect(
      adapter.withLock('product-stock:p-1', 5000, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    // The key was freed, so a second lock on it can be acquired immediately.
    const second = await adapter.withLock('product-stock:p-1', 5000, async () => 'ok');
    expect(second.isOk).toBe(true);
  });

  it('serializes two concurrent holders of the same key', async () => {
    const redis = buildFakeRedis();
    const adapter = new RedisDistributedLockAdapter(redis as never);
    const order: string[] = [];

    const first = adapter.withLock('product-stock:p-1', 5000, async () => {
      order.push('first-start');
      await new Promise((resolve) => setTimeout(resolve, 60));
      order.push('first-end');
      return 'first';
    });
    // Give the first call a chance to acquire the lock before the second tries.
    await new Promise((resolve) => setTimeout(resolve, 10));

    const second = adapter.withLock('product-stock:p-1', 5000, async () => {
      order.push('second-start');
      return 'second';
    });

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult.isOk && firstResult.getValue()).toBe('first');
    expect(secondResult.isOk && secondResult.getValue()).toBe('second');
    expect(order).toEqual(['first-start', 'first-end', 'second-start']);
  });

  it('fails with TRANSACTION_LOCKED when the lock cannot be acquired in time', async () => {
    const redis = {
      set: jest.fn().mockResolvedValue(null),
      eval: jest.fn().mockResolvedValue(0),
    };
    const adapter = new RedisDistributedLockAdapter(redis as never);

    const result = await adapter.withLock('product-stock:p-1', 5000, async () => 'unreachable');

    expect(result.isFail).toBe(true);
    expect(result.getError().code).toBe(DomainErrorCode.TRANSACTION_LOCKED);
  }, 10000);
});
