import { RNVirgilCrypto } from './native-modules';

export const HashAlgorithm = Object.freeze({
  SHA224: 'SHA224',
  SHA256: 'SHA256',
  SHA384: 'SHA384',
  SHA512: 'SHA512',
} as const);

export type HashAlgorithmValue = (typeof HashAlgorithm)[keyof typeof HashAlgorithm];

export function checkedGetHashAlgorithm(alg: unknown): string {
  if (typeof alg !== 'string' || !(alg in RNVirgilCrypto.HashAlgorithm)) {
    throw new TypeError(
      `Invalid hash algorithm "${String(alg)}". Expected one of ${Object.keys(
        RNVirgilCrypto.HashAlgorithm
      ).join(', ')}`
    );
  }

  return RNVirgilCrypto.HashAlgorithm[alg];
}
