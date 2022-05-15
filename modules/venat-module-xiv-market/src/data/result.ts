export interface LookupResult<TValue> {
  value: TValue;
  success: boolean;
  err?: Error;
}
