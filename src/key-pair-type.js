import { NativeModules } from 'react-native';

const { RNVirgilCrypto } = NativeModules;

export const KeyPairType = Object.freeze({
  ED25519: 'ED25519',
  CURVE25519: 'CURVE25519',
  SECP256R1: 'SECP256R1',
  RSA_2048: 'RSA2048',
  RSA_4096: 'RSA4096',
  RSA_8192: 'RSA8192',
  CURVE25519_ED25519: 'CURVE25519_ED25519',
  CURVE25519_ROUND5_ED25519_FALCON: 'CURVE25519_ROUND5_ED25519_FALCON',
});

export function checkedGetKeyPairType(keyPairType) {
  if (!(keyPairType in RNVirgilCrypto.KeyPairType)) {
    throw new TypeError(`Invalid type of key pair "${
      keyPairType
    }". Expected one of ${
      Object.keys(RNVirgilCrypto.KeyPairType).join(', ')
    }`);
  }
  return RNVirgilCrypto.KeyPairType[keyPairType];
}
