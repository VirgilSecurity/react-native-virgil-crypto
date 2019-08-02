import { NativeModules } from 'react-native';
import { VirgilPrivateKey } from './virgil-private-key';
import { VirgilPublicKey } from './virgil-public-key';
import { isString, isEmptyOrWhitespace } from './utils/string';
import { 
  checkedGetPrivateKeyValue, 
  checkedGetPublicKeyValue, 
  checkedGetPublicKeyValues, 
  wrapKeyPair 
} from './utils/keys';
import { unwrapResponse } from './utils/response';

const { RNVirgilCrypto } = NativeModules;

export const virgilCrypto = {
  generateRandomData(size) {
    if (!Number.isSafeInteger(size)) {
      throw new TypeError('Argument "size" must be an integer');
    }

    return unwrapResponse(RNVirgilCrypto.generateRandomData(size));
  },

  computeHash(dataUtf8) {
    if (!isString(dataUtf8)) {
      throw new TypeError('Argument "dataUtf8" must be a string');
    }

    return unwrapResponse(RNVirgilCrypto.computeHash(dataUtf8));
  },

  generateKeyPair() {
    const keypair = unwrapResponse(RNVirgilCrypto.generateKeyPair());
    return wrapKeyPair(keypair);
  },

  encrypt(data, virgilPublicKeys) {
    if (!isString(data)) {
      throw new TypeError('Argument "data" must be a string');
    }

    const publicKeysValues = checkedGetPublicKeyValues(virgilPublicKeys);
    return unwrapResponse(RNVirgilCrypto.encrypt(data, publicKeysValues));
  },

  decrypt(encryptedData, virgilPrivateKey) {
    if (!isString(encryptedData) || isEmptyOrWhitespace(encryptedData)) {
      throw new TypeError('Argument "encryptedData" must be a string');
    }

    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    return unwrapResponse(RNVirgilCrypto.decrypt(encryptedData, privateKeyValue));
  },

  generateSignature(dataBase64, virgilPrivateKey) {
    if (!isString(dataBase64)) {
      throw new TypeError('Argument "dataBase64" must be a string');
    }

    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    return unwrapResponse(RNVirgilCrypto.generateSignature(dataBase64, privateKeyValue));
  },

  verifySignature(signatureBase64, dataBase64, virgilPublicKey) {
    if (!isString(signatureBase64) || isEmptyOrWhitespace(signatureBase64)) {
      throw new TypeError('Argument "signatureBase64" must be a non-empty string');
    }

    if (!isString(dataBase64)) {
      throw new TypeError('Argument "dataBase64" must be a string');
    }

    const publicKeyValue = checkedGetPublicKeyValue(virgilPublicKey);

    return unwrapResponse(RNVirgilCrypto.verifySignature(signatureBase64, dataBase64, publicKeyValue));
  },

  signAndEncrypt(data, virgilPrivateKey, virgilPublicKeys) {
    if (!isString(data)) {
      throw new TypeError('Argument "data" must be a string');
    }

    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return unwrapResponse(
      RNVirgilCrypto.signAndEncrypt(
        data, 
        privateKeyValue, 
        publicKeyValues
      )
    );
  },

  decryptAndVerify(dataBase64, virgilPrivateKey, virgilPublicKeys) {
    if (!isString(dataBase64) || isEmptyOrWhitespace(dataBase64)) {
      throw new TypeError('Argument "dataBase64" must be a non-empty string');
    }

    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    const publicKeyValues = checkedGetPublicKeyValues(virgilPublicKeys);

    return unwrapResponse(
      RNVirgilCrypto.decryptAndVerify(
        dataBase64,
        privateKeyValue,
        publicKeyValues
      )
    );
  },

  extractPublicKey(virgilPrivateKey) {
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    return unwrapResponse(RNVirgilCrypto.extractPublicKey(privateKeyValue));
  },

  exportPrivateKey(virgilPrivateKey) {
    return checkedGetPrivateKeyValue(virgilPrivateKey);
  },
  
  exportPublicKey(virgilPublicKey) {
    return checkedGetPublicKeyValue(virgilPublicKey);
  },

  importPrivateKey(privateKeyBase64) {
    if (!isString(privateKeyBase64) || isEmptyOrWhitespace(privateKeyBase64)) {
      throw new TypeError('Argument "privateKeyBase64" must be a non-empty string');
    }
    return new VirgilPrivateKey(privateKeyBase64);
  },

  importPublicKey(publicKeyBase64) {
    if (!isString(publicKeyBase64) || isEmptyOrWhitespace(publicKeyBase64)) {
      throw new TypeError('Argument "publicKeyBase64" must be a non-empty string');
    }
    return new VirgilPublicKey(publicKeyBase64);
  }
}
