# React Native Virgil Crypto + React Native 0.59.x
Use this project as a reference for your own React Native 0.59.x project.
> We highly suggest you to upgrade to 0.61.x or higher and use [this example](../Example61) as a reference to setup your project.

## Notable changes
- Add `react-native-virgil-crypto` dependency.
- Add `use_frameworks!` to [Podfile](ios/Podfile).
- Manage React dependencies via [Podfile](ios/Podfile). Please have a look at [this article](https://engineering.brigad.co/demystifying-react-native-modules-linking-ae6c017a6b4a) for more details.
- Add `pod 'RNVirgilCrypto', path: '../node_modules/react-native-virgil-crypto'` to [Podfile](ios/Podfile).

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
