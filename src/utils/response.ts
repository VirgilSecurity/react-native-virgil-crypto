import type { NativeResponse } from '../native-modules';
import { RNVirgilCryptoError } from '../rn-virgil-crypto-error';

export function unwrapResponse<T>(nativeResponse: NativeResponse<T>): T {
  if ('error' in nativeResponse && nativeResponse.error) {
    throw new RNVirgilCryptoError(nativeResponse.error);
  }

  return nativeResponse.result;
}
