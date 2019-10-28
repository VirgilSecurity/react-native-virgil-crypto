# React Native Virgil Crypto Testing Project

Our tests are powered by [Detox](https://github.com/wix/Detox).

> **Note**: instructions in this file assume you're running terminal commands from the root of the project and not from inside the E2ETests directory

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
yarn tests:install
```

### Step 2: Start Packager Script

Start the React Native packager using the script provided

```bash
yarn tests:packager
```

> ⚠️ Make sure that all existing packagers are terminated and that you have no React Native debugger tabs open on your browsers.

### Step 3: Build Native App

As always; the first build for each platform will take a while. Subsequent builds are much much quicker ⚡️

> ⚠️ You must rebuild native every time you make changes to native code (anything in /android /ios directories).

#### Android

```bash
yarn tests:android:build
```

#### iOS

```bash
yarn tests:ios:build
```

### Step 4: Setting up android emulator and iOS simulator

To run android tests you will need to create a new emulator and name it `Pixel 2 API 28` (you can't rename existing one, but you can change this name in "detox" config in [package.json](package.json) of the E2ETests project). This emulator will need to be up and running before you start your android tests from Step 5.

With iOS Detox will start a simulator for you by default or run tests in an open one.

### Step 5: Finally, run the tests

This action will launch a new simulator (if not already open) and run the tests on it.

> 💡 iOS by default will background launch the simulator - to have
> it launch in the foreground make sure any simulator is currently open, `Finder -> Simulator.app`.

> 💡 Android by default looks for a pre-defined emulator named `Pixel 2 API 28` - make sure you have one named the same setup on Android Studio.
> Or you can change this name in the `package.json` of the tests project (don't commit the change though please).
> **DO NOT** rename an existing AVD to this name - it will not work, rename does not change the file path currently so Detox will
> fail to find the AVD in the correct directory. Create a new one with Google Play Services.

#### Android

```bash
yarn tests:android:test
```

#### iOS

```bash
yarn tests:ios:test
```
