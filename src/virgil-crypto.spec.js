import { NativeModules } from 'react-native';
import { Buffer } from 'buffer';
import { virgilCrypto } from './virgil-crypto';
import { HashAlgorithm } from './hash-algorithm';
import { RNVirgilCryptoError } from './rn-virgil-crypto-error';
import { VirgilPrivateKey } from './virgil-private-key';
import { VirgilPublicKey } from './virgil-public-key';
import { KeyPairType } from './key-pair-type';
import expect from "expect";
import {dataToBase64} from "./utils/encoding";

jest.mock('react-native', () => ({
  NativeModules: {
    RNVirgilCrypto: {
      HashAlgorithm: { SHA256: 'NativeHashAlgorigthm.SHA256', SHA512: 'NativeHashAlgorigthm.SHA512' },
      KeyPairType: { SECP256R1: 'NativeKeyPairType.SECP256R1' },
      computeHash: jest.fn(),
      computeHashWithAlgorithm: jest.fn(),
      generateRandomData: jest.fn(),
      generateKeyPair: jest.fn(),
      generateKeyPairOfType: jest.fn(),
      generateKeyPairUsingSeed: jest.fn(),
      generateKeyPairWithTypeAndSeed: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      generateSignature: jest.fn(),
      verifySignature: jest.fn(),
      signThenEncrypt: jest.fn(),
      decryptThenVerify: jest.fn(),
      extractPublicKey: jest.fn(),
      encryptFile: jest.fn(),
      decryptFile: jest.fn(),
      generateFileSignature: jest.fn(),
      verifyFileSignature: jest.fn(),
      signThenEncryptDetached: jest.fn(),
      decryptThenVerifyDetached: jest.fn(),
      generateGroupSession: jest.fn(),
      importGroupSession: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
    select: ({ ios }) => {
      return ios;
    }
  },
}));

describe('virgilCrypto', () => {
  afterEach(() => {
    NativeModules.RNVirgilCrypto.computeHash.mockReset();
    NativeModules.RNVirgilCrypto.computeHashWithAlgorithm.mockReset();
    NativeModules.RNVirgilCrypto.generateRandomData.mockReset();
    NativeModules.RNVirgilCrypto.generateKeyPair.mockReset();
    NativeModules.RNVirgilCrypto.generateKeyPairOfType.mockReset();
    NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed.mockReset();
    NativeModules.RNVirgilCrypto.generateKeyPairWithTypeAndSeed.mockReset();
    NativeModules.RNVirgilCrypto.encrypt.mockReset();
    NativeModules.RNVirgilCrypto.decrypt.mockReset();
    NativeModules.RNVirgilCrypto.generateSignature.mockReset();
    NativeModules.RNVirgilCrypto.verifySignature.mockReset();
    NativeModules.RNVirgilCrypto.signThenEncrypt.mockReset();
    NativeModules.RNVirgilCrypto.decryptThenVerify.mockReset();
    NativeModules.RNVirgilCrypto.extractPublicKey.mockReset();
    NativeModules.RNVirgilCrypto.encryptFile.mockReset();
    NativeModules.RNVirgilCrypto.decryptFile.mockReset();
    NativeModules.RNVirgilCrypto.generateFileSignature.mockReset();
    NativeModules.RNVirgilCrypto.verifyFileSignature.mockReset();
    NativeModules.RNVirgilCrypto.signThenEncryptDetached.mockReset();
    NativeModules.RNVirgilCrypto.decryptThenVerifyDetached.mockReset();
    NativeModules.RNVirgilCrypto.generateGroupSession.mockReset();
    NativeModules.RNVirgilCrypto.importGroupSession.mockReset();
  });

  describe('calculateHash', () => {
    it('accepts "data" as Buffer', () => {
      NativeModules.RNVirgilCrypto.computeHash.mockReturnValue({ result: Buffer.from('hash').toString('base64') });
      const data = Buffer.from('data');
      const result = virgilCrypto.calculateHash(data);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(NativeModules.RNVirgilCrypto.computeHash).toHaveBeenCalledWith(data.toString('base64'));
    });
    it('accepts "data" as utf8 string', () => {
      NativeModules.RNVirgilCrypto.computeHash.mockReturnValue({ result: Buffer.from('hash').toString('base64') });
      const data = 'data';
      const result = virgilCrypto.calculateHash(data);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(NativeModules.RNVirgilCrypto.computeHash).toHaveBeenCalledWith(Buffer.from('data').toString('base64'));
    });
    it('accepts "data" as object with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.computeHash.mockReturnValue({ result: Buffer.from('hash').toString('base64') });
      const data = { value: Buffer.from('data').toString('base64'), encoding: 'base64' };
      const result = virgilCrypto.calculateHash(data);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(NativeModules.RNVirgilCrypto.computeHash).toHaveBeenCalledWith(Buffer.from('data').toString('base64'));
    });
    it('returns Buffer when algorithm is not specified', () => {
      NativeModules.RNVirgilCrypto.computeHash.mockReturnValue({ result: Buffer.from('hash_of_data').toString('base64') });
      const result = virgilCrypto.calculateHash('data');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString('utf8')).toBe('hash_of_data');
    });
    it('returns Buffer when algorithm is specified', () => {
      const expectedResultBase64 = Buffer.from('hash_of_data').toString('base64');
      NativeModules.RNVirgilCrypto.computeHashWithAlgorithm.mockReturnValue({ result: expectedResultBase64 });
      const result = virgilCrypto.calculateHash('data', HashAlgorithm.SHA256);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString('utf8')).toBe('hash_of_data');
    });
    it('re-throws an error from native code (with default alg)', () => {
      NativeModules.RNVirgilCrypto.computeHash.mockReturnValue({ error: { message: 'Error' } });
      expect(() => {
        virgilCrypto.calculateHash('data');
      }).toThrow(RNVirgilCryptoError);
    });
    it('re-throws an error from native code (with specific alg)', () => {
      NativeModules.RNVirgilCrypto.computeHashWithAlgorithm.mockReturnValue({ error: { message: 'Error' } });
      expect(() => {
        virgilCrypto.calculateHash('data', HashAlgorithm.SHA256);
      }).toThrow(RNVirgilCryptoError);
    });
  });

  describe('getRandomBytes', () => {
    it('throws if "size" is not an integer', () => {
      expect(() => {
        virgilCrypto.getRandomBytes(1.5);
      }).toThrow(TypeError);
    });
    it('returns Buffer', () => {
      const expectedResultBase64 = Buffer.from('random_data').toString('base64');
      NativeModules.RNVirgilCrypto.generateRandomData.mockReturnValue({ result: expectedResultBase64 });
      const result = virgilCrypto.getRandomBytes(10);
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString('utf8')).toBe('random_data');
      expect(NativeModules.RNVirgilCrypto.generateRandomData.mock.calls[0][0]).toBe(10);
    });
    it('re-throws an error from native code', () => {
      NativeModules.RNVirgilCrypto.generateRandomData.mockReturnValue({ error: { message: 'Error' } });
      expect(() => {
        virgilCrypto.getRandomBytes(10);
      }).toThrow(RNVirgilCryptoError);
    });
  });

  describe('generateKeys', () => {
    it('generates key pair with default type', () => {
      NativeModules.RNVirgilCrypto.generateKeyPair.mockReturnValue({
        result: {
          privateKey: Buffer.from('private_key').toString('base64'),
          publicKey: Buffer.from('public_key').toString('base64')
        }
      });
      const keyPair = virgilCrypto.generateKeys();
      expect(keyPair.privateKey).toBeInstanceOf(VirgilPrivateKey);
      expect(keyPair.publicKey).toBeInstanceOf(VirgilPublicKey);
    });
    it('generates key pair with specific type', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairOfType.mockReturnValue({
        result: {
          privateKey: Buffer.from('private_key').toString('base64'),
          publicKey: Buffer.from('public_key').toString('base64')
        }
      });
      const keyPair = virgilCrypto.generateKeys(KeyPairType.SECP256R1);
      expect(keyPair.privateKey).toBeInstanceOf(VirgilPrivateKey);
      expect(keyPair.publicKey).toBeInstanceOf(VirgilPublicKey);
    });
    it('re-throws an error from native code (with default type)', () => {
      NativeModules.RNVirgilCrypto.generateKeyPair.mockReturnValue({ error: { message: 'Error' } });
      expect(() => {
        virgilCrypto.generateKeys();
      }).toThrow(RNVirgilCryptoError);
    });
    it('re-throws an error from native code (with specific type)', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairOfType.mockReturnValue({ error: { message: 'Error' } });
      expect(() => {
        virgilCrypto.generateKeys(KeyPairType.SECP256R1);
      }).toThrow(RNVirgilCryptoError);
    });
  });

  describe('generateKeysFromKeyMaterial', () => {
    it('accepts "seed" as Buffer', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed.mockReturnValue({
        result: {
          privateKey: Buffer.from('private_key').toString('base64'),
          publicKey: Buffer.from('public_key').toString('base64')
        }
      });
      const seed = Buffer.from('seed');
      virgilCrypto.generateKeysFromKeyMaterial(seed);
      expect(NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed).toHaveBeenCalledWith(seed.toString('base64'));
    });
    it('accepts "seed" as base64 string', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed.mockReturnValue({
        result: {
          privateKey: Buffer.from('private_key').toString('base64'),
          publicKey: Buffer.from('public_key').toString('base64')
        }
      });
      const seed = Buffer.from('seed').toString('base64');
      virgilCrypto.generateKeysFromKeyMaterial(seed);
      expect(NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed).toHaveBeenCalledWith(Buffer.from('seed').toString('base64'));
    });
    it('accepts "seed" as object with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed.mockReturnValue({
        result: {
          privateKey: Buffer.from('private_key').toString('base64'),
          publicKey: Buffer.from('public_key').toString('base64')
        }
      });
      const seed = { value: Buffer.from('seed').toString('hex'), encoding: 'hex' };
      virgilCrypto.generateKeysFromKeyMaterial(seed);
      expect(NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed).toHaveBeenCalledWith(Buffer.from('seed').toString('base64'));
    });
    it('generates key pair from seed with default type', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed.mockReturnValue({
        result: {
          privateKey: Buffer.from('private_key').toString('base64'),
          publicKey: Buffer.from('public_key').toString('base64')
        }
      });
      const expectedSeed = Buffer.from('seed').toString('base64');
      const keyPair = virgilCrypto.generateKeysFromKeyMaterial(expectedSeed);
      expect(keyPair.privateKey).toBeInstanceOf(VirgilPrivateKey);
      expect(keyPair.publicKey).toBeInstanceOf(VirgilPublicKey);
      expect(NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed.mock.calls[0][0]).toBe(expectedSeed);
    });
    it('generates key pair from seed with specific type', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairWithTypeAndSeed.mockReturnValue({
        result: {
          privateKey: Buffer.from('private_key').toString('base64'),
          publicKey: Buffer.from('public_key').toString('base64')
        }
      });
      const expectedSeed = Buffer.from('seed').toString('base64');
      const keyPair = virgilCrypto.generateKeysFromKeyMaterial(expectedSeed, KeyPairType.SECP256R1);
      expect(keyPair.privateKey).toBeInstanceOf(VirgilPrivateKey);
      expect(keyPair.publicKey).toBeInstanceOf(VirgilPublicKey);
      expect(NativeModules.RNVirgilCrypto.generateKeyPairWithTypeAndSeed.mock.calls[0][1]).toBe(expectedSeed);
    });
    it('re-throws an error from native code (with default type)', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairUsingSeed.mockReturnValue({ error: { message: 'Error' } });
      expect(() => {
        virgilCrypto.generateKeysFromKeyMaterial('c2VlZA==');
      }).toThrow(RNVirgilCryptoError);
    });
    it('re-throws an error from native code (with specific type)', () => {
      NativeModules.RNVirgilCrypto.generateKeyPairWithTypeAndSeed.mockReturnValue({ error: { message: 'Error' } });
      expect(() => {
        virgilCrypto.generateKeysFromKeyMaterial('c2VlZA==', KeyPairType.SECP256R1);
      }).toThrow(RNVirgilCryptoError);
    });
  });

  describe('encrypt', () => {
    it('accepts data as utf8 string', () => {
      NativeModules.RNVirgilCrypto.encrypt.mockReturnValue({ result: Buffer.from('ciphertext').toString('base64')});
      const data = 'data';
      virgilCrypto.encrypt(data, new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey')), false);
      expect(NativeModules.RNVirgilCrypto.encrypt).toHaveBeenCalledWith(Buffer.from('data').toString('base64'), ['pubkey'], false);
    });
    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilCrypto.encrypt.mockReturnValue({ result: Buffer.from('ciphertext').toString('base64')});
      const data = Buffer.from('data');
      virgilCrypto.encrypt(data, new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.encrypt).toHaveBeenCalledWith(Buffer.from('data').toString('base64'), ['pubkey'], false);
    });
    it('accepts data as object with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.encrypt.mockReturnValue({ result: Buffer.from('ciphertext').toString('base64')});
      const data = { value: Buffer.from('data').toString('base64'), encoding: 'base64' };
      virgilCrypto.encrypt(data, new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.encrypt).toHaveBeenCalledWith(Buffer.from('data').toString('base64'), ['pubkey'], false);
    });
    it('returns result as Buffer', () => {
      NativeModules.RNVirgilCrypto.encrypt.mockReturnValue({ result: Buffer.from('ciphertext').toString('base64')});
      const result = virgilCrypto.encrypt('data', new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('ciphertext');
    });
  });

  describe('decrypt', () => {
    it('accepts data as base64 string', () => {
      NativeModules.RNVirgilCrypto.decrypt.mockReturnValue({ result: Buffer.from('plaintext').toString('base64') });
      const ciphertext = Buffer.from('ciphertext').toString('base64');
      virgilCrypto.decrypt(ciphertext, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.decrypt).toHaveBeenCalledWith(ciphertext, 'privatekey');
    });

    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilCrypto.decrypt.mockReturnValue({ result: Buffer.from('plaintext').toString('base64') });
      const ciphertext = Buffer.from('ciphertext');
      virgilCrypto.decrypt(ciphertext, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.decrypt).toHaveBeenCalledWith(ciphertext.toString('base64'), 'privatekey');
    });

    it('accepts data as object with value and encoding', () => {
      NativeModules.RNVirgilCrypto.decrypt.mockReturnValue({ result: Buffer.from('plaintext').toString('base64') });
      const ciphertext = { value: 'ciphertext', encoding: 'utf8' };
      virgilCrypto.decrypt(ciphertext, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.decrypt).toHaveBeenCalledWith(Buffer.from('ciphertext').toString('base64'), 'privatekey');
    });

    it('returns result as Buffer', () => {
      NativeModules.RNVirgilCrypto.decrypt.mockReturnValue({ result: Buffer.from('plaintext').toString('base64') });
      const result = virgilCrypto.decrypt('ciphertext', new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('plaintext');
    });
  });

  describe('calculateSignature', () => {
    it('accepts data as utf8 string', () => {
      NativeModules.RNVirgilCrypto.generateSignature.mockReturnValue({ result: Buffer.from('signature').toString('base64') });
      const data = 'data';
      virgilCrypto.calculateSignature(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.generateSignature).toHaveBeenCalledWith(Buffer.from(data).toString('base64'), 'privatekey');
    });

    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilCrypto.generateSignature.mockReturnValue({ result: Buffer.from('signature').toString('base64') });
      const data = Buffer.from('data');
      virgilCrypto.calculateSignature(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.generateSignature).toHaveBeenCalledWith(data.toString('base64'), 'privatekey');
    });

    it('accepts data as object with value and encoding', () => {
      NativeModules.RNVirgilCrypto.generateSignature.mockReturnValue({ result: Buffer.from('signature').toString('base64') });
      const data = { value: 'data', encoding: 'utf8' };
      virgilCrypto.calculateSignature(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.generateSignature).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privatekey'
      );
    });

    it('returns result as Buffer', () => {
      NativeModules.RNVirgilCrypto.generateSignature.mockReturnValue({ result: Buffer.from('signature').toString('base64') });
      const data = 'data';
      const signature = virgilCrypto.calculateSignature(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')));
      expect(Buffer.isBuffer(signature)).toBe(true);
      expect(signature.toString()).toBe('signature');
    });
  });

  describe('verifySignature', () => {
    it('accepts data and signature as strings', () => {
      NativeModules.RNVirgilCrypto.verifySignature.mockReturnValue({ result: true });
      const data = 'data';
      const signature = Buffer.from('signature').toString('base64');
      virgilCrypto.verifySignature(data, signature, new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.verifySignature).toHaveBeenCalledWith(
        signature,
        Buffer.from(data).toString('base64'),
        'pubkey'
      );
    });
    it('accepts data and signature as Buffers', () => {
      NativeModules.RNVirgilCrypto.verifySignature.mockReturnValue({ result: true });
      const data = Buffer.from('data');
      const signature = Buffer.from('signature');
      virgilCrypto.verifySignature(data, signature, new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.verifySignature).toHaveBeenCalledWith(
        signature.toString('base64'),
        data.toString('base64'),
        'pubkey'
      );
    });
    it('accepts data and signature as objects with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.verifySignature.mockReturnValue({ result: true });
      const data = { value: 'data', encoding: 'utf8' };
      const signature = { value: 'signature', encoding: 'utf8' };
      virgilCrypto.verifySignature(data, signature, new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.verifySignature).toHaveBeenCalledWith(
        Buffer.from('signature').toString('base64'),
        Buffer.from('data').toString('base64'),
        'pubkey'
      );
    });
    it('returns boolean', () => {
      NativeModules.RNVirgilCrypto.verifySignature.mockReturnValue({ result: true });
      const data = 'data';
      const signature = Buffer.from('signature').toString('base64');
      const result = virgilCrypto.verifySignature(data, signature, new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(result).toBe(true);
    })
  });

  describe('signThenEncrypt', () => {
    it('accepts data as utf8 string', () => {
      NativeModules.RNVirgilCrypto.signThenEncrypt.mockReturnValue({
        result: Buffer.from('ciphertext').toString('base64')
      });
      const data = 'data';
      virgilCrypto.signThenEncrypt(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.signThenEncrypt).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privatekey',
        ['pubkey'],
        false
      );
    });
    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilCrypto.signThenEncrypt.mockReturnValue({
        result: Buffer.from('ciphertext').toString('base64')
      });
      const data = Buffer.from('data');
      virgilCrypto.signThenEncrypt(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.signThenEncrypt).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privatekey',
        ['pubkey'],
        false
      );
    });
    it('accepts data as object with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.signThenEncrypt.mockReturnValue({
        result: Buffer.from('ciphertext').toString('base64')
      });
      const data = { value: 'data', encoding: 'utf8' };
      virgilCrypto.signThenEncrypt(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.signThenEncrypt).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privatekey',
        ['pubkey'],
        false
      );
    });
    it('returns Buffer', () => {
      NativeModules.RNVirgilCrypto.signThenEncrypt.mockReturnValue({
        result: Buffer.from('ciphertext').toString('base64')
      });
      const data = 'data';
      const result = virgilCrypto.signThenEncrypt(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('ciphertext');
    });
  });

  describe('decryptThenVerify', () => {
    it('accepts data as base64 string', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerify.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const data = Buffer.from('ciphertext').toString('base64');
      virgilCrypto.decryptThenVerify(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.decryptThenVerify).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        'privatekey',
        ['pubkey']
      );
    });
    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerify.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const data = Buffer.from('ciphertext');
      virgilCrypto.decryptThenVerify(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.decryptThenVerify).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        'privatekey',
        ['pubkey']
      );
    });
    it('accepts data as object with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerify.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const data = { value: 'ciphertext', encoding: 'utf8' };
      virgilCrypto.decryptThenVerify(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.decryptThenVerify).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        'privatekey',
        ['pubkey']
      );
    });
    it('returns Buffer', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerify.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const ciphertext = 'ciphertext';
      const result = virgilCrypto.decryptThenVerify(ciphertext, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey',  dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('plaintext');
    });
  });

  describe('extractPublicKey', () => {
    it('returns VirgilPublicKey', () => {
      NativeModules.RNVirgilCrypto.extractPublicKey.mockReturnValue({
        result: Buffer.from('pubkey').toString('base64')
      });
      const privateKey = new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey'));
      const publicKey = virgilCrypto.extractPublicKey(privateKey);
      expect(NativeModules.RNVirgilCrypto.extractPublicKey).toHaveBeenCalledWith('privatekey');
      expect(publicKey).toBeInstanceOf(VirgilPublicKey);
    });
  });

  describe('exportPrivateKey', () => {
    it('returns key value as Buffer', () => {
      const expectedValueBuffer = Buffer.from('privateKey');
      const privateKey = new VirgilPrivateKey(expectedValueBuffer.toString('base64'), dataToBase64('privateKey', 'base64', 'rawPrivateKey'));
      const actualValue = virgilCrypto.exportPrivateKey(privateKey);
      expect(Buffer.isBuffer(actualValue)).toBe(true);
      expect(actualValue.equals(expectedValueBuffer)).toBe(true);
    });
  });

  describe('exportPublicKey', () => {
    it('returns key value as Buffer', () => {
      const expectedValueBuffer = Buffer.from('publicKey');
      const publicKey = new VirgilPublicKey(expectedValueBuffer.toString('base64'), dataToBase64('publicKey', 'base64', 'rawPrivateKey'));
      const actualValue = virgilCrypto.exportPublicKey(publicKey);
      expect(Buffer.isBuffer(actualValue)).toBe(true);
      expect(actualValue.equals(expectedValueBuffer)).toBe(true);
    });
  });

  describe('importPrivateKey', () => {
    it('accepts raw key as base64 string', () => {
      const rawKey = Buffer.from('rawKey').toString('base64');
      const privateKey = virgilCrypto.importPrivateKey(rawKey);
      expect(privateKey).toBeInstanceOf(VirgilPrivateKey);
    });

    it('accepts raw key as Buffer', () => {
      const rawKey = Buffer.from('rawKey');
      const privateKey = virgilCrypto.importPrivateKey(rawKey);
      expect(privateKey).toBeInstanceOf(VirgilPrivateKey);
    });

    it('accepts raw key as object with value and encoding', () => {
      const rawKey = { value: 'rawKey', encoding: 'utf8' };
      const privateKey = virgilCrypto.importPrivateKey(rawKey);
      expect(privateKey).toBeInstanceOf(VirgilPrivateKey);
    });
  });

  describe('importPublicKey', () => {
    it('accepts raw key as base64 string', () => {
      const rawKey = Buffer.from('rawKey').toString('base64');
      const publicKey = virgilCrypto.importPublicKey(rawKey);
      expect(publicKey).toBeInstanceOf(VirgilPublicKey);
    });

    it('accepts raw key as Buffer', () => {
      const rawKey = Buffer.from('rawKey');
      const publicKey = virgilCrypto.importPublicKey(rawKey);
      expect(publicKey).toBeInstanceOf(VirgilPublicKey);
    });

    it('accepts raw key as object with value and encoding', () => {
      const rawKey = { value: 'rawKey', encoding: 'utf8' };
      const publicKey = virgilCrypto.importPublicKey(rawKey);
      expect(publicKey).toBeInstanceOf(VirgilPublicKey);
    });
  });

  describe('encryptFile', () => {
    it('can encrypt file by input path', async () => {
      NativeModules.RNVirgilCrypto.encryptFile.mockResolvedValue('/output/path');
      const inputPath = '/path/to/file';
      const publicKey = new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'));

      const outputPath = await virgilCrypto.encryptFile({ inputPath, publicKeys: publicKey });
      expect(outputPath).toBe('/output/path');
      expect(NativeModules.RNVirgilCrypto.encryptFile).toHaveBeenCalledWith(
        '/path/to/file',
        undefined,
        ['pubkey'],
        false
      );
    });

    it('can encrypt file to specified output', async () => {
      NativeModules.RNVirgilCrypto.encryptFile.mockResolvedValue('/output/path');
      const inputPath = '/path/to/file';
      const outputPath = '/output/path';
      const publicKey = new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'));

      const actualOutputPath = await virgilCrypto.encryptFile({ inputPath, outputPath, publicKeys: publicKey });
      expect(actualOutputPath).toBe('/output/path');
      expect(NativeModules.RNVirgilCrypto.encryptFile).toHaveBeenCalledWith(
        '/path/to/file',
        '/output/path',
        ['pubkey'],
        false
      );
    });

    it('normalizes input and output paths', async () => {
      NativeModules.RNVirgilCrypto.encryptFile.mockResolvedValue('/output/path');
      const inputPath = 'file:///path/to/file';
      const outputPath = 'file:///output/path';
      const publicKey = new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'));

      const actualOutputPath = await virgilCrypto.encryptFile({ inputPath, outputPath, publicKeys: publicKey });
      expect(actualOutputPath).toBe('/output/path');
      expect(NativeModules.RNVirgilCrypto.encryptFile).toHaveBeenCalledWith(
        '/path/to/file',
        '/output/path',
        ['pubkey'],
        false
      );
    });
  });

  describe('decryptFile', () => {
    it('can decrypt file by input path', async () => {
      NativeModules.RNVirgilCrypto.decryptFile.mockResolvedValue('/output/path');
      const inputPath = '/path/to/file';
      const privateKey = new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey'));

      const outputPath = await virgilCrypto.decryptFile({ inputPath, privateKey });
      expect(outputPath).toBe('/output/path');
      expect(NativeModules.RNVirgilCrypto.decryptFile).toHaveBeenCalledWith(
        '/path/to/file',
        undefined,
        'privatekey'
      );
    });

    it('can encrypt file to specified output', async () => {
      NativeModules.RNVirgilCrypto.decryptFile.mockResolvedValue('/output/path');
      const inputPath = '/path/to/file';
      const outputPath = '/output/path';
      const privateKey = new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey'));

      const actualOutputPath = await virgilCrypto.decryptFile({ inputPath, outputPath, privateKey });
      expect(actualOutputPath).toBe('/output/path');
      expect(NativeModules.RNVirgilCrypto.decryptFile).toHaveBeenCalledWith(
        '/path/to/file',
        '/output/path',
        'privatekey'
      );
    });

    it('normalizes input and output paths', async () => {
      NativeModules.RNVirgilCrypto.decryptFile.mockResolvedValue('/output/path');
      const inputPath = 'file:///path/to/file';
      const outputPath = 'file:///output/path';
      const privateKey = new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey'));

      const actualOutputPath = await virgilCrypto.decryptFile({ inputPath, outputPath, privateKey });
      expect(actualOutputPath).toBe('/output/path');
      expect(NativeModules.RNVirgilCrypto.decryptFile).toHaveBeenCalledWith(
        '/path/to/file',
        '/output/path',
        'privatekey'
      );
    });
  });

  describe('generateFileSignature', () => {
    it('normalizes input file path', async () => {
      const expectedSignature = Buffer.from('signature').toString('base64');
      NativeModules.RNVirgilCrypto.generateFileSignature.mockResolvedValue(expectedSignature);

      const signature = await virgilCrypto.generateFileSignature({
        inputPath: 'file:///path/to/file',
        privateKey: new VirgilPrivateKey('privateKey', dataToBase64('privateKey', 'base64', 'rawPrivateKey'))
      });

      expect(signature).toBe(expectedSignature);
      expect(NativeModules.RNVirgilCrypto.generateFileSignature).toHaveBeenCalledWith(
        '/path/to/file',
        'privateKey'
      );
    });
  });

  describe('verifyFileSignature', () => {
    it('accepts signature as base64 string', async () => {
      NativeModules.RNVirgilCrypto.verifyFileSignature.mockResolvedValue(true);
      const signature = Buffer.from('signature').toString('base64');

      const isValid = await virgilCrypto.verifyFileSignature({
        inputPath: '/path/to/file',
        signature,
        publicKey: new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      });

      expect(isValid).toBe(true);
      expect(NativeModules.RNVirgilCrypto.verifyFileSignature).toHaveBeenCalledWith(
        Buffer.from('signature').toString('base64'),
        '/path/to/file',
        'pubkey'
      );
    });

    it('accepts signature as Buffer', async () => {
      NativeModules.RNVirgilCrypto.verifyFileSignature.mockResolvedValue(true);
      const signature = Buffer.from('signature');

      const isValid = await virgilCrypto.verifyFileSignature({
        inputPath: '/path/to/file',
        signature,
        publicKey: new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      });

      expect(isValid).toBe(true);
      expect(NativeModules.RNVirgilCrypto.verifyFileSignature).toHaveBeenCalledWith(
        Buffer.from('signature').toString('base64'),
        '/path/to/file',
        'pubkey'
      );
    });

    it('accepts signature as object with value and encoding', async () => {
      NativeModules.RNVirgilCrypto.verifyFileSignature.mockResolvedValue(true);
      const signature = { value: 'signature', encoding: 'utf8' };

      const isValid = await virgilCrypto.verifyFileSignature({
        inputPath: '/path/to/file',
        signature,
        publicKey: new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      });

      expect(isValid).toBe(true);
      expect(NativeModules.RNVirgilCrypto.verifyFileSignature).toHaveBeenCalledWith(
        Buffer.from('signature').toString('base64'),
        '/path/to/file',
        'pubkey'
      );
    });

    it('normalizes input path', async () => {
      NativeModules.RNVirgilCrypto.verifyFileSignature.mockResolvedValue(true);
      const signature = Buffer.from('signature');

      await virgilCrypto.verifyFileSignature({
        inputPath: 'file:///path/to/file',
        signature,
        publicKey: new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      });

      expect(NativeModules.RNVirgilCrypto.verifyFileSignature).toHaveBeenCalledWith(
        Buffer.from('signature').toString('base64'),
        '/path/to/file',
        'pubkey'
      );
    });
  });

  describe('signThenEncryptDetached', () => {
    it('accepts data as utf8 string', () => {
      NativeModules.RNVirgilCrypto.signThenEncryptDetached.mockReturnValue({
        result: {
          encryptedData: Buffer.from('ciphertext').toString('base64'),
          metadata: Buffer.from('metadata').toString('base64')
        }
      });
      const data = 'data';
      virgilCrypto.signThenEncryptDetached(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.signThenEncryptDetached).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privatekey',
        ['pubkey'],
        false
      );
    });
    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilCrypto.signThenEncryptDetached.mockReturnValue({
        result: {
          encryptedData: Buffer.from('ciphertext').toString('base64'),
          metadata: Buffer.from('metadata').toString('base64')
        }
      });
      const data = Buffer.from('data');
      virgilCrypto.signThenEncryptDetached(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.signThenEncryptDetached).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privatekey',
        ['pubkey'],
        false
      );
    });
    it('accepts data as object with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.signThenEncryptDetached.mockReturnValue({
        result: {
          encryptedData: Buffer.from('ciphertext').toString('base64'),
          metadata: Buffer.from('metadata').toString('base64')
        }
      });
      const data = { value: 'data', encoding: 'utf8' };
      virgilCrypto.signThenEncryptDetached(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(NativeModules.RNVirgilCrypto.signThenEncryptDetached).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privatekey',
        ['pubkey'],
        false
      );
    });
    it('returns enceryptedData and metadata as Buffers', () => {
      NativeModules.RNVirgilCrypto.signThenEncryptDetached.mockReturnValue({
        result: {
          encryptedData: Buffer.from('ciphertext').toString('base64'),
          metadata: Buffer.from('metadata').toString('base64')
        }
      });
      const data = 'data';
      const result = virgilCrypto.signThenEncryptDetached(data, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey')));
      expect(result).toHaveProperty('encryptedData');
      expect(result).toHaveProperty('metadata');
      expect(Buffer.isBuffer(result.encryptedData)).toBe(true);
      expect(Buffer.isBuffer(result.metadata)).toBe(true);
      expect(result.encryptedData.toString()).toBe('ciphertext');
      expect(result.metadata.toString()).toBe('metadata');
    });
  });

  describe('decryptThenVerifyDetached', () => {
    it('accepts encrypted data and metadata as base64 strings', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerifyDetached.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const data = Buffer.from('ciphertext').toString('base64');
      const metadata = Buffer.from('metadata').toString('base64');

      virgilCrypto.decryptThenVerifyDetached(
        data, metadata, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      );
      expect(NativeModules.RNVirgilCrypto.decryptThenVerifyDetached).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        Buffer.from('metadata').toString('base64'),
        'privatekey',
        ['pubkey']
      );
    });

    it('accepts encrypted data and metadata as Buffers', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerifyDetached.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const data = Buffer.from('ciphertext');
      const metadata = Buffer.from('metadata');

      virgilCrypto.decryptThenVerifyDetached(
        data, metadata, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      );
      expect(NativeModules.RNVirgilCrypto.decryptThenVerifyDetached).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        Buffer.from('metadata').toString('base64'),
        'privatekey',
        ['pubkey']
      );
    });

    it('accepts encrypted data and metadata as objects with string value and encoding', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerifyDetached.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const data = { value: 'ciphertext', encoding: 'utf8' };
      const metadata = { value: 'metadata', encoding: 'utf8' };

      virgilCrypto.decryptThenVerifyDetached(
        data, metadata, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      );
      expect(NativeModules.RNVirgilCrypto.decryptThenVerifyDetached).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        Buffer.from('metadata').toString('base64'),
        'privatekey',
        ['pubkey']
      );
    });

    it('returns result as Buffer', () => {
      NativeModules.RNVirgilCrypto.decryptThenVerifyDetached.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const data = Buffer.from('ciphertext');
      const metadata = Buffer.from('metadata');

      const result = virgilCrypto.decryptThenVerifyDetached(
        data, metadata, new VirgilPrivateKey('privatekey', dataToBase64('privatekey', 'base64', 'rawPrivateKey')), new VirgilPublicKey('pubkey', dataToBase64('pubkey', 'base64', 'rawPrivateKey'))
      );

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('plaintext');
    });
  });

  describe('generateGroupSession', () => {
    it('throws if groupId is less than 10 bytes long', () => {
      expect(() => virgilCrypto.generateGroupSession('id')).toThrow(/group id is too short/i);
    });

    it('creates group with correct session id', () => {
      NativeModules.RNVirgilCrypto.generateGroupSession.mockReturnValue({
        result: {
          sessionId: Buffer.from('sessionId').toString('base64'),
          currentEpochNumber: 1,
          epochMessages: [Buffer.from('epochMessage').toString('base64')]
        }
      });
      const group = virgilCrypto.generateGroupSession('long_enough_to_be_a_group_id');
      expect(group).toBeDefined();
      expect(NativeModules.RNVirgilCrypto.generateGroupSession).toHaveBeenCalledWith(
        Buffer.from('long_enough_to_be_a_group_id').toString('base64')
      );
      expect(group.getSessionId()).toBe(Buffer.from('sessionId').toString('hex'));
      expect(group.getCurrentEpochNumber()).toBe(1);
    });

    it('accepts group id as Buffer', () => {
      NativeModules.RNVirgilCrypto.generateGroupSession.mockReturnValue({
        result: {
          sessionId: Buffer.from('sessionId').toString('base64'),
          currentEpochNumber: 1,
          epochMessages: [Buffer.from('epochMessage').toString('base64')]
        }
      });
      virgilCrypto.generateGroupSession(Buffer.from('long_enough_to_be_a_group_id'));
      expect(NativeModules.RNVirgilCrypto.generateGroupSession).toHaveBeenCalledWith(
        Buffer.from('long_enough_to_be_a_group_id').toString('base64')
      );
    });

    it('accepts group id as object with value and encoding', () => {
      NativeModules.RNVirgilCrypto.generateGroupSession.mockReturnValue({
        result: {
          sessionId: Buffer.from('sessionId').toString('base64'),
          currentEpochNumber: 1,
          epochMessages: [Buffer.from('epochMessage').toString('base64')]
        }
      });
      virgilCrypto.generateGroupSession({ value: 'long_enough_to_be_a_group_id', encoding: 'utf8' });
      expect(NativeModules.RNVirgilCrypto.generateGroupSession).toHaveBeenCalledWith(
        Buffer.from('long_enough_to_be_a_group_id').toString('base64')
      );
    });
  });

  describe('importGroupSession', () => {
    it('throws if epoch messages array is empty', () => {
      expect(() => virgilCrypto.importGroupSession(undefined)).toThrow(/epoch messages must be an array/i);
      expect(() => virgilCrypto.importGroupSession([])).toThrow(/epoch messages must not be empty/i);
    });

    it('re-constructs the group from epoch messages', () => {
      NativeModules.RNVirgilCrypto.importGroupSession.mockReturnValue({
        result: {
          sessionId: Buffer.from('sessionId').toString('base64'),
          currentEpochNumber: 3,
          epochMessages: [
            Buffer.from('epochMessage1').toString('base64'),
            Buffer.from('epochMessage2').toString('base64'),
            Buffer.from('epochMessage3').toString('base64'),
          ]
        }
      });
      const group = virgilCrypto.importGroupSession([
        Buffer.from('epochMessage1').toString('base64'),
        Buffer.from('epochMessage2').toString('base64'),
        Buffer.from('epochMessage3').toString('base64'),
      ]);
      expect(NativeModules.RNVirgilCrypto.importGroupSession).toHaveBeenCalledWith(
        [
          Buffer.from('epochMessage1').toString('base64'),
          Buffer.from('epochMessage2').toString('base64'),
          Buffer.from('epochMessage3').toString('base64'),
        ]
      );
      expect(group.getSessionId()).toBe(Buffer.from('sessionId').toString('hex'));
      expect(group.getCurrentEpochNumber()).toBe(3);
    });

    it('accepts group messages as Buffers', () => {
      NativeModules.RNVirgilCrypto.importGroupSession.mockReturnValue({
        result: {
          sessionId: Buffer.from('sessionId').toString('base64'),
          currentEpochNumber: 3,
          epochMessages: [
            Buffer.from('epochMessage1').toString('base64'),
            Buffer.from('epochMessage2').toString('base64'),
            Buffer.from('epochMessage3').toString('base64'),
          ]
        }
      });
      virgilCrypto.importGroupSession([
        Buffer.from('epochMessage1'),
        Buffer.from('epochMessage2'),
        Buffer.from('epochMessage3'),
      ]);
      expect(NativeModules.RNVirgilCrypto.importGroupSession).toHaveBeenCalledWith(
        [
          Buffer.from('epochMessage1').toString('base64'),
          Buffer.from('epochMessage2').toString('base64'),
          Buffer.from('epochMessage3').toString('base64'),
        ]
      );
    });

    it('accepts group messages as objects with value and encoding', () => {
      NativeModules.RNVirgilCrypto.importGroupSession.mockReturnValue({
        result: {
          sessionId: Buffer.from('sessionId').toString('base64'),
          currentEpochNumber: 3,
          epochMessages: [
            Buffer.from('epochMessage1').toString('base64'),
            Buffer.from('epochMessage2').toString('base64'),
            Buffer.from('epochMessage3').toString('base64'),
          ]
        }
      });
      virgilCrypto.importGroupSession([
        { value: 'epochMessage1', encoding: 'utf8' },
        { value: 'epochMessage2', encoding: 'utf8' },
        { value: 'epochMessage3', encoding: 'utf8' },
      ]);
      expect(NativeModules.RNVirgilCrypto.importGroupSession).toHaveBeenCalledWith(
        [
          Buffer.from('epochMessage1').toString('base64'),
          Buffer.from('epochMessage2').toString('base64'),
          Buffer.from('epochMessage3').toString('base64'),
        ]
      );
    });
  });

  describe('calculateGroupSessionId', () => {
    it('throws if groupId is less than 10 bytes long', () => {
      expect(() => virgilCrypto.calculateGroupSessionId('short_id')).toThrow(/group id is too short/i);
    });

    it('returns correct session id as hex string', () => {
      const groupIdHash = Buffer.from('x'.repeat(64), 'ascii');
      const expectedSessionId = groupIdHash.slice(0, 32).toString('hex');
      NativeModules.RNVirgilCrypto.computeHashWithAlgorithm.mockReturnValue({
        result: groupIdHash.toString('base64')
      })

      const groupSessionId = virgilCrypto.calculateGroupSessionId('long_enough_to_be_a_group_id');
      expect(NativeModules.RNVirgilCrypto.computeHashWithAlgorithm).toHaveBeenCalledWith(
        Buffer.from('long_enough_to_be_a_group_id').toString('base64'),
        'NativeHashAlgorigthm.SHA512'
      );
      expect(groupSessionId).toBe(expectedSessionId);
    });

    it('accepts group id as Buffer', () => {
      const groupIdHash = Buffer.from('x'.repeat(64), 'ascii');
      NativeModules.RNVirgilCrypto.computeHashWithAlgorithm.mockReturnValue({
        result: groupIdHash.toString('base64')
      })
      virgilCrypto.calculateGroupSessionId(Buffer.from('long_enough_to_be_a_group_id'));
      expect(NativeModules.RNVirgilCrypto.computeHashWithAlgorithm).toHaveBeenCalledWith(
        Buffer.from('long_enough_to_be_a_group_id').toString('base64'),
        'NativeHashAlgorigthm.SHA512'
      );
    });

    it('accepts group id as object with value and encoding', () => {
      const groupIdHash = Buffer.from('x'.repeat(64), 'ascii');
      NativeModules.RNVirgilCrypto.computeHashWithAlgorithm.mockReturnValue({
        result: groupIdHash.toString('base64')
      })
      virgilCrypto.calculateGroupSessionId({ value: 'long_enough_to_be_a_group_id', encoding: 'utf8' });
      expect(NativeModules.RNVirgilCrypto.computeHashWithAlgorithm).toHaveBeenCalledWith(
        Buffer.from('long_enough_to_be_a_group_id').toString('base64'),
        'NativeHashAlgorigthm.SHA512'
      );
    });
  });
});
