import type {
  Data,
  IGroupSession,
  IGroupSessionMessageInfo,
  IPrivateKey,
  IPublicKey,
  NodeBuffer,
} from '@virgilsecurity/crypto-types';
import { RNVirgilGroupSession, type NativeGroupSessionInfo } from './native-modules';
import { checkedGetPrivateKeyValue, checkedGetPublicKeyValue } from './utils/keys';
import { unwrapResponse } from './utils/response';
import { base64ToBuffer, dataToBase64 } from './utils/encoding';

function toGroupSessionMessageInfo(
  messageInfo: IGroupSessionMessageInfo
): IGroupSessionMessageInfo {
  return {
    sessionId: base64ToBuffer(messageInfo.sessionId).toString('hex'),
    epochNumber: messageInfo.epochNumber,
    data: messageInfo.data,
  };
}

export function createVirgilGroupSession({
  sessionId,
  currentEpochNumber,
  epochMessages,
}: NativeGroupSessionInfo): IGroupSession {
  let actualEpochNumber = currentEpochNumber;
  let actualEpochMessages = epochMessages.slice();
  const actualSessionId = base64ToBuffer(sessionId).toString('hex');

  return {
    getSessionId(): string {
      return actualSessionId;
    },

    getCurrentEpochNumber(): number {
      return actualEpochNumber;
    },

    encrypt(data: Data, signingPrivateKey: IPrivateKey): NodeBuffer {
      const dataBase64 = dataToBase64(data, 'utf8', 'data');
      const privateKeyValue = checkedGetPrivateKeyValue(signingPrivateKey);

      return base64ToBuffer(
        unwrapResponse(RNVirgilGroupSession.encrypt(dataBase64, privateKeyValue, actualEpochMessages))
      );
    },

    decrypt(encryptedData: Data, verifyingPublicKey: IPublicKey): NodeBuffer {
      const encryptedDataBase64 = dataToBase64(encryptedData, 'base64', 'encryptedData');
      const publicKeyValue = checkedGetPublicKeyValue(verifyingPublicKey);

      return base64ToBuffer(
        unwrapResponse(
          RNVirgilGroupSession.decrypt(
            encryptedDataBase64,
            publicKeyValue,
            actualEpochMessages
          )
        )
      );
    },

    addNewEpoch(): IGroupSessionMessageInfo {
      const { sessionId, epochNumber, data } = unwrapResponse(
        RNVirgilGroupSession.addNewEpoch(actualEpochMessages)
      );

      actualEpochNumber = epochNumber;
      actualEpochMessages = actualEpochMessages.concat(data);

      return toGroupSessionMessageInfo({ sessionId, epochNumber, data });
    },

    export(): NodeBuffer[] {
      return actualEpochMessages.map(message => base64ToBuffer(message));
    },

    parseMessage(messageData: Data): IGroupSessionMessageInfo {
      const messageDataBase64 = dataToBase64(messageData, 'base64', 'messageData');
      const { sessionId, epochNumber, data } = unwrapResponse(
        RNVirgilGroupSession.parseMessage(messageDataBase64)
      );

      return toGroupSessionMessageInfo({ sessionId, epochNumber, data });
    },
  };
}
