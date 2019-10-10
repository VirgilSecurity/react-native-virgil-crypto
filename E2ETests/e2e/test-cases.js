module.exports = {
  'generates key pair': ({ virgilCrypto }, expect) => {
    const keyPair = virgilCrypto.generateKeys();
    expect(keyPair.privateKey).to.be.ok;
    expect(keyPair.publicKey).to.be.ok;
  },

  'generates key pair from seed': ({ virgilCrypto },
     expect) => {
    const seed = virgilCrypto.getRandomBytes(32);
    const keyPair = virgilCrypto.generateKeysFromKeyMaterial(seed);
    expect(keyPair.privateKey).to.be.ok;
    expect(keyPair.publicKey).to.be.ok;
  },

  'returns same keys from the same seed': ({ virgilCrypto }, expect) => {
    const seed = virgilCrypto.getRandomBytes(32);
    const keyPair1 = virgilCrypto.generateKeysFromKeyMaterial(seed);
    const keyPair2 = virgilCrypto.generateKeysFromKeyMaterial(seed);
    const privateKey1 = virgilCrypto.exportPrivateKey(keyPair1.privateKey);
    const privateKey2 = virgilCrypto.exportPrivateKey(keyPair2.privateKey);
    expect(privateKey1.equals(privateKey2)).to.be.true;
  },

  'returns different keys from different seeds': ({ virgilCrypto }, expect) => {
    const seed1 = virgilCrypto.getRandomBytes(32);
    const seed2 = virgilCrypto.getRandomBytes(32);
    const keyPair1 = virgilCrypto.generateKeysFromKeyMaterial(seed1);
    const keyPair2 = virgilCrypto.generateKeysFromKeyMaterial(seed2);
    const privateKey1 = virgilCrypto.exportPrivateKey(keyPair1.privateKey);
    const privateKey2 = virgilCrypto.exportPrivateKey(keyPair2.privateKey);
    expect(privateKey1.equals(privateKey2)).to.be.false;
  },

  'importPrivateKey -> exportPrivateKey': ({ virgilCrypto }, expect) => {
    const privateKeyHex =
      '302e020100300506032b6570042204204ac70df9ed0d8e54c7537181097f53f30e171474d2322c3f91438d1bbef75e73';
    const privateKey = virgilCrypto.importPrivateKey({ value: privateKeyHex, encoding: 'hex' });
    const exportedKey = virgilCrypto.exportPrivateKey(privateKey);
    expect(exportedKey.toString('hex')).to.equal(privateKeyHex);
  },

  'importPublicKey -> exportPublicKey': ({ virgilCrypto }, expect) => {
    const publicKeyHex =
      '302a300506032b65700321005da627bebb5f5edc843b649a60d2db9886c0ede6a1f24289aed4f13e59935539';
    const publicKey = virgilCrypto.importPublicKey({ value: publicKeyHex, encoding: 'hex' });
    const exportedKey = virgilCrypto.exportPublicKey(publicKey);
    expect(exportedKey.toString('hex')).to.equal(publicKeyHex);
  },
  
  'encrypt -> decrypt': ({ virgilCrypto }, expect) => {
    const data = 'data';
    const keyPair = virgilCrypto.generateKeys();
    const cipherData = virgilCrypto.encrypt({ value: data, encoding: 'utf8' }, keyPair.publicKey);
    const decryptedData = virgilCrypto.decrypt(cipherData, keyPair.privateKey);
    expect(decryptedData.toString()).to.equal(data);
  },

  'throws if `encrypt` is called with an empty array of recipients': ({ virgilCrypto }, expect) => {
    const error = () => {
      virgilCrypto.encrypt({ value: 'secret message', encoding: 'utf8' }, []);
    };
    expect(error).to.throw;
  },

  'produces correct hash': ({ virgilCrypto, Buffer }, expect) => {
    const hash = virgilCrypto.calculateHash({ value: 'data', encoding: 'utf8' });
    const expectedHash = Buffer.from(
      '77c7ce9a5d86bb386d443bb96390faa120633158699c8844c30b13ab0bf92760b7e4416aea397db91b4ac0e5dd56b8ef7e4b066162ab1fdc088319ce6defc876',
      'hex',
    );
    expect(hash.equals(expectedHash)).to.be.true;
  },

  'produces the same hash for the same data': ({ virgilCrypto }, expect) => {
    const hash1 = virgilCrypto.calculateHash({ value: 'data', encoding: 'utf8' });
    const hash2 = virgilCrypto.calculateHash({ value: 'data', encoding: 'utf8' });
    expect(hash1.equals(hash2)).to.be.true;
  },

  'produces different hash for different algorithms': ({ virgilCrypto, HashAlgorithm }, expect) => {
    const hash1 = virgilCrypto.calculateHash(
      { value: 'data', encoding: 'utf8' },
      HashAlgorithm.SHA256,
    );
    const hash2 = virgilCrypto.calculateHash(
      { value: 'data', encoding: 'utf8' },
      HashAlgorithm.SHA384,
    );
    expect(hash1.equals(hash2)).to.be.false;
  },

  'extractPublicKey': ({ virgilCrypto }, expect) => {
    const keyPair = virgilCrypto.generateKeys();
    const publicKey = virgilCrypto.extractPublicKey(keyPair.privateKey);
    const key1 = virgilCrypto.exportPublicKey(keyPair.publicKey);
    const key2 = virgilCrypto.exportPublicKey(publicKey);
    expect(key1.equals(key2)).to.be.true;
  },

  'calculateSignature -> verifySignature': ({ virgilCrypto }, expect) => {
    const data = 'data';
    const keyPair = virgilCrypto.generateKeys();
    const signature = virgilCrypto.calculateSignature(
      { value: data, encoding: 'utf8' },
      keyPair.privateKey,
    );
    const isValid = virgilCrypto.verifySignature(
      { value: data, encoding: 'utf8' },
      signature,
      keyPair.publicKey,
    );
    expect(isValid).to.be.true;
  },

  'STE-DTV: decrypts and verifies': ({ virgilCrypto }, expect) => {
    const senderKeyPair = virgilCrypto.generateKeys();
    const recipientKeyPair = virgilCrypto.generateKeys();
    const message = 'Secret message';
    const cipherData = virgilCrypto.signThenEncrypt(
      { value: message, encoding: 'utf8' },
      senderKeyPair.privateKey,
      recipientKeyPair.publicKey,
    );
    const decryptedMessage = virgilCrypto.decryptThenVerify(
      cipherData,
      recipientKeyPair.privateKey,
      senderKeyPair.publicKey,
    );
    expect(decryptedMessage.toString()).to.equal(message);
  },

  'STE-DTV: decrypts and verifies given the right keys': ({ virgilCrypto, Buffer }, expect) => {
    const data = Buffer.from('Secret message');
    const senderKeyPair = virgilCrypto.generateKeys();
    const recipientKeyPair = virgilCrypto.generateKeys();
    const additionalKeyPair = virgilCrypto.generateKeys();
    const anotherKeyPair = virgilCrypto.generateKeys();
    const encryptedData = virgilCrypto.signThenEncrypt(
      data,
      senderKeyPair.privateKey,
      recipientKeyPair.publicKey,
    );
    const decryptedData = virgilCrypto.decryptThenVerify(
      encryptedData,
      recipientKeyPair.privateKey,
      [additionalKeyPair.publicKey, anotherKeyPair.publicKey, senderKeyPair.publicKey],
    );
    expect(decryptedData.equals(data)).to.be.true;
  },

  'STE-DTV: fails verification given the wrong keys': ({ virgilCrypto, Buffer }, expect) => {
    const data = Buffer.from('Secret message');
    const senderKeyPair = virgilCrypto.generateKeys();
    const recipientKeyPair = virgilCrypto.generateKeys();
    const additionalKeyPair = virgilCrypto.generateKeys();
    const anotherKeyPair = virgilCrypto.generateKeys();
    const encryptedData = virgilCrypto.signThenEncrypt(
      data,
      senderKeyPair.privateKey,
      recipientKeyPair.publicKey,
    );
    const error = () => {
      virgilCrypto.decryptThenVerify(encryptedData, recipientKeyPair.privateKey, [
        additionalKeyPair.publicKey,
        anotherKeyPair.publicKey,
      ]);
    };
    expect(error).to.throw;
  },

  'getRandomBytes': ({ virgilCrypto }, expect) => {
    const length = 4;
    const randomBytes = virgilCrypto.getRandomBytes(length);
    expect(randomBytes.byteLength).to.eq(length);
  },

  'signThenEncryptDetached -> decryptThenVerifyDetached': ({ virgilCrypto, Buffer }, expect) => {
    const data = Buffer.from('data', 'utf8');
    const { privateKey, publicKey } = virgilCrypto.generateKeys();
    const { encryptedData, metadata } = virgilCrypto.signThenEncryptDetached(
      data,
      privateKey,
      publicKey,
    );
    const decrypted = virgilCrypto.decryptThenVerifyDetached(
      encryptedData,
      metadata,
      privateKey,
      publicKey,
    );
    expect(decrypted.equals(data)).to.be.true;
  },
};
