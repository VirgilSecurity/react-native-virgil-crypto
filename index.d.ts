import { ICrypto, IBrainKeyCrypto, NodeBuffer } from "@virgilsecurity/crypto-types";

export const Buffer: NodeBuffer;
export const virgilCrypto: ICrypto;
export const virgilBrainKeyCrypto: IBrainKeyCrypto;
export enum KeyPairType {
  ED25519,
  CURVE25519,
  SECP256R1,
  RSA_2048,
  RSA_4096,
  RSA_8192
}
export enum HashAlgorithm {
  SHA224,
  SHA256,
  SHA384,
  SHA512
}
