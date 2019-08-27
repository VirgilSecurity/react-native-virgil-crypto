import _ from 'lodash';
global._ = _;
import _Benchmark from 'benchmark';
import { virgilCrypto, KeyPairType, HashAlgorithm, Buffer } from 'react-native-virgil-crypto';

const Benchmark = _Benchmark.runInContext(global);
const eightKbData = Buffer.alloc(8192, 'benchmark data', 'utf-8');
const oneKbData = Buffer.alloc(1024, 'benchmark data', 'utf-8');

export function createBenchmark() {
  const suite = new Benchmark.Suite();

  addGenerateKeys(suite, KeyPairType.ED25519);
  addGenerateKeys(suite, KeyPairType.CURVE25519);
  // addGenerateKeys(suite, KeyPairType.SECP256R1);
  // addGenerateKeys(suite, KeyPairType.RSA_4096);

  addHash(suite, HashAlgorithm.SHA256);
  addHash(suite, HashAlgorithm.SHA512);

  addEncryption(suite, KeyPairType.ED25519);
  addEncryption(suite, KeyPairType.CURVE25519);
  // addEncryption(suite, KeyPairType.SECP256R1);
  // addEncryption(suite, KeyPairType.RSA_4096);

  addSignatures(suite, KeyPairType.ED25519);
  // addSignatures(suite, KeyPairType.SECP256R1);
  // addSignatures(suite, KeyPairType.RSA_4096);

  return suite;
}

function addGenerateKeys(suite, keyPairType) {
  suite.add(`generate keys (${keyPairType})`, () => {
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
  const signature = virgilCrypto.calculateSignature(oneKbData, keypair.privateKey);

  suite.add(`calculateSignature (${keyPairType})`, () => {
    virgilCrypto.calculateSignature(oneKbData, keypair.privateKey);
  });

  suite.add(`verifySignature (${keyPairType})`, () => {
    virgilCrypto.verifySignature(oneKbData, signature, keypair.publicKey);
  });
}