import {base64ToBuffer, dataToBase64} from './utils/encoding';
import { setPrivateKeyValue } from './private-key-cache';

export class VirgilPrivateKey {
  constructor(identifierBase64, privateKeyBase64) {
    Object.defineProperty(this, 'identifier', {
      configurable: false,
      enumerable: true,
      value: base64ToBuffer(identifierBase64),
      writable: false
    });
    setPrivateKeyValue(this, privateKeyBase64 ?? dataToBase64(identifierBase64, 'base64', 'rawPrivateKey'));
  }
}
