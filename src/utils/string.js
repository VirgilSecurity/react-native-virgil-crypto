export function isString(val) {
  return typeof val === 'string';
}

export function isEmptyOrWhitespace(str) {
  return str.trim() === '';
}
