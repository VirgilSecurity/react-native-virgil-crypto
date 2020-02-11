import { Buffer } from 'buffer';

export function dataToBase64(value, defaultEncoding, label) {
  if (Buffer.isBuffer(value)) {
    return value.toString('base64');
  }

  if (typeof value === 'string') {
    if (defaultEncoding == null || !Buffer.isEncoding(defaultEncoding)) {
      throw new TypeError(`Invalid default encoding: "${defaultEncoding}"`);
    }

    if (defaultEncoding === 'base64') {
      return value;
    }

    return Buffer.from(value, defaultEncoding).toString('base64');
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString('base64');
  }

  if (
    typeof value === 'object' &&
    typeof value.value === 'string' &&
    Buffer.isEncoding(value.encoding)
  ) {
    return Buffer.from(value.value, value.encoding).toString('base64');
  }

  throw new TypeError(
    `Invalid format of data for "${label}". Expected: string in ${
      defaultEncoding
    } or Buffer or Uint8Array or object of the form {value: string, encoding: string}. Got ${
      typeof value
    }`
  );
}

export function base64ToBuffer(b64) {
  return Buffer.from(b64, 'base64');
}
