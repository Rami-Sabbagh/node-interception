import interception, { IDevice, IFilter, MAX_DEVICE, MAX_KEYBOARD, MAX_MOUSE } from './addon';
import Device, { Keyboard, Mouse } from './device';

export default class Interception {
    constructor(private readonly _context = interception.createContext()) { }

    get context() {
        if (interception.isContextDestroyed(this._context)) throw new Error('The context is destroyed');
        return this._context;
    }

    setFilter(type: 'keyboard' | 'mouse', filter: IFilter): void {
        interception.setFilter(this.context, type, filter);
    }

    getDevice(id: IDevice): Device | null {
        if (interception.getHardwareId(this.context, id) === null) return null;
        return new Device(this._context, id);
    }

    getDevices(): Device[] {
        const devices: Device[] = [];

        const context = this.context; // So the destruction check is only done once.

        for (let id = 1; id <= MAX_DEVICE; id++) {
            if (interception.getHardwareId(context, id) === null) continue;
            devices.push(new Device(context, id));
        }

        return devices;
    }

    getKeyboards(): Keyboard[] {
        const keyboards: Keyboard[] = [];

        const context = this.context; // So the destruction check is only done once.

        for (let id = 1; id <= MAX_KEYBOARD; id++) {
            if (interception.getHardwareId(context, id) === null) continue;
            keyboards.push(new Device(context, id));
        }

        return keyboards;
    }

    getMice(): Mouse[] {
        const mice: Mouse[] = [];

        const context = this.context; // So the destruction check is only done once.

        for (let id = MAX_KEYBOARD + 1; id <= MAX_KEYBOARD + MAX_MOUSE; id++) {
            if (interception.getHardwareId(context, id) === null) continue;
            mice.push(new Device(context, id));
        }

        return mice;
    }

    async wait(timeout?: number): Promise<Device | null> {
        let id = null;

        if (timeout === undefined) id = await interception.waitAsync(this.context);
        else id = await interception.waitWithTimeoutAsync(this.context, timeout);

        return id !== null ? new Device(this._context, id) : null;
    }

    waitSync(timeout?: number): Device | null {
        let id = null;

        if (timeout === undefined) id = interception.wait(this.context);
        else id = interception.waitWithTimeout(this.context, timeout);

        return id !== null ? new Device(this._context, id) : null;
    }

    destroy(): void {
        if (interception.isContextDestroyed(this._context)) throw new Error('Already destroyed');
        interception.destroyContext(this._context);
    }

    isDestroyed(): boolean {
        return interception.isContextDestroyed(this._context);
    }

    toString(): string {
        return `[Interception: ${this._context}]`;
    }
}