import { RNVirgilCrypto } from './native-modules';

export const KeyPairType = Object.freeze({
  ED25519: 'ED25519',
  CURVE25519: 'CURVE25519',
  SECP256R1: 'SECP256R1',
  RSA_2048: 'RSA2048',
  RSA_4096: 'RSA4096',
  RSA_8192: 'RSA8192',
  CURVE25519_ED25519: 'CURVE25519_ED25519',
  CURVE25519_MLKEM768_ED25519_FALCON: 'CURVE25519_MLKEM768_ED25519_FALCON',
} as const);

export type KeyPairTypeValue = (typeof KeyPairType)[keyof typeof KeyPairType];

export function checkedGetKeyPairType(keyPairType: unknown): string {
  if (typeof keyPairType !== 'string' || !(keyPairType in RNVirgilCrypto.KeyPairType)) {
    throw new TypeError(
      `Invalid type of key pair "${String(keyPairType)}". Expected one of ${Object.keys(
        RNVirgilCrypto.KeyPairType
      ).join(', ')}`
    );
  }

  return RNVirgilCrypto.KeyPairType[keyPairType];
}
