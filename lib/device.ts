import interception, { IContext, IDevice, IFilter, Stroke } from './addon';

export default class Device {
    constructor(
        private readonly _context: IContext,
        public readonly id: IDevice,
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

    getFilter(): IFilter {
        return interception.getFilter(this.context, this.id);
    }

    send(stroke: Stroke, nstroke = 1): boolean {
        return interception.send(this.context, this.id, stroke, nstroke);
    }

    receive(nstroke = 1): Stroke | null {
        return interception.receive(this.context, this.id, nstroke);
    }

    getHardwareId(): string | null {
        return interception.getHardwareId(this.context, this.id);
    }
}