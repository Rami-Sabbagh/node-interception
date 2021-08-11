
# node-interception

A windows library for intercepting and controlling keyboards and mouses with multiple devices support.

The project provides Node.js bindings for the original [Interception](https://github.com/oblitum/Interception) library by [Oblitum](https://github.com/oblitum), and supports it with a wrapper and TypeScript definitions.

## System Requirements

- A 32-bit (`ia32`) or 64-bit (`x64`) Windows machine.
- Node 14 or later is prefered. (Node 12 might work)
- The interception driver must be installed.

## Installation

### Install the package

```cmd
yarn add interception
rem or using npm
npm install interception
```

### Install the driver

Using a command prompt with **Administrative Privileges**:

> You'll have to restart for the driver installation to be complete.

```cmd
yarn install-interception /install
rem Or using npm
npx install-interception /install
```

> You can uninstall it later using `/uninstall` instead.

## Credits

- [Oblitum](https://github.com/oblitum) for creating the original interception library.
- [Rami Sabbagh](https://github.com/Rami-Sabbagh) for writing the binding and wrapper.
