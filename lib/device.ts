import interception, { Context, DeviceId, Filter, InvalidStroke, KeyboardStroke, MAX_DEVICE, MAX_KEYBOARD, MAX_MOUSE, MouseStroke, Stroke } from './addon';

export type Mouse = Device<MouseStroke>;
export type Keyboard = Device<KeyboardStroke>;
export type InvalidDevice = Device<InvalidStroke>;

export class Device<TStroke extends Stroke = Stroke> {
    constructor(
        private readonly _context: Context,
        public readonly id: DeviceId,
    ) { }

    get context() {
        if (interception.isContextDestroyed(this._context)) throw new Error('The context is destroyed');
        return this._context;
    }

    /**
     * Gets the precedence (priority) set for this device.
     */
    getPrecedence(): number {
        return interception.getPrecedence(this.context, this.id);
    }

    /**
     * Sets the precedence (priority) wanted for this device.
     */
    setPrecedence(precedence: number): void {
        interception.setPrecedence(this.context, this.id, precedence);
    }

    getFilter(): Filter {
        return interception.getFilter(this.context, this.id);
    }

    send(stroke: TStroke, nstroke = 1): boolean {
        return interception.send(this.context, this.id, stroke, nstroke);
    }

    receive(nstroke = 1): TStroke | null {
        return interception.receive(this.context, this.id, nstroke);
    }

    getHardwareId(): string | null {
        return interception.getHardwareId(this.context, this.id)
            ?.replace(/\x00\x00$/, '')?.replace(/\x00/gi, ', ')
            ?? null;
    }

    isMouse(): this is Mouse {
        return this.id > MAX_KEYBOARD && this.id < MAX_KEYBOARD + MAX_MOUSE;
    }

    isKeyboard(): this is Keyboard {
        return this.id > 0 && this.id < MAX_KEYBOARD;
    }

    isInvalid(): this is InvalidDevice {
        return this.id <= 0 || this.id >= MAX_DEVICE;
    }

    toString(): string {
        let type = 'Invalid';

        if (this.isMouse()) type = 'Mouse';
        else if (this.isKeyboard()) type = 'Keyboard';

        return `[${type} ${this.id}]: ${this.getHardwareId()}`;
    }
}
