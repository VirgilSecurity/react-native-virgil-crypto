# Virgil Crypto Benchmarks

An example demonstrating performance of `react-native-virgil-crypto`.

## Results

The results below were obtained by running this project in Release configuration

| Device | Function | Data Size | ops/sec |
| :---   | :---     |   :---:   |    ---: |
| iPhone 8 (iOS 12.3.1) | generateKeys (with default alg - Ed25519 ) | - | 7976 |
|                       | calculateHash (SHA256) | 8kB | 589 |
|                       | calculateHash (SHA512) | 8kB | 588 |
|                       | encrypt | 1kB | 863 |
|                       | decrypt | 1kB | 969 |
|                       | calculateSignature | 1kB | 2210 |
|                       | verifySignature | 1kB | 2359 |
|                       | signThenEncrypt | 1kB | 722 |
|                       | decryptThenVerify | 1kB | 409 |
|                       | signThenEncryptDetached | 1kB | 700 |
|                       | decryptThenVerifyDetached | 1kB | 408 |
|                       | extractPublicKey | - | 8216 |
|                       | BrainKeyCrypto.blind | - | 228 |
|                       | BrainKeyCrypto.deblind | - | 208 |
|                       | generateGroupSession | - | 8587 |
|                       | importGroupSession (50 epochs) | - | 243 |
|                       | groupSession.encrypt (50 epochs) | 1kB | 607 |
|                       | groupSession.decrypt (50 epochs) | 1kB | 647 |
| BLU LIFE XL (Android 5.1) | generateKeys (with default alg - Ed25519 ) | - | 320 |
|                           | calculateHash (SHA256) | 8kB | 92 |
|                           | calculateHash (SHA512) | 8kB | 92 |
|                           | encrypt | 1kB | 75 |
|                           | decrypt | 1kB | 80 |
|                           | calculateSignature | 1kB | 114 |
|                           | verifySignature | 1kB | 141 |
|                           | signThenEncrypt | 1kB | 50 |
|                           | decryptThenVerify | 1kB | 56 |
|                           | signThenEncryptDetached | 1kB | 48 |
|                           | decryptThenVerifyDetached | 1kB | 55 |
|                           | extractPublicKey | - | 298 |
|                           | BrainKeyCrypto.blind | - | 22 |
|                           | BrainKeyCrypto.deblind | - | 20 |
|                           | generateGroupSession | - | 712 |
|                           | importGroupSession (50 epochs) | - | 27 |
|                           | groupSession.encrypt (50 epochs) | 1kB | 53 |
|                           | groupSession.decrypt (50 epochs) | 1kB | 59 |

## Usage

Install dependencies:

```sh
yarn install
```

Because `react-native-virgil-crypto` is installed from file system, it includes the `node_modules` and `examples` folders which leads to build errors. Removing those folders from `node_modules/react-native-virgil-crypto` fixes those errors:

```sh
rm -rf node_modules/react-native-virgil-crypto/node_modules
rm -rf node_modules/react-native-virgil-crypto/examples
```

Start the packager:

```sh
yarn start
```

Run on Android

```sh
react-native run-android
```

Or open the `android` folder in Android Studio and run from there.

Run on iOS

```sh
react-native run-ios
```

Or open the `ios/Benchmarks.xcworkspace` with XCode and run from there.
