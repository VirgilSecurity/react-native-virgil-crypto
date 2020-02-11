import { NativeModules } from 'react-native';

const { RNVirgilCrypto } = NativeModules;

export const HashAlgorithm = Object.freeze({
  SHA224: 'SHA224',
  SHA256: 'SHA256',
  SHA384: 'SHA384',
  SHA512: 'SHA512'
});

export function checkedGetHashAlgorithm(alg) {
  if (!(alg in RNVirgilCrypto.HashAlgorithm)) {
    throw new TypeError(`Invalid hash algorithm "${alg}". Expected one of ${
      Object.keys(RNVirgilCrypto.HashAlgorithm).join(', ')
    }`);
  }

  return RNVirgilCrypto.HashAlgorithm[alg];
}
