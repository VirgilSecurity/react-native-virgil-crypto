import { NativeModules } from 'react-native';
import { Buffer } from 'buffer';
import { virgilCrypto } from './virgil-crypto';
import { HashAlgorithm } from './hash-algorithm';

jest.mock('react-native', () => ({
  NativeModules: {
    RNVirgilCrypto: {
      HashAlgorithm: { SHA256: 'SHA256'},
      computeHash: jest.fn(),
      computeHashWithAlgorithm: jest.fn()
    },
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('virgilCrypto', () => {
  beforeEach(() => {
    NativeModules.RNVirgilCrypto.computeHash.mockReset();
    NativeModules.RNVirgilCrypto.computeHashWithAlgorithm.mockReset();
  });
  describe('calculateHash', () => {
    it('returns Buffer when algorithm is not specified', () => {
      const expectedResultBase64 = Buffer.from('hash_of_data').toString('base64');
      NativeModules.RNVirgilCrypto.computeHash.mockReturnValue({ result: expectedResultBase64 });
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
  });
});