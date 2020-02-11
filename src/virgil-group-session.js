import { NativeModules } from 'react-native';
import { checkedGetPrivateKeyValue, checkedGetPublicKeyValue } from './utils/keys';
import { unwrapResponse } from './utils/response';
import { dataToBase64, base64ToBuffer } from './utils/encoding';

const { RNVirgilGroupSession } = NativeModules;

export function createVirgilGroupSession({ sessionId, currentEpochNumber, epochMessages }) {
  let actualEpochNumber = currentEpochNumber;
  let actualEpochMessages = epochMessages.slice();
  const actualSessionId = base64ToBuffer(sessionId).toString('hex');

  return {
    getSessionId() {
      return actualSessionId;
    },

    getCurrentEpochNumber() {
      return actualEpochNumber;
    },

    encrypt(data, signingPrivateKey) {
      const dataBase64 = dataToBase64(data, 'utf8', 'data');
      const privateKeyValue = checkedGetPrivateKeyValue(signingPrivateKey);
      return base64ToBuffer(
        unwrapResponse(RNVirgilGroupSession.encrypt(dataBase64, privateKeyValue, actualEpochMessages))
      );
    },

    decrypt(encryptedData, verifyingPublicKey) {
      const encryptedDataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
      const publicKeyValue = checkedGetPublicKeyValue(verifyingPublicKey);
      return base64ToBuffer(
        unwrapResponse(RNVirgilGroupSession.decrypt(encryptedDataBase64, publicKeyValue, actualEpochMessages))
      );
    },

    addNewEpoch() {
      const { sessionId, epochNumber, data } = unwrapResponse(
        RNVirgilGroupSession.addNewEpoch(actualEpochMessages)
      );

      actualEpochNumber = epochNumber;
      actualEpochMessages = actualEpochMessages.concat(data);

      return {
        sessionId: base64ToBuffer(sessionId).toString('hex'),
        epochNumber,
        data
      };
    },

    export() {
      return actualEpochMessages.map(m => base64ToBuffer(m));
    },

    parseMessage(messageData) {
      const messageDataBase64 = dataToBase64(messageData, 'base64', 'messageData');

      const { sessionId, epochNumber, data } = unwrapResponse(
        RNVirgilGroupSession.parseMessage(messageDataBase64)
      );

      return {
        sessionId: base64ToBuffer(sessionId).toString('hex'),
        epochNumber,
        data
      };
    }
  };
}
