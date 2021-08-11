// Increase the process priority to prevent input lagging.
import * as os from 'os';
os.setPriority(os.constants.priority.PRIORITY_HIGH);

import { Interception, FilterKeyState, FilterMouseState } from '../lib';
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