import { RNVirgilCryptoError } from '../rn-virgil-crypto-error';

export function unwrapResponse(nativeResponse) {
  if (nativeResponse.error) {
    throw new RNVirgilCryptoError(nativeResponse.error);
  }

  return nativeResponse.result;
}
