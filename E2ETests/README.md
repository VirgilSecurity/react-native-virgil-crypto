# React Native Virgil Crypto Testing Project

Our tests are powered by [Detox](https://github.com/wix/Detox).

> **Note**: instructions in this file assume you're running terminal commands from the root of the project and not from inside the E2ETests directory

## Requirements

- Make sure you have Xcode 15+ installed for iOS builds.
- Make sure you have Java 17 available for Android builds.
- Make sure you have Node.js 18+ available.
- Make sure you have all required dependencies installed:

  - [Apple Sim Utils](https://github.com/wix/AppleSimulatorUtils):

    ```bash
    brew tap wix/brew
    brew install wix/brew/applesimutils
    ```

> **Note**: If Homebrew complains about a conflict in the `wix/brew` tap, run `brew untap wix/brew && brew tap wix/brew` and try installing again

## Cleaning dependencies

If you want to start from a clean slate, the following deletes the local build folders:

```bash
cd E2ETests
npm run clean
```

## Running tests

### Step 1: Install test project dependencies and pods

```bash
cd E2ETests
npm install
cd ios && bundle exec pod install || pod install
```

### Step 2: Start Metro

```bash
cd E2ETests
npm run start
```

### Step 3: Build Native App

You must rebuild native every time you change native code under `E2ETests/android` or `E2ETests/ios`.

#### Android

```bash
cd E2ETests
npm run detox:build:android
```

#### iOS

```bash
cd E2ETests
npm run detox:build:ios
```

### Step 4: Setting up android emulator and iOS simulator

To run Android tests you need an emulator named `Pixel_9_Pro_XL`, or you need to change the AVD name in [`package.json`](package.json).

For iOS, Detox will boot an `iPhone 17` simulator automatically unless another target device is already open and selected.

### Step 5: Finally, run the tests

#### Android

```bash
cd E2ETests
npm run detox:test:android
```

#### iOS

```bash
cd E2ETests
npm run detox:test:ios
```
