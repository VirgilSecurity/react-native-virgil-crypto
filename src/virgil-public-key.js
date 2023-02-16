import {base64ToBuffer, dataToBase64} from './utils/encoding';

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
      value: publicKeyBase64 ?? dataToBase64(identifierBase64, 'base64', 'rawPrivateKey'),
      writable: false
    });
  }
}
