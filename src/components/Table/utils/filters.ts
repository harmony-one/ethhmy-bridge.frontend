export function isFilterApplied(value: any) {
  // checkbox array
  if (value instanceof Array) {
    return value.length > 0;
  }

  // from/to range for number or date
  if (value instanceof Object) {
    return value.fromFilter || value.toFilter;
  }

  if (typeof value === 'string') {
    return !!value;
  }

  return value !== undefined;
}
