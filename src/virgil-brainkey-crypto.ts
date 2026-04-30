import type { Data, IBrainKeyCrypto, NodeBuffer } from '@virgilsecurity/crypto-types';
import { RNVirgilBrainKeyCrypto } from './native-modules';
import { unwrapResponse } from './utils/response';
import { base64ToBuffer, dataToBase64 } from './utils/encoding';

export const virgilBrainKeyCrypto: IBrainKeyCrypto = {
  blind(password: Data): { blindedPassword: NodeBuffer; blindingSecret: NodeBuffer } {
    const passwordBase64 = dataToBase64(password, 'utf8', 'password');
    const { blindedPassword, blindingSecret } = unwrapResponse(
      RNVirgilBrainKeyCrypto.blind(passwordBase64)
    );

    return {
      blindedPassword: base64ToBuffer(blindedPassword),
      blindingSecret: base64ToBuffer(blindingSecret),
    };
  },

  deblind({
    transformedPassword,
    blindingSecret,
  }: {
    transformedPassword: Data;
    blindingSecret: Data;
  }): NodeBuffer {
    const transformedPasswordBase64 = dataToBase64(
      transformedPassword,
      'base64',
      'transformedPassword'
    );
    const blindingSecretBase64 = dataToBase64(blindingSecret, 'base64', 'blindingSecret');

    return base64ToBuffer(
      unwrapResponse(RNVirgilBrainKeyCrypto.deblind(transformedPasswordBase64, blindingSecretBase64))
    );
  },
};
