export class VirgilPublicKey {
  constructor(publicKeyBase64) {
    Object.defineProperty(this, 'value', {
      configurable: false,
      enumerable: true,
      value: publicKeyBase64,
      writable: false
    });
  }
}