export function parseIntOrUndefined(arg: any): number|undefined {
  if (typeof arg === 'undefined') {
    return arg;
  }
  const result: number =  parseInt(arg);
  if (isNaN(result)) {
    return undefined;
  }
  return result;
}

export function parseStringOrUndefined(arg: any): string|undefined {
  if (typeof arg === 'undefined') {
    return arg;
  }
  return arg.toString();
}
