export class Result<T, E> {
  private constructor(
    private readonly isSuccess: boolean,
    private readonly value?: T,
    private readonly error?: E,
  ) {}

  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  static fail<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  get isOk(): boolean {
    return this.isSuccess;
  }

  get isFail(): boolean {
    return !this.isSuccess;
  }

  getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get the value of a failed Result');
    }
    return this.value as T;
  }

  getError(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get the error of a successful Result');
    }
    return this.error as E;
  }

  /** Chains the next step of the railway only if this Result is Ok. */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFail) {
      return Result.fail<E, U>(this.error as E);
    }
    return fn(this.value as T);
  }

  /** Transforms the success value without affecting the failure track. */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFail) {
      return Result.fail<E, U>(this.error as E);
    }
    return Result.ok<U, E>(fn(this.value as T));
  }

  /** Collapses both tracks into a single value (used at the edge: controllers). */
  match<U>(onOk: (value: T) => U, onFail: (error: E) => U): U {
    return this.isSuccess ? onOk(this.value as T) : onFail(this.error as E);
  }
}
