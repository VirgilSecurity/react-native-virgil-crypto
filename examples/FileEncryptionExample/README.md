# Encrypted Files Upload / Download Example
An example demonstrating how to use `react-native-virgil-crypto` to encrypt files to be uploaded to the server and decrypt the downloaded files in React Native app. Additionally, the digital signature of the encrypted file is calculated before uploading and verified just after downloading but before decrypting the file to prove its authenticity.

This project is intended for demonstration purposes only, as such it doesn't implement the keys persistence - a new key pair is generated every time you load the app - and the data persistence - the uploads folder is cleared every time you stop the server.

This project uses [react-native-image-picker](https://github.com/react-native-community/react-native-image-picker) to get an image from the device and [rn-fetch-blob](https://github.com/joltup/rn-fetch-blob) to download files and for its [fs helpers](https://github.com/joltup/rn-fetch-blob#user-content-file-system). Technically these are not required, but make the sample so much simpler.

Server source code is available [here](../file-encryption-server).

## Install
1. Install JavaScript dependencies:
  ```sh
  yarn install
  ```
2. Install iOS dependencies:
  ```sh
  cd ios && pod install
  ```

## Usage
- Run Metro Bundler
  ```sh
  yarn start
  ```
- Run iOS app
  ```sh
  yarn ios
  ```
- Run Android app
  ```sh
  yarn android
  ```

## License
This library is released under the [3-clause BSD License](LICENSE).

## Support
Our developer support team is here to help you.

You can find us on [Twitter](https://twitter.com/VirgilSecurity) or send us email support@VirgilSecurity.com.

Also, get extra help from our support team on [Slack](https://virgilsecurity.com/join-community).
