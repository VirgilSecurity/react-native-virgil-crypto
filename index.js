
import { NativeModules } from 'react-native';
import { RNVirgilCryptoError } from './src/rn-virgil-crypto-error';
import { VirgilPrivateKey } from './src/virgil-private-key';
import { VirgilPublicKey } from './src/virgil-public-key';
import { hasPrivateKeyBytes, getPrivateKeyBytes } from './src/private-key-cache';

const { RNVirgilCrypto } = NativeModules;

function toArray(val) {
  if (!val) {
    return [];
  }

  return Array.isArray(val) ? val : [val];
}

function wrapKeyPair(keypair) {
  return {
    privateKey: new VirgilPrivateKey(keypair.privateKey),
    publicKey: new VirgilPublicKey(keypair.publicKey)
  };
}

function isString(val) {
  return typeof val === 'string';
}

function isEmptyOrWhitespace(str) {
  return str.trim() === '';
}

function unwrapResponse(nativeResponse) {
  if (nativeResponse.error) {
    throw new RNVirgilCryptoError(nativeResponse.error);
  }

  return nativeResponse.result;
}

function checkedGetPublicKeyValues(virgilPublicKeys) {
  const arr = toArray(virgilPublicKeys);
  if (arr.length === 0) {
    throw new TypeError(
      'Argument "virgilPublicKeys" must be a VirgilPublicKey or an array of VirgilPublicKey objects'
    );
  }
  return arr.map(it => {
    if (!(it instanceof VirgilPublicKey)) {
      throw new TypeError('Expected an array to contain VirgilPublicKey objects, got ' + typeof it);
    }
    return it.value;
  });
}

function checkedGetPublicKeyValue(virgilPublicKey) {
  if (!(virgilPublicKey instanceof VirgilPublicKey)) {
    throw new TypeError('Argument "virgilPublicKey" must be a VirgilPublicKey object');
  }
  return virgilPublicKey.value;
}

function checkedGetPrivateKeyValue(virgilPrivateKey) {
  if (!hasPrivateKeyBytes(virgilPrivateKey)) {
    throw new TypeError('Argument "virgilPrivateKey" is not a valid VirgilPrivateKey');
  }
  return getPrivateKeyBytes(virgilPrivateKey);
}

export default {
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
