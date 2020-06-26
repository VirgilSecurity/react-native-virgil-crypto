# React Native Virgil Crypto Testing Project

Our tests are powered by [Detox](https://github.com/wix/Detox).

## Requirements

- Make sure you have Xcode installed (tested with Xcode 11).
- Make sure you have NodeJS installed (Node 8.4.0 and up is required).
- Make sure you have all required dependencies installed:

  - [Apple Sim Utils](https://github.com/wix/AppleSimulatorUtils):

    ```bash
    brew tap wix/brew
    brew install wix/brew/applesimutils
    ```

> **Note**: If Homebrew complains about a conflict in the `wix/brew` tap, run `brew untap wix/brew && brew tap wix/brew` and try installing again

## Cleaning dependencies

You might find yourself in a situation where you want to start from a clean slate. The following will delete the project `build` folders.

```bash
yarn clean
```

## Running tests

### Step 1: Install test project dependencies

```bash
# for iOS
yarn install:ios
```

### Step 2: Build Native app

```bash
# for iOS
yarn build:ios
# for Android
yarn build:android
```

As always; the first build for each platform will take a while. Subsequent builds are much much quicker ⚡️

> ⚠️ You must rebuild native every time you make changes to native code (anything in /android /ios directories).

### Step 3: Setting up android emulator and iOS simulator

To run android tests you will need to create a new emulator and name it `Pixel 2 API 28` (you can't rename existing one, but you can change this name in "detox" config in [package.json](package.json) of the E2ETests project). This emulator will need to be up and running before you start your android tests from Step 4.

With iOS Detox will start a simulator for you by default or run tests in an open one.

### Step 4: Finally, run the tests

This action will launch a new simulator (if not already open) and run the tests on it.

> 💡 iOS by default will background launch the simulator - to have
> it launch in the foreground make sure any simulator is currently open, `Finder -> Simulator.app`.

> 💡 Android by default looks for a pre-defined emulator named `Pixel 2 API 28` - make sure you have one named the same setup on Android Studio.
> Or you can change this name in the `package.json` of the tests project (don't commit the change though please).
> **DO NOT** rename an existing AVD to this name - it will not work, rename does not change the file path currently so Detox will
> fail to find the AVD in the correct directory. Create a new one with Google Play Services.

```bash
# for iOS
yarn test:ios
# for Android
yarn test:android
```
