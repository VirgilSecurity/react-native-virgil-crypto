# Encrypted Files Upload \ Download Example

An example demonstrating how to use `react-native-virgil-crypto` to encrypt files to be uploaded to the server and decrypt the downloaded files in React Native app. Additionaly, the digital signature of the encrypted file is calculated before uploading and verified just after downloading but before decrypting the file to prove its authenticity.

This project is intended for demonstation purposes only, as such it doesn't implement the persistence - a new key pair is generated every time you load the app - and data persistence persistence - the uploads folder is cleared every time you stop the server.

This project uses [react-native-image-picker](https://github.com/react-native-community/react-native-image-picker) to get an image from the device and [rn-fetch-blob](https://github.com/joltup/rn-fetch-blob) to download files and for its [fs helpers](https://github.com/joltup/rn-fetch-blob#user-content-file-system). Technically these are not required, but make the sample so much simpler.

On the server we use [express](https://expressjs.com/) and [multer](https://github.com/expressjs/multer) to handle uploads. 

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

Start the server:

```sh
yarn run serve
```

Run on Android

```sh
react-native run-android
```

Or iOS

```sh
react-native run-ios
```