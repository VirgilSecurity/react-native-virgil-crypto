import { Buffer } from 'buffer';

export function anyToBase64(value, encoding, label = 'argument') {
  if (Buffer.isBuffer(value)) {
    return value.toString('base64');
  }

  if (typeof value === 'string') {
    if (encoding === 'base64') {
      return value;
    }
    return Buffer.from(value, encoding).toString('base64');
  }

  throw new TypeError(
    `Expected "${label}" to be a string in ${encoding} encoding or a Buffer, got ${typeof value}`
  );
}

export function base64ToBuffer(b64) {
  return Buffer.from(b64, 'base64');
} 