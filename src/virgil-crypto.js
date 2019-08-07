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
import { anyToBase64, base64ToBuffer } from './utils/encoding';
import { checkedGetHashAlgorithm } from './hash-algorithm';
import { checkedGetKeyPairType } from './key-pair-type';

const { RNVirgilCrypto } = NativeModules;

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
    const dataBase64 = anyToBase64(data, 'utf8', 'data');
    if (algorithm == null) {
      return unwrapResponse(RNVirgilCrypto.computeHash(dataBase64));
    }

    const nativeAlg = checkedGetHashAlgorithm(algorithm);
    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.computeHashWithAlgorithm(dataBase64, nativeAlg))
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
    const seedBase64 = anyToBase64(seed, 'base64', 'seed');

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
    const dataBase64 = anyToBase64(data, 'utf8', 'data');
    const publicKeysValues = checkedGetPublicKeyValues(virgilPublicKeys);
    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.encrypt(dataBase64, publicKeysValues))
    );
  },

  decrypt(encryptedData, virgilPrivateKey) {
    const encryptedDataBase64 = anyToBase64(encryptedData, 'base64', 'encryptedData');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.decrypt(encryptedDataBase64, privateKeyValue))
    );
  },

  calculateSignature(data, virgilPrivateKey) {
    const dataBase64 = anyToBase64(data, 'utf8', 'data');
    const privateKeyValue = checkedGetPrivateKeyValue(virgilPrivateKey);
    return base64ToBuffer(
      unwrapResponse(RNVirgilCrypto.generateSignature(dataBase64, privateKeyValue))
    );
  },

  verifySignature(data, signature, virgilPublicKey) {
    const dataBase64 = anyToBase64(data, 'utf8', 'data');
    const signatureBase64 = anyToBase64(signature, 'base64', 'signature');
    const publicKeyValue = checkedGetPublicKeyValue(virgilPublicKey);

    return unwrapResponse(RNVirgilCrypto.verifySignature(signatureBase64, dataBase64, publicKeyValue));
  },

  signThenEncrypt(data, virgilPrivateKey, virgilPublicKeys) {
    const dataBase64 = anyToBase64(data, 'utf8', 'data');
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
    const dataBase64 = anyToBase64(encryptedData, 'base64', 'encryptedData');
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
    const privateKeyBase64 = anyToBase64(rawPrivateKey, 'base64', 'rawPrivateKey');
    return new VirgilPrivateKey(privateKeyBase64);
  },

  importPublicKey(rawPublicKey) {
    const publicKeyBase64 = anyToBase64(rawPublicKey, 'base64', 'rawPublicKey');
    return new VirgilPublicKey(publicKeyBase64);
  }
}
