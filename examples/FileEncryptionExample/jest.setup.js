jest.mock('react-native-virgil-crypto', () => ({
  virgilCrypto: {
    generateKeys: () => ({privateKey: {}, publicKey: {}}),
    encryptFile: async () => '',
    decryptFile: async () => '',
    generateFileSignature: async () => ({toString: () => ''}),
    verifyFileSignature: async () => true,
  },
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    config: () => ({fetch: async () => ({info: () => ({status: 200, headers: {}}), path: () => '', text: async () => ''})}),
    fs: {unlink: async () => undefined, dirs: {DocumentDir: ''}},
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: async () => ({didCancel: true}),
}));
