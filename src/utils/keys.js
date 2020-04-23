import { VirgilPrivateKey } from '../virgil-private-key';
import { VirgilPublicKey } from '../virgil-public-key';
import { hasPrivateKeyValue, getPrivateKeyValue } from '../private-key-cache';
import { toArray } from '../utils/array';

export function wrapKeyPair(keypair) {
  return {
    privateKey: new VirgilPrivateKey(keypair.identifier, keypair.privateKey),
    publicKey: new VirgilPublicKey(keypair.identifier, keypair.publicKey)
  };
}

export function checkedGetPublicKeyValues(virgilPublicKeys) {
  const arr = toArray(virgilPublicKeys);
  if (arr.length === 0) {
    throw new TypeError(
      'Argument "virgilPublicKeys" must be a VirgilPublicKey or an array of VirgilPublicKey objects'
    );
  }
  return arr.map(it => {
    if (!(it instanceof VirgilPublicKey)) {
      throw new TypeError('Expected an array to contain VirgilPublicKey objects, got ' + typeof it);
    }
    return it.value;
  });
}

export function checkedGetPublicKeyValue(virgilPublicKey) {
  if (!(virgilPublicKey instanceof VirgilPublicKey)) {
    throw new TypeError('Argument "virgilPublicKey" must be a VirgilPublicKey object');
  }
  return virgilPublicKey.value;
}

export function checkedGetPrivateKeyValue(virgilPrivateKey) {
  if (!hasPrivateKeyValue(virgilPrivateKey)) {
    throw new TypeError('Argument "virgilPrivateKey" is not a valid VirgilPrivateKey');
  }
  return getPrivateKeyValue(virgilPrivateKey);
}
