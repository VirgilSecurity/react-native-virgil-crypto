jest.mock('react-native-virgil-crypto', () => ({
  virgilCrypto: {
    generateKeys: () => ({privateKey: {}, publicKey: {}}),
    signAndEncrypt: () => ({toString: () => ''}),
    decryptAndVerify: () => ({toString: () => ''}),
  },
  KeyPairType: {CURVE25519_ROUND5_ED25519_FALCON: 'curve25519r5ed25519falcon'},
}));
