import { Buffer } from 'buffer';
import type { Data, NodeBuffer, StringEncoding, StringWithEncoding } from '@virgilsecurity/crypto-types';

function isStringWithEncoding(value: unknown): value is StringWithEncoding {
  return (
    value != null &&
    typeof value === 'object' &&
    'value' in value &&
    typeof value.value === 'string' &&
    'encoding' in value &&
    typeof value.encoding === 'string' &&
    Buffer.isEncoding(value.encoding)
  );
}

export function dataToBase64(
  value: Data,
  defaultEncoding: StringEncoding | null | undefined,
  label: string
): string {
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

  if (isStringWithEncoding(value)) {
    return Buffer.from(value.value, value.encoding).toString('base64');
  }

  throw new TypeError(
    `Invalid format of data for "${label}". Expected: string in ${defaultEncoding} or Buffer or Uint8Array or object of the form {value: string, encoding: string}. Got ${typeof value}`
  );
}

export function base64ToBuffer(b64: string): NodeBuffer {
  return Buffer.from(b64, 'base64');
}
