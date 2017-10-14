import { camelCase } from 'lodash';

export function isDateLike(s: string) {
  return /^\d{4}-\d{2}/.test(s);
}

export function toCamelCaseObject(o: any) {
  const camelCased: any = {};
  for (const [key, value] of Object.entries(o)) {
    const newKey = camelCase(key);
    const newValue = value != null && typeof value === 'object' ? toCamelCaseObject(value) : value;
    camelCased[newKey] = newValue;
  }
  return camelCased;
}

export function parseDates(o: any) {
  for (const [k, v] of Object.entries(o)) {
    // parse dates
    if (typeof v === 'string' && isDateLike(v)) {
      o[k] = new Date(v);
    }
  }
}
