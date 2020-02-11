import { NativeModules } from 'react-native';
import { unwrapResponse } from './utils/response';
import { dataToBase64, base64ToBuffer } from './utils/encoding';

const { RNVirgilBrainKeyCrypto } = NativeModules;

export const virgilBrainKeyCrypto = {
  blind(password) {
    const passwordBase64 = dataToBase64(password, 'utf8', 'password');
    const { blindedPassword, blindingSecret } = unwrapResponse(RNVirgilBrainKeyCrypto.blind(passwordBase64))
    return {
      blindedPassword: base64ToBuffer(blindedPassword),
      blindingSecret: base64ToBuffer(blindingSecret)
    };
  },

  deblind({ transformedPassword, blindingSecret }) {
    const transformedPasswordBase64 = dataToBase64(transformedPassword, 'base64', 'transformedPassword');
    const blindingSecretBase64 = dataToBase64(blindingSecret, 'base64', 'blindingSecret');
    return  base64ToBuffer(
      unwrapResponse(RNVirgilBrainKeyCrypto.deblind(transformedPasswordBase64, blindingSecretBase64))
    );
  }
}
