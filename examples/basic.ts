import * as os from 'os';
os.setPriority(os.constants.priority.PRIORITY_HIGH);

import { Interception, FilterKeyState, FilterMouseState } from 'interception';

const interception = new Interception();

console.log('Fetching devices...');
console.log('Devices:', interception.getDevices().map(device => `${device}`));

interception.setFilter('keyboard', FilterKeyState.ALL);
interception.setFilter('mouse', FilterMouseState.ALL);

const SCANCODE_ESC = 0x01;

async function listen() {
    while (true) {
        const device = await interception.wait();
        const stroke = device?.receive();

        if (!device || !stroke || (stroke?.type === 'keyboard' && stroke.code === SCANCODE_ESC)) break;

        console.log(device.toString(), stroke);
    }
}

listen().catch(console.error);