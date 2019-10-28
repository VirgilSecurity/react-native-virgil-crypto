/**
 * These tests are run in the context of the React Native app (see App.js) 
 * and NOT by mocha as normal tests would. Therefore you cannot use `describe` 
 * or `it` here and, most importantly, you CANNOT require `react-native-virgil-crypto`. 
 * You can only "require" things that work in both React Native and Node, like `chai`.
 * 
 * When the E2ETests app runs, it will call these functions passing the result of 
 * `import * as module form 'react-native-virgil-crypto'`
 * 
 * TODO: allow grouping of tests
 */

const { expect } = require('chai');

module.exports = {
  'generates key pair': ({ virgilCrypto }) => {
    const keyPair = virgilCrypto.generateKeys();
    expect(keyPair.privateKey).to.be.ok;
    expect(keyPair.publicKey).to.be.ok;
  },

  'generates key pair from seed': ({ virgilCrypto }) => {
    const seed = virgilCrypto.getRandomBytes(32);
    const keyPair = virgilCrypto.generateKeysFromKeyMaterial(seed);
    expect(keyPair.privateKey).to.be.ok;
    expect(keyPair.publicKey).to.be.ok;
  },

  'returns same keys from the same seed': ({ virgilCrypto }) => {
    const seed = virgilCrypto.getRandomBytes(32);
    const keyPair1 = virgilCrypto.generateKeysFromKeyMaterial(seed);
    const keyPair2 = virgilCrypto.generateKeysFromKeyMaterial(seed);
    const privateKey1 = virgilCrypto.exportPrivateKey(keyPair1.privateKey);
    const privateKey2 = virgilCrypto.exportPrivateKey(keyPair2.privateKey);
    expect(privateKey1.equals(privateKey2)).to.be.true;
  },

  'returns different keys from different seeds': ({ virgilCrypto }) => {
    const seed1 = virgilCrypto.getRandomBytes(32);
    const seed2 = virgilCrypto.getRandomBytes(32);
    const keyPair1 = virgilCrypto.generateKeysFromKeyMaterial(seed1);
    const keyPair2 = virgilCrypto.generateKeysFromKeyMaterial(seed2);
    const privateKey1 = virgilCrypto.exportPrivateKey(keyPair1.privateKey);
    const privateKey2 = virgilCrypto.exportPrivateKey(keyPair2.privateKey);
    expect(privateKey1.equals(privateKey2)).to.be.false;
  },

  'importPrivateKey -> exportPrivateKey': ({ virgilCrypto }) => {
    const privateKeyHex =
      '302e020100300506032b6570042204204ac70df9ed0d8e54c7537181097f53f30e171474d2322c3f91438d1bbef75e73';
    const privateKey = virgilCrypto.importPrivateKey({ value: privateKeyHex, encoding: 'hex' });
    const exportedKey = virgilCrypto.exportPrivateKey(privateKey);
    expect(exportedKey.toString('hex')).to.equal(privateKeyHex);
  },

  'importPublicKey -> exportPublicKey': ({ virgilCrypto }) => {
    const publicKeyHex =
      '302a300506032b65700321005da627bebb5f5edc843b649a60d2db9886c0ede6a1f24289aed4f13e59935539';
    const publicKey = virgilCrypto.importPublicKey({ value: publicKeyHex, encoding: 'hex' });
    const exportedKey = virgilCrypto.exportPublicKey(publicKey);
    expect(exportedKey.toString('hex')).to.equal(publicKeyHex);
  },
  
  'encrypt -> decrypt': ({ virgilCrypto }) => {
    const data = 'data';
    const keyPair = virgilCrypto.generateKeys();
    const cipherData = virgilCrypto.encrypt({ value: data, encoding: 'utf8' }, keyPair.publicKey);
    const decryptedData = virgilCrypto.decrypt(cipherData, keyPair.privateKey);
    expect(decryptedData.toString()).to.equal(data);
  },

  'throws if `encrypt` is called with an empty array of recipients': ({ virgilCrypto }) => {
    const error = () => {
      virgilCrypto.encrypt({ value: 'secret message', encoding: 'utf8' }, []);
    };
    expect(error).to.throw;
  },

  'produces correct hash': ({ virgilCrypto, Buffer }) => {
    const hash = virgilCrypto.calculateHash({ value: 'data', encoding: 'utf8' });
    const expectedHash = Buffer.from(
      '77c7ce9a5d86bb386d443bb96390faa120633158699c8844c30b13ab0bf92760b7e4416aea397db91b4ac0e5dd56b8ef7e4b066162ab1fdc088319ce6defc876',
      'hex',
    );
    expect(hash.equals(expectedHash)).to.be.true;
  },

  'produces the same hash for the same data': ({ virgilCrypto }) => {
    const hash1 = virgilCrypto.calculateHash({ value: 'data', encoding: 'utf8' });
    const hash2 = virgilCrypto.calculateHash({ value: 'data', encoding: 'utf8' });
    expect(hash1.equals(hash2)).to.be.true;
  },

  'produces different hash for different algorithms': ({ virgilCrypto, HashAlgorithm }) => {
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

  'extractPublicKey': ({ virgilCrypto }) => {
    const keyPair = virgilCrypto.generateKeys();
    const publicKey = virgilCrypto.extractPublicKey(keyPair.privateKey);
    const key1 = virgilCrypto.exportPublicKey(keyPair.publicKey);
    const key2 = virgilCrypto.exportPublicKey(publicKey);
    expect(key1.equals(key2)).to.be.true;
  },

  'calculateSignature -> verifySignature': ({ virgilCrypto }) => {
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

  'auth encryption - decrypts and verifies': ({ virgilCrypto }) => {
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

  'auth encryption - decrypts and verifies given the right keys': ({ virgilCrypto, Buffer }) => {
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

  'auth encryption - fails verification given the wrong keys': ({ virgilCrypto, Buffer }) => {
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

  'getRandomBytes': ({ virgilCrypto }) => {
    const length = 4;
    const randomBytes = virgilCrypto.getRandomBytes(length);
    expect(randomBytes.byteLength).to.eq(length);
  },

  'signThenEncryptDetached -> decryptThenVerifyDetached': ({ virgilCrypto, Buffer }) => {
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

  'brainKey - blind returns `blindedPassword` and `blindingSecret`': ({ virgilBrainKeyCrypto, Buffer }) => {
    const result = virgilBrainKeyCrypto.blind('password');
    expect(Object.keys(result)).to.have.length(2);
    expect(result.blindedPassword).to.be.instanceOf(Buffer);
    expect(result.blindingSecret).to.be.instanceOf(Buffer);
  },

  'brainKey - deblind produces correct deblinded password': ({ virgilBrainKeyCrypto, Buffer }) => {
    const blindingSecret = 'ASCgLTvcpI1qGGLzkPf/Aq7OGuPkDCtIt7AFqR0ihfWx';
    const transformedPassword = 'CrgNKSe3uxubXrKRGjSI9DcPSmi6qluyE9Qbd104ZzWNS7v2/sEWnXQh7ePBZ/apBGQ+PW8C8VDbcixj78hGMVsWy4cIe3qk5Mqs6U8TfLqVtk1weap9k5ntT6AFi6J7D+gp+lGvoxBeRvKQuk6xDtd5wmUPcF9O1Jzi2rpArfggyM57oT5xnWHObuf7APBxAu3XGv3L0Oc84qGq1pjS6EmYDPYBHJQfPwDSvZCHdilCZOSAy/RCzitKwwgA+JCZFerdEM1e1SGjLAJ9Bh3B4p5URCzqRLuA9csoyVSkJy0Os34HqnvrVtAO2isr8QUbA8h9ZdSL85z6wGgBUhyk663Z5HEdBgyx/rzoE1K0eNxDTnUXFUDOhtqjuEQCQnK3BzoMDYPbXn4MkC1C8e2TGkKPTViLpbo6cI1TmlzkIp/Db/egmgeGA9Ev2SWcRUCeFbefaIy4n6O+tCtdDo9+DYKCGb7F6zdxoJUjUSv0KPo9NI21bXsH0YK4jDQ/JGn5';
    const expectedDeblindedPassword = 'EycyOOMRkmL4bTITuOtrmcCT70hzffz66WIQ9zUOCWy8fmuZLk5vcFrD8KkV0WIsFkRZZAjj0WEm3fqc5ZTp82GyHvnIIwnlcUwJvNf37FwmZlkRNMZF1F7YyXA+cY7gBf5Ll/xA9ptCRyiDHQqInNOb4EaD3TgNqg32fDgnnjuf4y9sQHgDEfLfu26J/JDvFfsseVjjhxgtx+9X9xb90VKlisHT8NGb+i94kCQzOXbGn76eJLWNbNj6ScX01kKwD445DBmfN/ezEldY7yhK4Q/Zwtp+ooBVC6zNVdrdcIc6BjvPycrJB5BCr4ilQ6bMCarta6SVTW7ozMbhFFlEMoJmYWzQD4phbw555S3dLvlwyLqPj/zjVQXcZDyOK25DChR0ptBDpNr5tir4fB1FyplNI/kI94mKP0TKe7ZCEiCHyoGTCLPYr60Xyh9hSOh1CHAzbKaOt4PImw3J2SOS9FPGUOnwkjK5/P/RwsrSSxTStJUrf1RVIpXODoVJlpE8';
    const actual = virgilBrainKeyCrypto.deblind({
      transformedPassword,
      blindingSecret
    });
    expect(actual).to.be.instanceOf(Buffer);
    expect(actual.toString('base64')).to.eq(expectedDeblindedPassword);
  },

  'throws correct error when decryption fails': ({ virgilCrypto, RNVirgilCryptoError }) => {
    const senderKeyPair = virgilCrypto.generateKeys();
    const receiverKeyPair = virgilCrypto.generateKeys();
    const unexpectedKeyPair = virgilCrypto.generateKeys();
    const enc = virgilCrypto.signThenEncrypt('hello', senderKeyPair.privateKey, receiverKeyPair.publicKey);
    try {
      virgilCrypto.decryptThenVerify(enc, unexpectedKeyPair.privateKey, senderKeyPair.publicKey);
    } catch (err) {
      expect(err).to.be.instanceOf(RNVirgilCryptoError);
      expect(err.name).to.eq('FoundationError');
      expect(err.message).to.match(/recipient defined with id is not found/i);
      return;
    }
    expect.fail('should have thrown an error');
  },

  'throws correct error when group decryption fails': ({ virgilCrypto, RNVirgilCryptoError }) => {
    const keyPair1 = virgilCrypto.generateKeys();
    const keyPair2 = virgilCrypto.generateKeys();
    const group = virgilCrypto.generateGroupSession('qwertyuiop');
    const enc = group.encrypt('hello', keyPair1.privateKey);
    try {
      group.decrypt(enc, keyPair2.publicKey);
    } catch(err) {
      expect(err).to.be.instanceOf(RNVirgilCryptoError);
      expect(err.name).to.eq('FoundationError');
      expect(err.message).to.match(/invalid signature/i);
      return;
    }
    expect.fail('should have thrown an error');
  },

  'generateGroupSession: creates group with correct id': ({ virgilCrypto, HashAlgorithm }) => {
    const expectedId = virgilCrypto
      .calculateHash('i_am_long_enough_to_be_a_group_id', HashAlgorithm.SHA512)
      .slice(0, 32);
    const group = virgilCrypto.generateGroupSession('i_am_long_enough_to_be_a_group_id');
    expect(group.getSessionId()).to.equal(expectedId.toString('hex'));
  },

  'generateGroupSession: creates group with one epoch': ({ virgilCrypto }) => {
    const group = virgilCrypto.generateGroupSession('i_am_long_enough_to_be_a_group_id');
    expect(group.export()).to.have.length(1);
  },

  'importGroupSession: reconstructs the group session object from epoch messages': ({ virgilCrypto, Buffer }) => {
    const myGroup = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    myGroup.addNewEpoch();
    const epochMessages = myGroup.export();
    const theirGroup = virgilCrypto.importGroupSession(epochMessages);

    expect(myGroup.getSessionId()).to.equal(theirGroup.getSessionId());
    expect(myGroup.getCurrentEpochNumber()).to.equal(theirGroup.getCurrentEpochNumber());
  },

  'calculateGroupSessionId: returns correct session id as hex string': ({ virgilCrypto, HashAlgorithm }) => {
    const expectedId = virgilCrypto
      .calculateHash('i_am_long_enough_to_be_a_group_id', HashAlgorithm.SHA512)
      .slice(0, 32);
    const groupSessionId = virgilCrypto.calculateGroupSessionId(
      'i_am_long_enough_to_be_a_group_id',
    );
    expect(groupSessionId).to.equal(expectedId.toString('hex'));
  },

  'groupSession.addNewEpoch(): adds new epoch message': ({ virgilCrypto, Buffer }) => {
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    group.addNewEpoch();
    group.addNewEpoch();
    expect(group.export()).to.have.length(3);
  },

  'groupSession.addNewEpoch(): increments the currentEpochNumber': ({ virgilCrypto, Buffer }) => {
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const oldEpochNumber = group.getCurrentEpochNumber();
    group.addNewEpoch();
    expect(group.getCurrentEpochNumber()).not.to.equal(oldEpochNumber);
  },

  'groupSession.addNewEpoch(): returns epochNumber, sessionId and data from epoch message': ({ virgilCrypto, Buffer }) => {
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const { epochNumber, sessionId, data } = group.addNewEpoch();
    expect(epochNumber).to.equal(group.getCurrentEpochNumber());
    expect(sessionId).to.equal(group.getSessionId());
    const lastEpochData = group.export().pop();
    expect(lastEpochData).not.to.be.undefined;
    expect(lastEpochData.toString('base64')).to.equal(data);
  },

  'groupSession.getCurrentEpochNumber(): returns zero for new group': ({ virgilCrypto, Buffer }) => {
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    expect(group.getCurrentEpochNumber()).to.equal(0);
  },

  'groupSession.getCurrentEpochNumber(): increments after adding new epoch': ({ virgilCrypto, Buffer }) => {
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    group.addNewEpoch();
    expect(group.getCurrentEpochNumber()).to.equal(1);
  },

  'groupSession.parseMessage(): returns epochNumber, sessionId and data from encrypted message': ({ virgilCrypto, Buffer }) => {
    const keypair = virgilCrypto.generateKeys();
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const encrypted = group.encrypt('secret', keypair.privateKey);
    const { epochNumber, sessionId, data } = group.parseMessage(encrypted);
    expect(epochNumber).to.equal(group.getCurrentEpochNumber());
    expect(sessionId).to.equal(group.getSessionId());
    expect(encrypted.toString('base64')).to.equal(data);
  },

  'groupSession:encryption: can encrypt and decrypt data': ({ virgilCrypto, Buffer }) => {
    const plaintext = 'secret';
    const keypair = virgilCrypto.generateKeys();
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const encrypted = group.encrypt(plaintext, keypair.privateKey);
    const decrypted = group.decrypt(encrypted, keypair.publicKey);
    expect(decrypted.toString('utf8')).to.equal(plaintext);
  },

  'groupSession:encryption: decrypt throws if given a wrong public key': ({ virgilCrypto, Buffer }) => {
    const plaintext = 'secret';
    const keypair1 = virgilCrypto.generateKeys();
    const keypair2 = virgilCrypto.generateKeys();
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const encrypted = group.encrypt(plaintext, keypair1.privateKey);
    expect(() => group.decrypt(encrypted, keypair2.publicKey)).throws(/Invalid signature/);
  },

  'groupSession:encryption: cannot decrypt data encrypted by another group': ({ virgilCrypto, Buffer }) => {
    const plaintext = 'secret';
    const keypair = virgilCrypto.generateKeys();
    const group1 = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const group2 = virgilCrypto.generateGroupSession(Buffer.from('y'.repeat(10)));
    const encrypted = group1.encrypt(plaintext, keypair.privateKey);
    expect(() => group2.decrypt(encrypted, keypair.publicKey)).throws(/Session id doesnt match/);
  },

  'groupSession:encryption: can decrypt data from previous epoch': ({ virgilCrypto, Buffer }) => {
    const plaintext = 'secret';
    const keypair = virgilCrypto.generateKeys();
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const encrypted = group.encrypt(plaintext, keypair.privateKey);
    group.addNewEpoch();
    const decrypted = group.decrypt(encrypted, keypair.publicKey);
    expect(decrypted.toString('utf8')).to.equal(plaintext);
  },

  'groupSession:encryption: cannot decrypt data from future epochs': ({ virgilCrypto, Buffer }) => {
    const plaintext = 'secret';
    const keypair = virgilCrypto.generateKeys();

    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    const outdatedGroup = virgilCrypto.importGroupSession(group.export());
    group.addNewEpoch();
    const encrypted = group.encrypt(plaintext, keypair.privateKey);
    expect(() => outdatedGroup.decrypt(encrypted, keypair.publicKey)).throws(/Epoch not found/);
  },

  'groupSession.export(): returns current epoch messages as array': ({ virgilCrypto, Buffer }) => {
    const group = virgilCrypto.generateGroupSession(Buffer.from('x'.repeat(10)));
    group.addNewEpoch();
    group.addNewEpoch();
    group.addNewEpoch();
    const epochMessages = group.export();
    expect(epochMessages).to.have.length(4); // 1 initial and 3 added manually
  },
};
