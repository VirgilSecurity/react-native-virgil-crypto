import { NativeModules } from 'react-native';

export type NativeErrorInfo = {
  code: string;
  message: string;
  domain?: string;
  userInfo?: unknown;
  nativeStackIOS?: unknown;
  nativeStackAndroid?: unknown;
};

export type NativeResponse<T> =
  | { result: T; error?: undefined }
  | { result?: undefined; error: NativeErrorInfo };

export type NativeKeyPair = {
  privateKey: string;
  publicKey: string;
  identifier: string;
};

export type NativePublicKeyInfo = {
  publicKey: string;
  identifier: string;
};

export type NativeDetachedEncryption = {
  encryptedData: string;
  metadata: string;
};

export type NativeGroupSessionInfo = {
  sessionId: string;
  currentEpochNumber: number;
  epochMessages: string[];
};

export type NativeGroupSessionMessageInfo = {
  sessionId: string;
  epochNumber: number;
  data: string;
};

export interface NativeRNVirgilCryptoModule {
  KeyPairType: Record<string, string>;
  HashAlgorithm: Record<string, string>;
  generateRandomData(size: number): NativeResponse<string>;
  computeHash(dataBase64: string): NativeResponse<string>;
  computeHashWithAlgorithm(dataBase64: string, algorithm: string): NativeResponse<string>;
  generateKeyPair(): NativeResponse<NativeKeyPair>;
  generateKeyPairOfType(keyPairType: string): NativeResponse<NativeKeyPair>;
  generateKeyPairUsingSeed(seedBase64: string): NativeResponse<NativeKeyPair>;
  generateKeyPairWithTypeAndSeed(
    keyPairType: string,
    seedBase64: string
  ): NativeResponse<NativeKeyPair>;
  encrypt(
    dataBase64: string,
    publicKeysBase64: string[],
    enablePadding: boolean
  ): NativeResponse<string>;
  decrypt(dataBase64: string, privateKeyBase64: string): NativeResponse<string>;
  generateSignature(dataBase64: string, privateKeyBase64: string): NativeResponse<string>;
  verifySignature(
    signatureBase64: string,
    dataBase64: string,
    publicKeyBase64: string
  ): NativeResponse<boolean>;
  signAndEncrypt(
    dataBase64: string,
    privateKeyBase64: string,
    publicKeysBase64: string[],
    enablePadding: boolean
  ): NativeResponse<string>;
  decryptAndVerify(
    dataBase64: string,
    privateKeyBase64: string,
    publicKeysBase64: string[]
  ): NativeResponse<string>;
  signThenEncrypt(
    dataBase64: string,
    privateKeyBase64: string,
    publicKeysBase64: string[],
    enablePadding: boolean
  ): NativeResponse<string>;
  decryptThenVerify(
    dataBase64: string,
    privateKeyBase64: string,
    publicKeysBase64: string[]
  ): NativeResponse<string>;
  extractPublicKey(privateKeyBase64: string): NativeResponse<NativePublicKeyInfo>;
  getPrivateKeyIdentifier(privateKeyBase64: string): NativeResponse<string>;
  getPublicKeyIdentifier(publicKeyBase64: string): NativeResponse<string>;
  signThenEncryptDetached(
    dataBase64: string,
    privateKeyBase64: string,
    publicKeysBase64: string[],
    enablePadding: boolean
  ): NativeResponse<NativeDetachedEncryption>;
  decryptThenVerifyDetached(
    dataBase64: string,
    metadataBase64: string,
    privateKeyBase64: string,
    publicKeysBase64: string[]
  ): NativeResponse<string>;
  generateGroupSession(groupIdBase64: string): NativeResponse<NativeGroupSessionInfo>;
  importGroupSession(epochMessagesBase64: string[]): NativeResponse<NativeGroupSessionInfo>;
  encryptFile(
    inputPath: string,
    outputPath: string | undefined,
    publicKeysBase64: string[],
    enablePadding: boolean
  ): Promise<string>;
  decryptFile(
    inputPath: string,
    outputPath: string | undefined,
    privateKeyBase64: string
  ): Promise<string>;
  generateFileSignature(inputPath: string, privateKeyBase64: string): Promise<string>;
  verifyFileSignature(
    signatureBase64: string,
    inputPath: string,
    publicKeyBase64: string
  ): Promise<boolean>;
}

export interface NativeRNVirgilBrainKeyCryptoModule {
  blind(passwordBase64: string): NativeResponse<{ blindedPoint: string; deblindFactor: string }>;
  verify(
    blindedPointBase64: string,
    hardenedPointBase64: string,
    serverPublicKeyBase64: string,
    proofValueCBase64: string,
    proofValueSBase64: string
  ): NativeResponse<boolean>;
  deblind(
    passwordBase64: string,
    hardenedPointBase64: string,
    deblindFactorBase64: string,
    keyNameBase64: string
  ): NativeResponse<string>;
}

export interface NativeRNVirgilGroupSessionModule {
  encrypt(
    dataBase64: string,
    privateKeyBase64: string,
    epochMessagesBase64: string[]
  ): NativeResponse<string>;
  decrypt(
    dataBase64: string,
    publicKeyBase64: string,
    epochMessagesBase64: string[]
  ): NativeResponse<string>;
  addNewEpoch(epochMessagesBase64: string[]): NativeResponse<NativeGroupSessionMessageInfo>;
  parseMessage(messageDataBase64: string): NativeResponse<NativeGroupSessionMessageInfo>;
}

type TypedNativeModules = typeof NativeModules & {
  RNVirgilCrypto: NativeRNVirgilCryptoModule;
  RNVirgilBrainKeyCrypto: NativeRNVirgilBrainKeyCryptoModule;
  RNVirgilGroupSession: NativeRNVirgilGroupSessionModule;
};

const typedNativeModules = NativeModules as TypedNativeModules;

export const RNVirgilCrypto = typedNativeModules.RNVirgilCrypto;
export const RNVirgilBrainKeyCrypto = typedNativeModules.RNVirgilBrainKeyCrypto;
export const RNVirgilGroupSession = typedNativeModules.RNVirgilGroupSession;
