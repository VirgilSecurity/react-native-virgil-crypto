const privateKeys = new WeakMap<object, string>();
const setValue = WeakMap.prototype.set;
const getValue = WeakMap.prototype.get;
const hasValue = WeakMap.prototype.has;

export function getPrivateKeyValue(privateKeyObj: object): string | undefined {
  return getValue.call(privateKeys, privateKeyObj);
}

export function setPrivateKeyValue(privateKeyObj: object, bytesBase64: string): void {
  setValue.call(privateKeys, privateKeyObj, bytesBase64);
}

export function hasPrivateKeyValue(privateKeyObj: unknown): privateKeyObj is object {
  return typeof privateKeyObj === 'object' && privateKeyObj !== null && hasValue.call(privateKeys, privateKeyObj);
}
