export const pipe = <T extends Function, V>(...args: T[]) => (value: V) =>
  args.reduce((res: V, func: T) => func(res), value);

export function limitLength(value: string | number, limit = 19) {
  return String(value).slice(0, limit);
}

export function normalizeNumber(value: string | number) {
  const strValue = String(value);
  return String(
    isNaN(Number(value)) ||
      strValue === '-' ||
      (strValue.match(/\./g) || []).length === 1 ||
      value === ''
      ? value
      : Number(value)
  );
}

export function limitNumber(value: string | number, min: number, max: number) {
  if (typeof max !== undefined && Number(value) > max) {
    return String(max);
  }
  if (typeof min !== undefined && Number(value) < min) {
    return String(min);
  }
  return value;
}
