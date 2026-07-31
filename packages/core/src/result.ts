export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function mapResult<T, U, E>(
  result: Result<T, E>,
  map: (value: T) => U,
): Result<U, E> {
  if (!result.ok) {
    return result;
  }
  return ok(map(result.value));
}
