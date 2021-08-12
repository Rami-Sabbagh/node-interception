
# node-interception

![[GitHub]](https://badgen.net/badge/GitHub/open%20source?icon=github) ![[Discord]](https://badgen.net/discord/members/8UXVB436u2?icon=discord&label=Discord)

A **windows** library for intercepting and controlling keyboards and mouses with multiple devices support.

The package provides Node.js bindings for the original [Interception](https://github.com/oblitum/Interception) library by [Oblitum](https://github.com/oblitum), and supports it with a wrapper and TypeScript definitions.

## Example

```ts
// Increase the process priority to prevent input lagging.
import * as os from 'os';
os.setPriority(os.constants.priority.PRIORITY_HIGH);

import { Interception, FilterKeyState, FilterMouseState } from 'node-interception';
const interception = new Interception();

// Display the list of available devices.
console.log('Devices:', interception.getDevices().map(device => `${device}`));

// Enable the capturing of all strokes.
interception.setFilter('keyboard', FilterKeyState.ALL);
interception.setFilter('mouse', FilterMouseState.ALL);

const SCANCODE_ESC = 0x01;

async function listen() {
    console.info('Press any key or move the mouse to generate strokes.');
    console.info('Press ESC to exit and restore back control.');

    while (true) {
        const device = await interception.wait();
        const stroke = device?.receive();

        if (!device || !stroke || (stroke?.type === 'keyboard' && stroke.code === SCANCODE_ESC)) break;

        console.log(`${device}`, stroke);
    }
}

// Start listening for keyboard and mouse strokes.
listen().catch(console.error);
```

## Features

- Contains prebuilt binaries for 32-bit (`ia32`) and 64-bit (`x64`) Windows machines.
- Written using N-API and `node-addon-api` so it should work with different node versions and electron without rebuilding.
- Written in TypeScript to provide enhanced IDE support.
- Allows working with each mouse and keyboard as independent devices, so different logic can be used for each keyboard/mouse.
- Allows blocking or modifying the devices strokes.

## Interception use cases

As the original library author ([Oblitum]) written:

> Interception has been used around the world in cases I couldn't imagine when I first created it:
>
> - Helping people with accessibility limitations, tailoring systems according to their limitations.
> - By companies in aviation training, to connect many devices at once and customizing each one.
> - By companies providing SCADA (supervisory control and data acquisition) solutions.
> - In game applications like BOTs and control customization.
> - To construct an emacs mode of the system.
> - To customize supermarket cashier's systems.
> - In doctoral thesis about typing pattern recognition for security applications.
> - Home theater automation.
> - ...

## Installation

### Installing the package

```cmd
yarn add node-interception
rem -- or using npm
npm install node-interception
```

### Installing the driver

Using a command prompt with **Administrative Privileges**:

```cmd
yarn install-interception /install
rem -- or using npm
npx install-interception /install
```

> You can uninstall it later using `/uninstall` instead.

You'll need to **restart** for the driver installation to be complete.

## Documentation

The API documentation is generated using [TypeDoc](https://typedoc.org/) and available on [GitHub Pages][Documentation].

## Community

A small [discord] server has been created in the hope of finding a community, so please don't hesitate to join it!

You can ask for help there using the library, share your work, and provide suggestions on what improvements can be done :)

## License

The binding and wrapper are licensed under `LGPL-3.0-or-later`, check the `LICENSE` file.

The original Interception library is licensed under `LGPL-3.0` too for un-commercial usage, and has a seperate license for commercial usage, check it in it's repository.

The package and repository of this module contains a redistribution of the interception library as that's permitted by the `LGPL-3.0` license, please create an issue if that's wrong.

## Credits

- [Oblitum] for creating the original interception library.
- [Rami Sabbagh] for writing the binding and wrapper.

[GitHub]: https://github.com/Rami-Sabbagh/node-interception/
[Documentation]: https://rami-sabbagh.github.io/node-interception/
[Discord]: https://discord.gg/8UXVB436u2
[Interception]: https://github.com/oblitum/Interception
[Oblitum]: https://github.com/oblitum
[Rami Sabbagh]: https://github.com/Rami-Sabbagh
