import { NativeModules } from 'react-native';
import { VirgilPrivateKey } from './virgil-private-key';
import { VirgilPublicKey } from './virgil-public-key';
import { 
  checkedGetPrivateKeyValue,
  checkedGetPublicKeyValue,
  checkedGetPublicKeyValues,
  wrapKeyPair 
} from './utils/keys';
import { unwrapResponse } from './utils/response';
import { dataToBase64, base64ToBuffer } from './utils/encoding';
import { checkedGetHashAlgorithm } from './hash-algorithm';
import { checkedGetKeyPairType } from './key-pair-type';
import { createVirgilGroupSession } from './virgil-group-session';

const { RNVirgilCrypto } = NativeModules;

const normalizeFilePath = (path) => (path.startsWith('file://') ? path.slice(7) : path);
const validateGroupId = (groupIdBase64) => {
  if (base64ToBuffer(groupIdBase64).byteLength < MIN_GROUP_ID_BYTE_LENGTH) {
    throw new Error(
      `The given group Id is too short. Must be at least ${MIN_GROUP_ID_BYTE_LENGTH} bytes.`,
    );
  }
};

export const MIN_GROUP_ID_BYTE_LENGTH = 10;

export const virgilCrypto = {
  getRandomBytes(size) {
    if (!Number.isSafeInteger(size)) {
      throw new TypeError('Argument "size" must be an integer');
    }

    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.generateRandomData(size))
    );
  },

  calculateHash(data, algorithm) {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    let response;
    if (algorithm == null) {
      response = RNVirgilCrypto.computeHash(dataBase64);
    } else {
      const nativeAlg = checkedGetHashAlgorithm(algorithm);
      response = RNVirgilCrypto.computeHashWithAlgorithm(dataBase64, nativeAlg);
    }
    
    return base64ToBuffer(
      unwrapResponse(response)
    );
  },

  generateKeys(keyPairType) {
    let keypair;
    if (keyPairType == null) {
      keypair = unwrapResponse(RNVirgilCrypto.generateKeyPair());
    } else {
      const nativeType = checkedGetKeyPairType(keyPairType);
      keypair = unwrapResponse(RNVirgilCrypto.generateKeyPairOfType(nativeType));
    }
    return wrapKeyPair(keypair);
  },

  generateKeysFromKeyMaterial(seed, keyPairType) {
    const seedBase64 = dataToBase64(seed, 'base64', 'seed');

    let keypair;
    if (keyPairType == null) {
      keypair = unwrapResponse(RNVirgilCrypto.generateKeyPairUsingSeed(seedBase64));
    } else {
      const nativeType = checkedGetKeyPairType(keyPairType);
      keypair = unwrapResponse(RNVirgilCrypto.generateKeyPairWithTypeAndSeed(nativeType, seedBase64));
    }
    return wrapKeyPair(keypair);
  },

  encrypt(data, virgilPublicKeys) {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const publicKeysValues = checkedGetPublicKeyValues(virgilPublicKeys);
    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.encrypt(dataBase64, publicKeysValues))
    );
  },

  decrypt(encryptedData, virgilPrivateKey) {
    const encryptedDataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.decrypt(encryptedDataBase64, privateKeyValue))
    );
  },

  calculateSignature(data, virgilPrivateKey) {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.generateSignature(dataBase64, privateKeyValue))
    );
  },

  verifySignature(data, signature, virgilPublicKey) {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const signatureBase64 = dataToBase64(signature, 'base64', 'signature');
    const publicKeyValue = checkedGetPublicKeyValue(virgilPublicKey);

    return unwrapResponse(RNVirgilCrypto.verifySignature(signatureBase64, dataBase64, publicKeyValue));
  },

  signThenEncrypt(data, virgilPrivateKey, virgilPublicKeys) {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(unwrapResponse(
      RNVirgilCrypto.signAndEncrypt(
        dataBase64, 
        privateKeyValue, 
        publicKeyValues
      )
    ));
  },

  decryptThenVerify(encryptedData, virgilPrivateKey, virgilPublicKeys) {
    const dataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(unwrapResponse(
      RNVirgilCrypto.decryptAndVerify(
        dataBase64,
        privateKeyValue,
        publicKeyValues
      )
    ));
  },

  extractPublicKey(virgilPrivateKey) {
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKey = unwrapResponse(RNVirgilCrypto.extractPublicKey(privateKeyValue));
    return new VirgilPublicKey(publicKey);
  },

  exportPrivateKey(virgilPrivateKey) {
    return base64ToBuffer(checkedGetPrivateKeyValue(virgilPrivateKey));
  },
  
  exportPublicKey(virgilPublicKey) {
    return base64ToBuffer(checkedGetPublicKeyValue(virgilPublicKey));
  },

  importPrivateKey(rawPrivateKey) {
    const privateKeyBase64 = dataToBase64(rawPrivateKey, 'base64', 'rawPrivateKey');
    return new VirgilPrivateKey(privateKeyBase64);
  },

  importPublicKey(rawPublicKey) {
    const publicKeyBase64 = dataToBase64(rawPublicKey, 'base64', 'rawPublicKey');
    return new VirgilPublicKey(publicKeyBase64);
  },

  encryptFile({ inputPath, outputPath, publicKeys }) {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }

    if (outputPath != null && typeof outputPath !== 'string') {
      throw new TypeError('Expected "outputPath" parameter to be a string. Got ' + typeof outputPath);
    }

    const publicKeysValues = checkedGetPublicKeyValues(publicKeys);

    return RNVirgilCrypto.encryptFile(
      normalizeFilePath(inputPath), 
      outputPath != null ? normalizeFilePath(outputPath) : undefined, 
      publicKeysValues
    );
  },

  decryptFile({ inputPath, outputPath, privateKey }) {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }

    if (outputPath != null && typeof outputPath !== 'string') {
      throw new TypeError('Expected "outputPath" parameter to be a string. Got ' + typeof outputPath);
    }

    const privateKeyValue = checkedGetPrivateKeyValue(privateKey);

    return RNVirgilCrypto.decryptFile(
      normalizeFilePath(inputPath), 
      outputPath != null ? normalizeFilePath(outputPath) : outputPath, 
      privateKeyValue
    );
  },

  generateFileSignature({ inputPath, privateKey }) {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }
    const privateKeyValue = checkedGetPrivateKeyValue(privateKey);
    return RNVirgilCrypto.generateFileSignature(normalizeFilePath(inputPath), privateKeyValue);
  },

  verifyFileSignature({ inputPath, signature, publicKey }) {
    if (typeof inputPath !== 'string') {
      throw new TypeError('Expected "inputPath" parameter to be a string. Got ' + typeof inputPath);
    }
    const publicKeyValue = checkedGetPublicKeyValue(publicKey);
    const signatureBase64 = dataToBase64(signature, 'base64', 'signature');
    return RNVirgilCrypto.verifyFileSignature(signatureBase64, normalizeFilePath(inputPath), publicKeyValue);
  },

  signThenEncryptDetached(data, virgilPrivateKey, virgilPublicKeys) {
    const dataBase64 = dataToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    const { encryptedData, metadata } = unwrapResponse(
      RNVirgilCrypto.signAndEncryptDetached(
        dataBase64, 
        privateKeyValue, 
        publicKeyValues
      )
    );
    return {
      encryptedData: base64ToBuffer(encryptedData),
      metadata: base64ToBuffer(metadata)
    };
  },

  decryptThenVerifyDetached(encryptedData, metadata, virgilPrivateKey, virgilPublicKeys) {
    const dataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
    const metadataBase64 = dataToBase64(metadata, 'base64', 'metadata');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return base64ToBuffer(unwrapResponse(
      RNVirgilCrypto.decryptAndVerifyDetached(
        dataBase64,
        metadataBase64,
        privateKeyValue,
        publicKeyValues
      )
    ));
  },

  generateGroupSession(groupId) {
    const groupIdBase64 = dataToBase64(groupId, 'utf8', 'groupId');
    validateGroupId(groupIdBase64);
    const groupSessionInfo = unwrapResponse(
      RNVirgilCrypto.generateGroupSession(groupIdBase64)
    );
    return createVirgilGroupSession(groupSessionInfo);
  },

  importGroupSession(epochMessages) {
    if (!Array.isArray(epochMessages)) {
      throw new TypeError('Epoch messages must be an array.');
    }

    if (epochMessages.length === 0) {
      throw new Error('Epoch messages must not be empty.');
    }

    const epochMessagesBase64 = epochMessages.map((m, i) => dataToBase64(m, 'base64', `epochMessages[${i}]`));
    const groupSessionInfo = unwrapResponse(
      RNVirgilCrypto.importGroupSession(epochMessagesBase64)
    );

    return createVirgilGroupSession(groupSessionInfo);
  },

  calculateGroupSessionId(groupId) {
    const groupIdBase64 = dataToBase64(groupId, 'utf8', 'groupId');
    validateGroupId(groupIdBase64);
    const hash = base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.computeHashWithAlgorithm(groupIdBase64, RNVirgilCrypto.HashAlgorithm.SHA512))
    );
    return hash.slice(0, 32).toString('hex');
  }
}
