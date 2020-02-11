import { NativeModules } from 'react-native';
import { Buffer } from 'buffer';
import { createVirgilGroupSession } from './virgil-group-session';
import { VirgilPrivateKey } from './virgil-private-key';
import { VirgilPublicKey } from './virgil-public-key';

jest.mock('react-native', () => ({
  NativeModules: {
    RNVirgilGroupSession: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      addNewEpoch: jest.fn(),
      parseMessage: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
    select: ({ ios }) => {
      return ios;
    }
  },
}));

const defaultSessionId = Buffer.from('x'.repeat(32), 'ascii');
const defaultEpochNumber = 1;
const defaultEpochMessages = [Buffer.from('epochMessage_1').toString('base64')];
const createSession = (id = defaultSessionId, epochNumber = defaultEpochNumber, epochMessages = defaultEpochMessages) => {
  return createVirgilGroupSession({
    sessionId: id.toString('base64'),
    currentEpochNumber: epochNumber,
    epochMessages: epochMessages
  });
};

describe('groupSession', () => {
  afterEach(() => {
    NativeModules.RNVirgilGroupSession.encrypt.mockReset();
    NativeModules.RNVirgilGroupSession.decrypt.mockReset();
    NativeModules.RNVirgilGroupSession.addNewEpoch.mockReset();
    NativeModules.RNVirgilGroupSession.parseMessage.mockReset();
  });

  describe('getSessionId', () => {
    it('returns session id in hex', () => {
      const session = createSession();
      expect(session.getSessionId()).toBe(defaultSessionId.toString('hex'))
    });
  });

  describe('getCurrentEpochNumber', () => {
    it('returns current epoch number', () => {
      const session = createSession();
      expect(session.getCurrentEpochNumber()).toBe(defaultEpochNumber);
    });
  });

  describe('encrypt', () => {
    it('calls native method correctly', () => {
      NativeModules.RNVirgilGroupSession.encrypt.mockReturnValue({
        result: Buffer.from('ciphertext').toString('base64')
      });
      const session = createSession();
      const privateKey = new VirgilPrivateKey('privateKey');
      const result = session.encrypt('data', privateKey);
      expect(NativeModules.RNVirgilGroupSession.encrypt).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privateKey',
        defaultEpochMessages
      );
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('ciphertext');
    });

    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilGroupSession.encrypt.mockReturnValue({
        result: Buffer.from('ciphertext').toString('base64')
      });
      const session = createSession();
      const privateKey = new VirgilPrivateKey('privateKey');
      session.encrypt(Buffer.from('data'), privateKey);
      expect(NativeModules.RNVirgilGroupSession.encrypt).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privateKey',
        defaultEpochMessages
      );
    });

    it('accepts data as object wuth value and encoding', () => {
      NativeModules.RNVirgilGroupSession.encrypt.mockReturnValue({
        result: Buffer.from('ciphertext').toString('base64')
      });
      const session = createSession();
      const privateKey = new VirgilPrivateKey('privateKey');
      session.encrypt({ value: 'data', encoding: 'utf8' }, privateKey);
      expect(NativeModules.RNVirgilGroupSession.encrypt).toHaveBeenCalledWith(
        Buffer.from('data').toString('base64'),
        'privateKey',
        defaultEpochMessages
      );
    });
  });

  describe('decrypt', () => {
    it('calls native method correctly', () => {
      NativeModules.RNVirgilGroupSession.decrypt.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const session = createSession();
      const publicKey = new VirgilPublicKey('pubkey');
      const ciphertext = Buffer.from('ciphertext').toString('base64');

      const result = session.decrypt(ciphertext, publicKey);
      expect(NativeModules.RNVirgilGroupSession.decrypt).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        'pubkey',
        defaultEpochMessages
      );
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString()).toBe('plaintext');
    });

    it('accepts data as Buffer', () => {
      NativeModules.RNVirgilGroupSession.decrypt.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const session = createSession();
      const publicKey = new VirgilPublicKey('pubkey');
      const ciphertext = Buffer.from('ciphertext');

      session.decrypt(ciphertext, publicKey);
      expect(NativeModules.RNVirgilGroupSession.decrypt).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        'pubkey',
        defaultEpochMessages
      );
    });

    it('accepts data as object with value and encoding', () => {
      NativeModules.RNVirgilGroupSession.decrypt.mockReturnValue({
        result: Buffer.from('plaintext').toString('base64')
      });
      const session = createSession();
      const publicKey = new VirgilPublicKey('pubkey');
      const ciphertext = { value: 'ciphertext', encoding: 'utf8' };

      session.decrypt(ciphertext, publicKey);
      expect(NativeModules.RNVirgilGroupSession.decrypt).toHaveBeenCalledWith(
        Buffer.from('ciphertext').toString('base64'),
        'pubkey',
        defaultEpochMessages
      );
    });
  });

  describe('addNewEpoch', () => {
    it('calls native method correctly', () => {
      NativeModules.RNVirgilGroupSession.addNewEpoch.mockReturnValue({
        result: {
          sessionId: defaultSessionId.toString('base64'),
          epochNumber: 2,
          data: Buffer.from('epochMessage_2').toString('base64')
        }
      });
      const session = createSession();
      const result = session.addNewEpoch();
      expect(NativeModules.RNVirgilGroupSession.addNewEpoch).toHaveBeenCalledWith(
        defaultEpochMessages
      );
      expect(result).toHaveProperty('sessionId');
      expect(result.sessionId).toBe(defaultSessionId.toString('hex'));
      expect(result).toHaveProperty('epochNumber');
      expect(result.epochNumber).toBe(2);
      expect(result).toHaveProperty('data');
      expect(result.data).toBe(Buffer.from('epochMessage_2').toString('base64'));
    });

    it('updates the current epoch number', () => {
      NativeModules.RNVirgilGroupSession.addNewEpoch.mockReturnValue({
        result: {
          sessionId: defaultSessionId.toString('base64'),
          epochNumber: 2,
          data: Buffer.from('epochMessage_2').toString('base64')
        }
      });
      const session = createSession();
      session.addNewEpoch();
      expect(NativeModules.RNVirgilGroupSession.addNewEpoch).toHaveBeenCalledWith(
        defaultEpochMessages
      );
      expect(session.getCurrentEpochNumber()).toBe(2);
    });

    it('adds new message to the internal messages list', () => {
      NativeModules.RNVirgilGroupSession.addNewEpoch.mockReturnValue({
        result: {
          sessionId: defaultSessionId.toString('base64'),
          epochNumber: 2,
          data: Buffer.from('epochMessage_2').toString('base64')
        }
      });
      const session = createSession();
      session.addNewEpoch();
      expect(session.export()).toHaveLength(2);
    });
  });

  describe('export', () => {
    it('returns current epoch messages as array of Buffers', () => {
      const session = createSession();
      const messages = session.export();
      expect(messages).toHaveLength(1);
      expect(Buffer.isBuffer(messages[0])).toBe(true);
      expect(messages[0].toString()).toBe('epochMessage_1');
    });
  });

  describe('parseMessage', () => {
    it('calls native method correctly', () => {
      const sessionId = Buffer.from('z'.repeat(32), 'ascii');
      NativeModules.RNVirgilGroupSession.parseMessage.mockReturnValue({
        result: {
          sessionId: sessionId.toString('base64'),
          epochNumber: 99,
          data: Buffer.from('epochMessage_99').toString('base64')
        }
      });

      const session = createSession(sessionId);
      const messageData = Buffer.from('messageData').toString('base64');
      const result = session.parseMessage(messageData);

      expect(NativeModules.RNVirgilGroupSession.parseMessage).toHaveBeenCalledWith(
        Buffer.from('messageData').toString('base64')
      );
      expect(result).toHaveProperty('sessionId');
      expect(result.sessionId).toBe(sessionId.toString('hex'));
      expect(result).toHaveProperty('epochNumber');
      expect(result.epochNumber).toBe(99);
      expect(result).toHaveProperty('data');
      expect(result.data).toBe(Buffer.from('epochMessage_99').toString('base64'));
    });

    it('accepts message data as Buffer', () => {
      const sessionId = Buffer.from('z'.repeat(32), 'ascii');
      NativeModules.RNVirgilGroupSession.parseMessage.mockReturnValue({
        result: {
          sessionId: sessionId.toString('base64'),
          epochNumber: 99,
          data: Buffer.from('epochMessage_99').toString('base64')
        }
      });

      const session = createSession(sessionId);
      const messageData = Buffer.from('messageData');
      session.parseMessage(messageData);

      expect(NativeModules.RNVirgilGroupSession.parseMessage).toHaveBeenCalledWith(
        Buffer.from('messageData').toString('base64')
      );
    });

    it('accepts message data as object with value and encoding', () => {
      const sessionId = Buffer.from('z'.repeat(32), 'ascii');
      NativeModules.RNVirgilGroupSession.parseMessage.mockReturnValue({
        result: {
          sessionId: sessionId.toString('base64'),
          epochNumber: 99,
          data: Buffer.from('epochMessage_99').toString('base64')
        }
      });

      const session = createSession(sessionId);
      const messageData = { value: 'messageData', encoding: 'utf8' };
      session.parseMessage(messageData);

      expect(NativeModules.RNVirgilGroupSession.parseMessage).toHaveBeenCalledWith(
        Buffer.from('messageData').toString('base64')
      );
    });
  });
});
