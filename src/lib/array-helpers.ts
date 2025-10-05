/**
 * Array manipulation helpers
 *
 * Utilities for working with arrays and converting between formats
 */

/**
 * Build a numeric array from a list of string values
 * Invalid numbers are converted to 0
 */
export function buildArrayFromList(years: number, list: string[]): number[] {
  const arr: number[] = [];
  for (let i = 0; i < years; i++) {
    const v = parseFloat((list[i] || '').trim());
    arr.push(Number.isFinite(v) ? v : 0);
  }
  return arr;
}

/**
 * Build an object map of individual percentages by year index
 */
export function buildIndividualPercentsMap(years: number, list: string[]): { [k: number]: number } {
  const arr = buildArrayFromList(years, list);
  const map: { [k: number]: number } = {};
  for (let i = 0; i < years; i++) map[i] = arr[i] ?? 0;
  return map;
}

/**
 * Resize an array to a new length, preserving existing values
 * New slots are filled with empty strings
 */
export function resizeStringArray(currentArray: string[], newLength: number): string[] {
  return Array.from({ length: newLength }, (_, i) => currentArray[i] ?? '');
}
