import _ from 'lodash';
global._ = _;
import _Benchmark from 'benchmark';
import {
  virgilCrypto,
  virgilBrainKeyCrypto,
  KeyPairType,
  HashAlgorithm,
  Buffer,
} from 'react-native-virgil-crypto';

const Benchmark = _Benchmark.runInContext(global);
const eightKbData = Buffer.alloc(8192, 'benchmark data', 'utf-8');
const oneKbData = Buffer.alloc(1024, 'benchmark data', 'utf-8');

export function createBenchmark() {
  const suite = new Benchmark.Suite();

  addGenerateKeys(suite, KeyPairType.ED25519);
  addGenerateKeys(suite, KeyPairType.CURVE25519);
  addGenerateKeys(suite, KeyPairType.CURVE25519_ROUND5_ED25519_FALCON);
  // commented out because there is currently a bug in exporting secp256r1 keys
  // addGenerateKeys(suite, KeyPairType.SECP256R1);

  // commented out because it's too slow
  // addGenerateKeys(suite, KeyPairType.RSA_4096);

  addHash(suite, HashAlgorithm.SHA256);
  addHash(suite, HashAlgorithm.SHA512);

  addEncryption(suite, KeyPairType.ED25519);
  addEncryption(suite, KeyPairType.CURVE25519);
  addEncryption(suite, KeyPairType.CURVE25519_ROUND5_ED25519_FALCON);
  // addEncryption(suite, KeyPairType.SECP256R1);
  // addEncryption(suite, KeyPairType.RSA_4096);

  addSignatures(suite, KeyPairType.ED25519);
  addSignatures(suite, KeyPairType.CURVE25519_ROUND5_ED25519_FALCON);
  // addSignatures(suite, KeyPairType.SECP256R1);
  // addSignatures(suite, KeyPairType.RSA_4096);

  addSignAndEncrypt(suite, KeyPairType.ED25519);
  addSignAndEncrypt(suite, KeyPairType.CURVE25519_ROUND5_ED25519_FALCON);
  addSignThenEncrypt(suite, KeyPairType.ED25519);
  addSignThenEncrypt(suite, KeyPairType.CURVE25519_ROUND5_ED25519_FALCON);
  addKeyknoxCrypto(suite, KeyPairType.ED25519);
  addKeyknoxCrypto(suite, KeyPairType.CURVE25519_ROUND5_ED25519_FALCON);
  addBrainKeyCrypto(suite);

  addKeyExtraction(suite, KeyPairType.ED25519);
  addKeyExtraction(suite, KeyPairType.CURVE25519);
  addKeyExtraction(suite, KeyPairType.CURVE25519_ROUND5_ED25519_FALCON);

  addGroupEncryption(suite);

  return suite;
}

function addGenerateKeys(suite, keyPairType) {
  suite.add(`generateKeys (${keyPairType})`, () => {
    virgilCrypto.generateKeys(keyPairType);
  });
}

function addHash(suite, algorithm) {
  suite.add(`calculateHash (${algorithm})`, () => {
    virgilCrypto.calculateHash(eightKbData, algorithm);
  });
}

function addEncryption(suite, keyPairType) {
  const keypair = virgilCrypto.generateKeys(keyPairType);
  const encryptedData = virgilCrypto.encrypt(oneKbData, keypair.publicKey);

  suite.add(`encrypt (${keyPairType})`, () => {
    virgilCrypto.encrypt(oneKbData, keypair.publicKey);
  });

  suite.add(`decrypt (${keyPairType})`, () => {
    virgilCrypto.decrypt(encryptedData, keypair.privateKey);
  });
}

function addSignatures(suite, keyPairType) {
  const keypair = virgilCrypto.generateKeys(keyPairType);
  const signature = virgilCrypto.calculateSignature(
    oneKbData,
    keypair.privateKey,
  );

  suite.add(`calculateSignature (${keyPairType})`, () => {
    virgilCrypto.calculateSignature(oneKbData, keypair.privateKey);
  });

  suite.add(`verifySignature (${keyPairType})`, () => {
    virgilCrypto.verifySignature(oneKbData, signature, keypair.publicKey);
  });
}

function addSignAndEncrypt(suite, keyPairType) {
  const keypair = virgilCrypto.generateKeys();
  const encryptedData = virgilCrypto.signAndEncrypt(
    oneKbData,
    keypair.privateKey,
    keypair.publicKey,
  );

  suite.add(`signAndEncrypt (${keyPairType})`, () => {
    try {
      virgilCrypto.signAndEncrypt(
        oneKbData,
        keypair.privateKey,
        keypair.publicKey,
      );
    } catch (error) {
      console.log(error);
    }
  });

  suite.add(`decryptAndVerify (${keyPairType})`, () => {
    try {
      virgilCrypto.decryptAndVerify(
        encryptedData,
        keypair.privateKey,
        keypair.publicKey,
      );
    } catch (error) {
      console.log(error);
    }
  });
}

