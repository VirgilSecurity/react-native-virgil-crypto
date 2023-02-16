/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {SafeAreaView, ScrollView, Text} from 'react-native';
import {virgilCrypto, KeyPairType} from 'react-native-virgil-crypto';

const App = () => {
  const keyPair = virgilCrypto.generateKeys(
    KeyPairType.CURVE25519_ROUND5_ED25519_FALCON,
  );
  const message =
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  const encrypted = virgilCrypto.signAndEncrypt(
    message,
    keyPair.privateKey,
    keyPair.publicKey,
  );
  const decrypted = virgilCrypto.decryptAndVerify(
    encrypted,
    keyPair.privateKey,
    keyPair.publicKey,
  );
  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Message: {message}</Text>
        <Text>Encrypted: {encrypted.toString('base64')}</Text>
        <Text>Decrypted: {decrypted.toString('utf8')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
