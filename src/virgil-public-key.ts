import type { IPublicKey, NodeBuffer } from '@virgilsecurity/crypto-types';
import { base64ToBuffer } from './utils/encoding';

export class VirgilPublicKey implements IPublicKey {
  public readonly identifier!: NodeBuffer;
  public readonly value!: string;

  constructor(identifierBase64: string, publicKeyBase64: string) {
    Object.defineProperty(this, 'identifier', {
      configurable: false,
      enumerable: true,
      value: base64ToBuffer(identifierBase64),
      writable: false,
    });

    Object.defineProperty(this, 'value', {
      configurable: false,
      enumerable: true,
      value: publicKeyBase64,
      writable: false,
    });
  }
}
