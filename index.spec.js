import { virgilCrypto, Buffer, KeyPairType, HashAlgorithm } from './';

jest.mock('react-native', () => ({
  NativeModules: {
    RNVirgilCrypto: {
    },
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('VirgilCrypto', () => {
  it('`virgilCrypto` exists', () => expect(virgilCrypto).toBeDefined());
  it('`KeyPairType` exists', () => expect(KeyPairType).toBeDefined());
  it('`HashAlgorithm` exists', () => expect(HashAlgorithm).toBeDefined());
  it('`Buffer` exists', () => expect(Buffer).toBeDefined());
});
