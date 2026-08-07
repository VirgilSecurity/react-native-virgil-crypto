import type { Data, NodeBuffer } from '@virgilsecurity/crypto-types';
import { RNVirgilBrainKeyCrypto } from './native-modules';
import { unwrapResponse } from './utils/response';
import { base64ToBuffer, dataToBase64 } from './utils/encoding';

export type BlindResult = {
  blindedPoint: NodeBuffer;
  deblindFactor: NodeBuffer;
};

export type DeblindParams = {
  password: Data;
  hardenedPoint: Data;
  deblindFactor: Data;
  /**
   * Domain-separation tag. Must be a stable, application-wide constant that
   * matches the value the brainkey harden service used. Changing it derives a
   * different, unrecoverable seed, and no runtime check can distinguish that
   * from a wrong password — which is why there is no default.
   */
  keyName: Data;
};

export interface IVirgilBrainKeyCrypto {
  blind(password: Data): BlindResult;
  deblind(params: DeblindParams): NodeBuffer;
}

/**
 * Brain key primitives.
 *
 * virgil-crypto-c 0.19.1 removed Pythia; password hardening moved into
 * foundation as BrainkeyClient. This is not a rename — `deblind` now takes the
 * password again plus a `keyName` tag, so it no longer satisfies
 * `IBrainKeyCrypto` from @virgilsecurity/crypto-types.
 */
export const virgilBrainKeyCrypto: IVirgilBrainKeyCrypto = {
  blind(password: Data): BlindResult {
    const passwordBase64 = dataToBase64(password, 'utf8', 'password');
    const { blindedPoint, deblindFactor } = unwrapResponse(
      RNVirgilBrainKeyCrypto.blind(passwordBase64)
    );

    return {
      blindedPoint: base64ToBuffer(blindedPoint),
      deblindFactor: base64ToBuffer(deblindFactor),
    };
  },

  deblind({ password, hardenedPoint, deblindFactor, keyName }: DeblindParams): NodeBuffer {
    // Reject an absent or empty keyName here rather than at the bridge: a
    // silently-defaulted tag would derive a valid-looking but wrong seed.
    if (keyName == null || (typeof keyName === 'string' && keyName.length === 0)) {
      throw new TypeError(
        'Argument "keyName" is required and must be a non-empty, stable application constant'
      );
    }

    const passwordBase64 = dataToBase64(password, 'utf8', 'password');
    const hardenedPointBase64 = dataToBase64(hardenedPoint, 'base64', 'hardenedPoint');
    const deblindFactorBase64 = dataToBase64(deblindFactor, 'base64', 'deblindFactor');
    const keyNameBase64 = dataToBase64(keyName, 'utf8', 'keyName');

    return base64ToBuffer(
      unwrapResponse(
        RNVirgilBrainKeyCrypto.deblind(
          passwordBase64,
          hardenedPointBase64,
          deblindFactorBase64,
          keyNameBase64
        )
      )
    );
  },
};
