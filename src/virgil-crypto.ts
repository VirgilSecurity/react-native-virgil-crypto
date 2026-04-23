import type {
  Data,
  ICrypto as ICryptoBase,
  IGroupSession,
  IKeyPair,
  IPrivateKey,
  IPublicKey,
  NodeBuffer,
} from '@virgilsecurity/crypto-types';
import { VirgilPrivateKey } from './virgil-private-key';
import { VirgilPublicKey } from './virgil-public-key';
import { RNVirgilCrypto } from './native-modules';
import {
  checkedGetPrivateKeyValue,
  checkedGetPublicKeyValue,
  checkedGetPublicKeyValues,
  wrapKeyPair,
} from './utils/keys';
import { unwrapResponse } from './utils/response';
import { base64ToBuffer, dataToBase64 } from './utils/encoding';
import { checkedGetHashAlgorithm } from './hash-algorithm';
import { checkedGetKeyPairType } from './key-pair-type';
import { createVirgilGroupSession } from './virgil-group-session';

export type EncryptFileParams = {
  inputPath: string;
  publicKeys: IPublicKey | IPublicKey[];
  outputPath?: string;
  enablePadding?: boolean;
};

export type DecryptFileParams = {
  inputPath: string;
  privateKey: IPrivateKey;
  outputPath?: string;
};

export type GenerateFileSignatureParams = {
  inputPath: string;
  privateKey: IPrivateKey;
};

export type VerifyFileSignatureParams = {
  inputPath: string;
  signature: Data;
  publicKey: IPublicKey;
};

export interface VirgilCrypto extends ICryptoBase {
  encryptFile(params: EncryptFileParams): Promise<string>;
  decryptFile(params: DecryptFileParams): Promise<string>;
  generateFileSignature(params: GenerateFileSignatureParams): Promise<NodeBuffer>;
  verifyFileSignature(params: VerifyFileSignatureParams): Promise<boolean>;
}

const normalizeFilePath = (path: string): string => (path.startsWith('file://') ? path.slice(7) : path);

const validateGroupId = (groupIdBase64: string): void => {
  if (base64ToBuffer(groupIdBase64).byteLength < MIN_GROUP_ID_BYTE_LENGTH) {
    throw new Error(
      `The given group Id is too short. Must be at least ${MIN_GROUP_ID_BYTE_LENGTH} bytes.`
    );
  }
};

export const MIN_GROUP_ID_BYTE_LENGTH = 10;

