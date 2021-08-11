import * as os from 'os';

import native, { FilterKeyState, FilterMouseState } from '../lib/native';

os.setPriority(os.constants.priority.PRIORITY_HIGH);

const SCANCODE_ESC = 0x01;

const context = native.createContext();

native.setFilter(context, 'mouse', FilterMouseState.MOVE);
native.setFilter(context, 'keyboard', FilterKeyState.DOWN);

while (true) {
    const device = native.wait(context);
    if (device === null) break;
    const stroke = native.receive(context, device);
    if (stroke === null) break;

    if (stroke.type === 'keyboard' && stroke.code == SCANCODE_ESC) break;

    native.send(context, device, stroke);
    console.log('Device:', device, 'Stroke: ', stroke);
}

native.setFilter(context, 'mouse', FilterMouseState.NONE);
native.setFilter(context, 'keyboard', FilterKeyState.NONE);

native.destroyContext(context);
