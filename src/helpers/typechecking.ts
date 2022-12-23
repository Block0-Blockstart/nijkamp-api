/**
 * Returns false only when value is null or undefined.
 */
export function notNullish(value: any) {
  return value !== null && value !== void 0;
}

/**
 * Returns true if value is a finite number.
 */
export function isFiniteNumber(value: any) {
  return typeof value === 'number' && !Number.isNaN(value) && value !== Infinity && value !== -Infinity;
}

/**
 * Returns true if value is a string (litteral or instance of String)
 */
export function isString(value: any) {
  return typeof value === 'string' || value instanceof String;
}

/**
 * Returns true if value is a valid query for searching notarization
 */
export function isNotarizationQuery(value: any): boolean {
  if (!notNullish(value)) return false;
  if (typeof value !== 'object' && Array.isArray(value)) return false;
  if (Object.keys(value).length === 0) return false;
  for (let i = 0, keys = Object.keys(value); i < keys.length; i++) {
    if (isFiniteNumber(value[keys[i]])) {
      continue;
    }
    if (isString(value[keys[i]])) {
      if (value[keys[i]].length > 0) {
        continue;
      }
    }
    return false;
  }
  return true;
}
