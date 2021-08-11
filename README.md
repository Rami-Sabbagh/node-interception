
# node-interception

A **Windows** library for intercepting and controlling keyboards and mouses with multiple devices support.

The project provides Node.js bindings for the original [Interception](https://github.com/oblitum/Interception) library by [Oblitum](https://github.com/oblitum), and supports it with a wrapper and TypeScript definitions.

## Installation

### Install the package

```cmd
yarn add interception
rem or using npm
npm install interception
```

### Install the driver

Using a command prompt with **Administrative Privileges**:

```cmd
yarn install-interception /install
rem or using npm
npx install-interception /install
```

> You can uninstall it later using `/uninstall` instead.

You'll need to **restart** for the driver installation to be complete.

## Credits

- [Oblitum](https://github.com/oblitum) for creating the original interception library.
- [Rami Sabbagh](https://github.com/Rami-Sabbagh) for writing the binding and wrapper.
