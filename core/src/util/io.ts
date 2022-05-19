export type LookupResult<TValue> =
  | { success: true; value: TValue }
  | { success: false; err: Error };
