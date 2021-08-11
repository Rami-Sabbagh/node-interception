import * as os from 'os';
os.setPriority(os.constants.priority.PRIORITY_HIGH);

import { Interception, MouseFlag } from '../lib';

const interception = new Interception();

const mouse = interception.getMice()[0];
if (mouse === undefined) throw new Error('No mice were found');

const success = mouse.send({
    type: 'mouse',
    flags: MouseFlag.MOVE_ABSOLUTE,
    x: 0,
    y: 40000,
    rolling: 0,
    state: 0x00,
    information: 0,
});

console.log('Success:', success);