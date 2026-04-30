import type { IPrivateKey, NodeBuffer } from '@virgilsecurity/crypto-types';
import { base64ToBuffer } from './utils/encoding';
import { setPrivateKeyValue } from './private-key-cache';

export class VirgilPrivateKey implements IPrivateKey {
  public readonly identifier!: NodeBuffer;

  constructor(identifierBase64: string, privateKeyBase64: string) {
    Object.defineProperty(this, 'identifier', {
      configurable: false,
      enumerable: true,
      value: base64ToBuffer(identifierBase64),
      writable: false,
    });

    setPrivateKeyValue(this, privateKeyBase64);
  }
}
