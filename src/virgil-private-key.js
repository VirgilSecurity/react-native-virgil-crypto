import { setPrivateKeyBytes } from './private-key-cache';

export class VirgilPrivateKey {
  constructor(privateKeyBase64) {
    setPrivateKeyBytes(this, privateKeyBase64);
  }
}