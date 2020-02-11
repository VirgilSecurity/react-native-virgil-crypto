const privateKeys = new WeakMap();
const setValue = WeakMap.prototype.set;
const getValue = WeakMap.prototype.get;
const hasValue = WeakMap.prototype.has;

/**
 * Gets the private key bytes of the given private key object from internal store.
 * @param {VirgilPrivateKey} privateKey - Private key object.
 * @returns {string} - Private key bytes.
 *
 * @hidden
 */
export function getPrivateKeyValue(privateKeyObj) {
  return getValue.call(privateKeys, privateKeyObj);
}

/**
 * Saves the private key bytes corresponding to the given private key object into
 * internal buffer.
 *
 * @param {VirgilPrivateKey} privateKey - Private key object.
 * @param {string} bytes - Private key bytes.
 *
 * @hidden
 */
export function setPrivateKeyValue(privateKeyObj, bytesBase64) {
  setValue.call(privateKeys, privateKeyObj, bytesBase64);
}

/**
 * Checks if the private key bytes corresponding to the given private key
 * object exist in the internal buffer.
 *
 * @hidden
 *
 * @param { VirgilPrivateKey } privateKey - Private key object.
 *
 * @returns {boolean}
 */
export function hasPrivateKeyValue(privateKeyObj) {
  return hasValue.call(privateKeys, privateKeyObj);
}
