jest.mock('react-native-virgil-crypto', () => ({
  virgilCrypto: {},
  virgilBrainKeyCrypto: {},
  KeyPairType: {},
  HashAlgorithm: {},
  Buffer: {alloc: () => ({})},
}));
