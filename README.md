# React Native Virgil Crypto

[![npm](https://img.shields.io/npm/v/react-native-virgil-crypto.svg)](https://www.npmjs.com/package/react-native-virgil-crypto)
[![GitHub license](https://img.shields.io/github/license/VirgilSecurity/react-native-virgil-crypto)](LICENSE)

> This README is for 0.5.x version of the library. Check the [0.4.x branch](https://github.com/VirgilSecurity/react-native-virgil-crypto/tree/0.4.x) for 0.4.x docs.

React Native bridge for Virgil Security Crypto Library for [iOS](https://github.com/VirgilSecurity/virgil-crypto-x) and [Android](https://github.com/VirgilSecurity/virgil-sdk-java-android).

This library is a replacement for [virgil-crypto-javascript](https://github.com/VirgilSecurity/virgil-crypto-javascript) and should be used in React Native projects. The main difference is that in [virgil-crypto-javascript](https://github.com/VirgilSecurity/virgil-crypto-javascript) library a class named `VirgilCrypto` is exported from the module that you need to create instances of, whereas this library exports an "instance" of that class ready to be used. Also, stream encryption is not available as there is no stream implementation in React Native. We're investigating the options to support file encryption though.

## Install
First, install the package:
```sh
yarn add react-native-virgil-crypto
```

Second, pick your version of React Native and use the provided project as a reference for your own project:
- [React Native 0.59.x](examples/Example59)
- [React Native 0.60.x](examples/Example60)
- [React Native 0.61.x](examples/Example61)
- [React Native 0.62.x](examples/Example62)

Last, you need to get familiar with the usage examples below:

### Generate a key pair
Generate a Private Key with the default algorithm (ED25519):
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const keyPair = virgilCrypto.generateKeys();
```

### Generate and verify a signature
Generate signature and sign data with a private key:
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const signingKeypair = virgilCrypto.generateKeys();

// prepare a message
const messageToSign = 'Hello, Bob!';

// generate a signature
const signature = virgilCrypto.calculateSignature(messageToSign, signingKeypair.privateKey);
// signature is a NodeJS Buffer polyfill
console.log(signature.toString('base64'));
```

Verify a signature with a public key:
```javascript
// verify a signature
const isVerified = virgilCrypto.verifySignature(messageToSign, signature, signingKeypair.publicKey);
```

### Encrypt and decrypt data
Encrypt Data on a Public Key:
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const encryptionKeypair = virgilCrypto.generateKeys();

// prepare a message
const messageToEncrypt = 'Hello, Bob!';

// encrypt the message
const encryptedData = virgilCrypto.encrypt(messageToEncrypt, encryptionKeypair.publicKey);
// encryptedData is a NodeJS Buffer polyfill
console.log(encryptedData.toString('base64'));
```

Decrypt the encrypted data with a Private Key:
```javascript
// decrypt the encrypted data using a private key
const decryptedData = virgilCrypto.decrypt(encryptedData, encryptionKeypair.privateKey);

// convert Buffer to string
const decryptedMessage = decryptedData.toString('utf8');
```

### File encryption
To encrypt a file you will need to know its location in the file system. For images you can use [React Native API](https://facebook.github.io/react-native/docs/cameraroll.html), or a library such as [react-native-image-picker](https://github.com/react-native-community/react-native-image-picker) or [react-native-camera-roll-picker](https://github.com/jeanpan/react-native-camera-roll-picker).
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const keypair = virgilCrypto.generateKeys();

// this must be defined in your code
pickAnImage()
.then(image => {
  return virgilCrypto.encryptFile({
    // assuming `image` has a `uri` property that points to its location in file system
    inputPath: image.uri,
    // This can be a custom path that your application can write to
    // e.g. RNFetchBlob.fs.dirs.DocumentDir + '/encrypted_uploads/' + image.fileName,
    // If not specified, a temporary file will be created.
    outputPath: undefined,
    publicKeys: keypair.publicKey
  })
  .then(encryptedFilePath => {
    // encryptedFilePath is the location of the encrypted file in the file system
    // the original image file remain intact
    // you can now upload this file using `fetch` and `FormData`, e.g.:
    const data = new FormData();
    data.append('photo', {
      uri: 'file://' + encryptedFilePath,
      type: image.type,
      name: image.fileName
    });

    return fetch(url, { method: 'POST', body: data });
  });
});
```

Decryption works similarly to encryption - you provide a path to the encrypted file in the file system (network urls are not supported). You can use a library such as [rn-fetch-blob](https://github.com/joltup/rn-fetch-blob) or [react-native-fs](https://github.com/itinance/react-native-fs) to download a file directly into file system.
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const keypair = virgilCrypto.generateKeys();

// this must be defined in your code
downloadImage()
.then(downloadedFilePath => {
  return virgilCrypto.decryptFile({
    inputPath: downloadedFilePath,
    // This can be a custom path that your application can write to
    // e.g. RNFetchBlob.fs.dirs.DocumentDir + '/decrypted_downloads/' + image.id + '.jpg';
    // If not specified, a temporary file will be created
    outputPath: undefined,
    privateKey: keypair.privateKey
  })
  .then(decryptedFilePath => {
    return <Image src={`file://${decryptedFilePath}`} />
  });
});
```

It is also possible to calculate the digital signature of a file
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const keypair = virgilCrypto.generateKeys();
// this must be defined in your code
pickAnImage()
.then(image => {
  return virgilCrypto.generateFileSignature({
    inputPath: image.uri,
    privateKey: keypair.privateKey
  })
  .then(signature => ({ ...image, signature: signature.toString('base64') }));
});
```

And verify the signature of a file
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const keypair = virgilCrypto.generateKeys();

// this must be defined in your code
downloadImage()
.then(downloadedFilePath => {
  return virgilCrypto.verifyFileSignature({
    inputPath: image.downloadedFilePath,
    signature: image.signature,
    publicKey: keypair.publicKey
  })
  .then(isSigantureVerified => ({ ...image, isSigantureVerified }));
});
```

See the [demo project](examples/FileEncryptionSample) for a complete example of working with encrypted files.

### Group encryption
This library only provides crypto primitives to implement group chats.

First, you need to create a group session:
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

const keypair = virgilCrypto.generateKeys();

const groupSession = virgilCrypto.generateGroupSession('unique_identifier_of_the_group');
```

Then, you need to share this group session with users who you want to communicate with. Note that secure sharing of group sessions is not a responsibility of this library and is left for the developer to implement. It is provided out-of-the box in [E3kit](https://github.com/VirgilSecurity/virgil-e3kit-js), though.
```javascript
// exportedSession will be an array of Buffers that this exact session can be reconstructed from
const exportedSession = groupSession.export();

// now we serialize it to send to other group members
const serializedSession = exportedSession.map(m => m.toString('base64'));

// this must be implemented by the developer
shareGroupSession(groupSession.getSessionId(), serializedSession, groupMembers);
```

Upon receiving a shared group session, you will need to import its serialized representation:
```javascript
import { virgilCrypto } from 'react-native-virgil-crypto';

function onSharedGroupSessionReceived(sharedGroupSession) {
  const sharedGroupSession = virgilCrypto.importGroupSession(sharedGroupSession);

  // you can now use sharedGroupSession to encrypt and decrypt messages
}
```

Encryption and decryption is as easy as calling `encrypt` and `decrypt` methods on the group session. When encrypting, you will need to provide the current user's private key to authenticate the encrypted message:
```javascript
const message = 'Hello there! This is the beginning of our group chat.';

const encryped = groupSession.encrypt(message, myPrivateKey);
```

When decrypting, the public key of the sender must be provided to verify the authenticity of the message:
```javascript
const decrypted = groupSession.decrypt(encrypted, senderPublicKey);

console.log(decrypted.toString('utf8'));
```

If you need to add new members to the group, you just share the current group session with them securely. If you need to remove someone from the group,
you need to add a new epoch to the group - this produces what's called an epoch message - then share that epoch message with every group member except the ones you want to remove:
```javascript
groupSession.addNewEpoch();

// now we serialize it to send to other group members
const serializedSession = groupSession.export().map(m => m.toString('base64'));

// this must be implemented by the developer
shareGroupSession(groupSession.getSessionId(), serializedSession, groupMembers);
```

Since this is pretty low-level we do not recommend using it directly. Instead, make sure to check out the higher-level API for group chats provided by [E3kit](https://github.com/VirgilSecurity/virgil-e3kit-js).

### Working with binary data
All of the methods of `virgilCrypto` object that accept binary data, accept them in the form of `string` or `Buffer`. All of the methods that return binary data, return them in the form of `Buffer`. We use [this library](https://github.com/feross/buffer) as the native implementation is not available in react native. We re-export the `Buffer` from the module for your convenience:
```javascript
import { Buffer } from 'react-native-virgil-crypto';

console.log(Buffer.from('hello Buffer').toString('base64')); // prints aGVsbG8gQnVmZmVy
```

### Performance
See the [sample project](https://github.com/VirgilSecurity/react-native-virgil-crypto/tree/master/examples/Benchmarks) for a complete example that you can use to measure performance of this library on your own devices.

## License
This library is released under the [3-clause BSD License](LICENSE).

## Support
Our developer support team is here to help you.

You can find us on [Twitter](https://twitter.com/VirgilSecurity) or send us email support@VirgilSecurity.com.

Also, get extra help from our support team on [Slack](https://virgilsecurity.com/join-community).
