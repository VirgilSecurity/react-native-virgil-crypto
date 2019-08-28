# Virgil Crypto Benchmarks

An example demonstrating performance of `react-native-virgil-crypto` 

## Usage

Install dependencies:

```sh
yarn install
```

Because `react-native-virgil-crypto` is installed from file system, it includes the `examples` folder which leads to build errors. Removing the `examples` folder from `node_modules/react-native-virgil-crypto` fixes those errors:

```sh
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
