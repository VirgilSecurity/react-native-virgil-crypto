import { base64ToBuffer } from './utils/encoding';

export class VirgilPublicKey {
  constructor(identifierBase64, publicKeyBase64) {
    Object.defineProperty(this, 'identifier', {
      configurable: false,
      enumerable: true,
      value: base64ToBuffer(identifierBase64),
      writable: false
    });
    Object.defineProperty(this, 'value', {
      configurable: false,
      enumerable: true,
      value: publicKeyBase64,
      writable: false
    });
  }
}
