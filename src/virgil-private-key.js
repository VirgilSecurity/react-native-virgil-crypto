import { setPrivateKeyValue } from './private-key-cache';

export class VirgilPrivateKey {
  constructor(privateKeyBase64) {
    setPrivateKeyValue(this, privateKeyBase64);
  }
}