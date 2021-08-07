const os = require('os');
const interception = require('./build/Release/addon.node');

console.log('Setting the process priority to high');
os.setPriority(os.constants.priority.PRIORITY_HIGH);

console.log('Creating context...');
const context = interception.createContext();
console.log('Created context');
console.log('context:', context);

interception.setFilter(context, 'keyboard', 0x0001 | 0x0002);

const SCANCODE_ESC = 0x01;

while (true) {
    const device = interception.wait(context);
    const stroke = interception.receive(context, device, 1);
    const hardwareId = interception.getHardwareId(context, device);

    if (stroke === null) break;
    if (stroke.code === SCANCODE_ESC) break;

    interception.send(context, device, stroke, 1);
    console.log('Device:', device, 'Stroke:', stroke, 'HW_ID:', hardwareId);
}

console.log('Unsetting the filters...');
interception.setFilter(context, 'keyboard', 0x0000);