export const virgilCrypto: VirgilCrypto = {
  getRandomBytes(size: number): NodeBuffer {
    if (!Number.isSafeInteger(size)) {
      throw new TypeError('Argument "size" must be an integer');
    }

    return base64ToBuffer(unwrapResponse(RNVirgilCrypto.generateRandomData(size)));
  },

  calculateHash(data: Data, algorithm?: unknown): NodeBuffer {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const response =
      algorithm == null
        ? RNVirgilCrypto.computeHash(dataBase64)
        : RNVirgilCrypto.computeHashWithAlgorithm(dataBase64, checkedGetHashAlgorithm(algorithm));

    return base64ToBuffer(unwrapResponse(response));
  },

  generateKeys(keyPairType?: unknown): IKeyPair {
    const keypair =
      keyPairType == null
        ? unwrapResponse(RNVirgilCrypto.generateKeyPair())
        : unwrapResponse(RNVirgilCrypto.generateKeyPairOfType(checkedGetKeyPairType(keyPairType)));

    return wrapKeyPair(keypair);
  },

  generateKeysFromKeyMaterial(seed: Data, keyPairType?: unknown): IKeyPair {
    const seedBase64 = dataToBase64(seed, 'base64', 'seed');
    const keypair =
      keyPairType == null
        ? unwrapResponse(RNVirgilCrypto.generateKeyPairUsingSeed(seedBase64))
        : unwrapResponse(
            RNVirgilCrypto.generateKeyPairWithTypeAndSeed(
              checkedGetKeyPairType(keyPairType),
              seedBase64
            )
          );

    return wrapKeyPair(keypair);
  },

  encrypt(data: Data, virgilPublicKeys: IPublicKey | IPublicKey[], enablePadding?: boolean): NodeBuffer {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const publicKeysValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.encrypt(dataBase64, publicKeysValues, enablePadding || false))
    );
  },

  decrypt(encryptedData: Data, virgilPrivateKey: IPrivateKey): NodeBuffer {
    const encryptedDataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);

    return base64ToBuffer(unwrapResponse(RNVirgilCrypto.decrypt(encryptedDataBase64, privateKeyValue)));
  },

  calculateSignature(data: Data, virgilPrivateKey: IPrivateKey): NodeBuffer {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);

    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.generateSignature(dataBase64, privateKeyValue))
    );
  },

  verifySignature(data: Data, signature: Data, virgilPublicKey: IPublicKey): boolean {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const signatureBase64 = dataToBase64(signature, 'base64', 'signature');
    const publicKeyValue = checkedGetPublicKeyValue(virgilPublicKey);

    return unwrapResponse(
      RNVirgilCrypto.verifySignature(signatureBase64, dataBase64, publicKeyValue)
    );
  },

  signAndEncrypt(
    data: Data,
    virgilPrivateKey: IPrivateKey,
    virgilPublicKeys: IPublicKey | IPublicKey[],
    enablePadding?: boolean
  ): NodeBuffer {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(
      unwrapResponse(
        RNVirgilCrypto.signAndEncrypt(
          dataBase64,
          privateKeyValue,
          publicKeyValues,
          enablePadding || false
        )
      )
    );
  },

  decryptAndVerify(
    encryptedData: Data,
    virgilPrivateKey: IPrivateKey,
    virgilPublicKeys: IPublicKey | IPublicKey[]
  ): NodeBuffer {
    const dataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.decryptAndVerify(dataBase64, privateKeyValue, publicKeyValues))
    );
  },

  signThenEncrypt(
    data: Data,
    virgilPrivateKey: IPrivateKey,
    virgilPublicKeys: IPublicKey | IPublicKey[],
    enablePadding?: boolean
  ): NodeBuffer {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(
      unwrapResponse(
        RNVirgilCrypto.signThenEncrypt(
          dataBase64,
          privateKeyValue,
          publicKeyValues,
          enablePadding || false
        )
      )
    );
  },

  decryptThenVerify(
    encryptedData: Data,
    virgilPrivateKey: IPrivateKey,
    virgilPublicKeys: IPublicKey | IPublicKey[]
  ): NodeBuffer {
    const dataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(
      unwrapResponse(
        RNVirgilCrypto.decryptThenVerify(dataBase64, privateKeyValue, publicKeyValues)
      )
    );
  },

  extractPublicKey(virgilPrivateKey: IPrivateKey): IPublicKey {
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const { identifier, publicKey } = unwrapResponse(RNVirgilCrypto.extractPublicKey(privateKeyValue));

    return new VirgilPublicKey(identifier, publicKey);
  },

  exportPrivateKey(virgilPrivateKey: IPrivateKey): NodeBuffer {
    return base64ToBuffer(checkedGetPrivateKeyValue(virgilPrivateKey));
  },

  exportPublicKey(virgilPublicKey: IPublicKey): NodeBuffer {
    return base64ToBuffer(checkedGetPublicKeyValue(virgilPublicKey));
  },

  importPrivateKey(rawPrivateKey: Data): IPrivateKey {
    const privateKeyBase64 = dataToBase64(rawPrivateKey, 'base64', 'rawPrivateKey');
    const identifier = unwrapResponse(RNVirgilCrypto.getPrivateKeyIdentifier(privateKeyBase64));

    return new VirgilPrivateKey(identifier, privateKeyBase64);
  },

  importPublicKey(rawPublicKey: Data): IPublicKey {
    const publicKeyBase64 = dataToBase64(rawPublicKey, 'base64', 'rawPublicKey');
    const identifier = unwrapResponse(RNVirgilCrypto.getPublicKeyIdentifier(publicKeyBase64));

    return new VirgilPublicKey(identifier, publicKeyBase64);
  },

  encryptFile({ inputPath, outputPath, publicKeys, enablePadding }: EncryptFileParams): Promise<string> {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }

    if (outputPath != null && typeof outputPath !== 'string') {
      throw new TypeError(
        'Expected "outputPath" parameter to be a string. Got ' + typeof outputPath
      );
    }

    return RNVirgilCrypto.encryptFile(
      normalizeFilePath(inputPath),
      outputPath != null ? normalizeFilePath(outputPath) : undefined,
      checkedGetPublicKeyValues(publicKeys),
      enablePadding || false
    );
  },

  decryptFile({ inputPath, outputPath, privateKey }: DecryptFileParams): Promise<string> {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }

    if (outputPath != null && typeof outputPath !== 'string') {
      throw new TypeError(
        'Expected "outputPath" parameter to be a string. Got ' + typeof outputPath
      );
    }

    return RNVirgilCrypto.decryptFile(
      normalizeFilePath(inputPath),
      outputPath != null ? normalizeFilePath(outputPath) : undefined,
      checkedGetPrivateKeyValue(privateKey)
    );
  },

  generateFileSignature({ inputPath, privateKey }: GenerateFileSignatureParams): Promise<NodeBuffer> {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }

    return RNVirgilCrypto.generateFileSignature(
      normalizeFilePath(inputPath),
      checkedGetPrivateKeyValue(privateKey)
    ).then(base64ToBuffer);
  },

  verifyFileSignature({ inputPath, signature, publicKey }: VerifyFileSignatureParams): Promise<boolean> {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }

    return RNVirgilCrypto.verifyFileSignature(
      dataToBase64(signature, 'base64', 'signature'),
      normalizeFilePath(inputPath),
      checkedGetPublicKeyValue(publicKey)
    );
  },

  signThenEncryptDetached(
    data: Data,
    virgilPrivateKey: IPrivateKey,
    virgilPublicKeys: IPublicKey | IPublicKey[],
    enablePadding?: boolean
  ): { encryptedData: NodeBuffer; metadata: NodeBuffer } {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    const { encryptedData, metadata } = unwrapResponse(
      RNVirgilCrypto.signThenEncryptDetached(
        dataBase64,
        privateKeyValue,
        publicKeyValues,
        enablePadding || false
      )
    );

    return {
      encryptedData: base64ToBuffer(encryptedData),
      metadata: base64ToBuffer(metadata),
    };
  },

  decryptThenVerifyDetached(
    encryptedData: Data,
    metadata: Data,
    virgilPrivateKey: IPrivateKey,
    virgilPublicKeys: IPublicKey | IPublicKey[]
  ): NodeBuffer {
    const dataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
    const metadataBase64 = dataToBase64(metadata, 'base64', 'metadata');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(
      unwrapResponse(
        RNVirgilCrypto.decryptThenVerifyDetached(
          dataBase64,
          metadataBase64,
          privateKeyValue,
          publicKeyValues
        )
      )
    );
  },

  generateGroupSession(groupId: Data): IGroupSession {
    const groupIdBase64 = dataToBase64(groupId, 'utf8', 'groupId');
    validateGroupId(groupIdBase64);

    return createVirgilGroupSession(unwrapResponse(RNVirgilCrypto.generateGroupSession(groupIdBase64)));
  },

  importGroupSession(epochMessages: Data[]): IGroupSession {
    if (!Array.isArray(epochMessages)) {
      throw new TypeError('Epoch messages must be an array.');
    }

    if (epochMessages.length === 0) {
      throw new Error('Epoch messages must not be empty.');
    }

    const epochMessagesBase64 = epochMessages.map((message, index) =>
      dataToBase64(message, 'base64', `epochMessages[${index}]`)
    );

    return createVirgilGroupSession(
      unwrapResponse(RNVirgilCrypto.importGroupSession(epochMessagesBase64))
    );
  },

  calculateGroupSessionId(groupId: Data): string {
    const groupIdBase64 = dataToBase64(groupId, 'utf8', 'groupId');
    validateGroupId(groupIdBase64);

    const hash = base64ToBuffer(
      unwrapResponse(
        RNVirgilCrypto.computeHashWithAlgorithm(
          groupIdBase64,
          RNVirgilCrypto.HashAlgorithm.SHA512
        )
      )
    );

    return hash.slice(0, 32).toString('hex');
  },
};
