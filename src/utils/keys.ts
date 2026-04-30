import type { IKeyPair } from '@virgilsecurity/crypto-types';
import { VirgilPrivateKey } from '../virgil-private-key';
import { VirgilPublicKey } from '../virgil-public-key';
import { getPrivateKeyValue, hasPrivateKeyValue } from '../private-key-cache';
import type { NativeKeyPair } from '../native-modules';
import { toArray } from './array';

export function wrapKeyPair(keypair: NativeKeyPair): IKeyPair {
  return {
    privateKey: new VirgilPrivateKey(`${keypair.identifier}`, `${keypair.privateKey}`),
    publicKey: new VirgilPublicKey(`${keypair.identifier}`, `${keypair.publicKey}`),
  };
}

export function checkedGetPublicKeyValues(virgilPublicKeys: unknown): string[] {
  const arr = toArray(virgilPublicKeys);
  if (arr.length === 0) {
    throw new TypeError(
      'Argument "virgilPublicKeys" must be a VirgilPublicKey or an array of VirgilPublicKey objects'
    );
  }

  return arr.map(item => {
    if (!(item instanceof VirgilPublicKey)) {
      throw new TypeError(
        'Expected an array to contain VirgilPublicKey objects, got ' + typeof item
      );
    }

    return item.value;
  });
}

export function checkedGetPublicKeyValue(virgilPublicKey: unknown): string {
  if (!(virgilPublicKey instanceof VirgilPublicKey)) {
    throw new TypeError('Argument "virgilPublicKey" must be a VirgilPublicKey object');
  }

  return virgilPublicKey.value;
}

export function checkedGetPrivateKeyValue(virgilPrivateKey: unknown): string {
  if (!hasPrivateKeyValue(virgilPrivateKey)) {
    throw new TypeError('Argument "virgilPrivateKey" is not a valid VirgilPrivateKey');
  }

  return getPrivateKeyValue(virgilPrivateKey)!;
}