function addSignThenEncrypt(suite, keyPairType) {
  const keypair = virgilCrypto.generateKeys();
  const encryptedData = virgilCrypto.signThenEncrypt(
    oneKbData,
    keypair.privateKey,
    keypair.publicKey,
  );

  suite.add(`signThenEncrypt (${keyPairType})`, () => {
    try {
      virgilCrypto.signThenEncrypt(
        oneKbData,
        keypair.privateKey,
        keypair.publicKey,
      );
    } catch (error) {
      console.log(error);
    }
  });

  suite.add(`decryptThenVerify (${keyPairType})`, () => {
    try {
      virgilCrypto.decryptThenVerify(
        encryptedData,
        keypair.privateKey,
        keypair.publicKey,
      );
    } catch (error) {
      console.log(error);
    }
  });
}

function addKeyknoxCrypto(suite, keyPairType) {
  const keypair = virgilCrypto.generateKeys();
  const {encryptedData, metadata} = virgilCrypto.signThenEncryptDetached(
    oneKbData,
    keypair.privateKey,
    keypair.publicKey,
  );

  suite.add(`signThenEncryptDetached (${keyPairType})`, () => {
    virgilCrypto.signThenEncryptDetached(
      oneKbData,
      keypair.privateKey,
      keypair.publicKey,
    );
  });

  suite.add(`decryptThenVerifyDetached (${keyPairType})`, () => {
    virgilCrypto.decryptThenVerifyDetached(
      encryptedData,
      metadata,
      keypair.privateKey,
      keypair.publicKey,
    );
  });
}

function addBrainKeyCrypto(suite) {
  const password = 'pa$$w0rd';
  const {blindingSecret} = virgilBrainKeyCrypto.blind(password);
  const transformedPassword =
    'D3mcJ2QaaSqE3bB0gJ+F4ScXBiUt068X6OWE+WrFTsV6T4Gk/Ky9l2lBeDocOjifBxst' +
    'Xm1bGgxXZqKYZ11vZjRHxCK2+PcjvFNUio2eYDVoyYUorQ4NwiSG+Umj5Lm9A5zcjCIamuAUH9hvj+SkCnaqpRbKyZHq8cT1' +
    'Hp3Epu3snmVK2OcYl0fgfIWKsXnbD6m2UnLRPe0jrV6oFXW6eh2Bztrb3IxI++w0LmRjF8Px3YEo1AeCquDUs9zkc30hEkIX' +
    'KbC1vz+sSSidHZJqxEwEpVb/sJeZJyiWxKSdrgaJCI0zJzS/Asx4S2Bbe02bBO3ExqMQHFT3ZcYez6SMGMCZpbES8GhR46bd' +
    '1wcbnNFZ4+gRH7lUO766xmkfDFL9BcbGtRPbqW8c4Tfc8RXoYS/UJbiC7QbeD4rfKT6ZMYu7FUeaqEHrqT8RXKE3yoMTETgi' +
    'rJtS58qkpwoVBz7U62plQtXaCPLylpKVtYDuYL+S7AyWtAAykDN3oAOtSxLW';

  suite.add('BrainKeyCrypto.blind', () => {
    virgilBrainKeyCrypto.blind(password);
  });

  suite.add('BrainKeyCrypto.deblind', () => {
    virgilBrainKeyCrypto.deblind({
      transformedPassword,
      blindingSecret,
    });
  });
}

function addKeyExtraction(suite, keyPairType) {
  const keypair = virgilCrypto.generateKeys(keyPairType);

  suite.add(`extractPublicKey (${keyPairType})`, () => {
    virgilCrypto.extractPublicKey(keypair.privateKey);
  });
}

function addGroupEncryption(suite) {
  const keypair = virgilCrypto.generateKeys();
  const groupId = virgilCrypto.getRandomBytes(16);
  const groupSession = virgilCrypto.generateGroupSession(groupId);
  const numberOfEpochs = 50;
  for (let i = 0; i < numberOfEpochs; i++) {
    groupSession.addNewEpoch();
  }
  const encryptedData = groupSession.encrypt(oneKbData, keypair.privateKey);

  suite.add('generateGroupSession', () => {
    virgilCrypto.generateGroupSession(groupId);
  });

  suite.add('importGroupSession', () => {
    virgilCrypto.importGroupSession(groupSession.export());
  });

  suite.add('groupSession.encrypt', () => {
    groupSession.encrypt(oneKbData, keypair.privateKey);
  });

  suite.add('groupSession.decrypt', () => {
    groupSession.decrypt(encryptedData, keypair.publicKey);
  });
}
