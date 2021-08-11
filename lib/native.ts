export type Context = External;
export type DeviceId = number;
export type Filter = FilterKeyState | FilterMouseState;

export const MAX_KEYBOARD = 10;
export const MAX_MOUSE = 10;
export const MAX_DEVICE = MAX_KEYBOARD + MAX_MOUSE;

/**
 * Gets the device ID of the `i`th keyboard.
 * @param index The number of the keyboard, 0-based, maximum: `MAX_KEYBOARD - 1`.
 */
export const KEYBOARD = (index: number): DeviceId => index + 1;
/**
 * Gets the device ID of the `i`th mouse.
 * @param index The number of the mouse, 0-based, maximum: `MAX_MOUSE - 1`.
 */
export const MOUSE = (index: number): DeviceId => MAX_KEYBOARD + index + 1;

export enum KeyState {
    DOWN = 0x00,
    UP = 0x01,
    /**
     * Special key down, such as `delete` or arrow keys.
     */
    E0 = 0x02,
    /**
     * Special key up, such as `delete` or arrow keys.
     */
    E1 = 0x04,
    /**
     * Unknown.
     */
    TERMSRV_SET_LED = 0x08,
    /**
     * Unknown.
     */
    TERMSRV_SHADOW = 0x10,
    /**
     * Unknown.
     */
    TERMSRV_VKPACKET = 0x20,
}

/**
 * Filter the keyboard strokes intercepted by key states.
 * 
 * The filter works as a bitfield, so combine flags using bitwise operators:
 * ```ts
 * const filter = FilterKeyState.DOWN | FilterKeyState.UP;
 * ```
 */
export enum FilterKeyState {
    NONE = 0x0000,
    ALL = 0xFFFF,
    DOWN = 0x0001,
    UP = 0x0002,
    /**
     * Special key down, such as `delete` or arrow keys.
     */
    E0 = 0x0004,
    /**
     * Special key up, such as `delete` or arrow keys.
     */
    E1 = 0x0008,
    /**
     * Unknown.
     */
    TERMSRV_SET_LED = 0x0010,
    /**
     * Unknown.
     */
    TERMSRV_SHADOW = 0x0020,
    /**
     * Unknown.
     */
    TERMSRV_VKPACKET = 0x0040,
}

export enum MouseState {
    BUTTON_1_DOWN = 0x001,
    BUTTON_1_UP = 0x002,
    BUTTON_2_DOWN = 0x004,
    BUTTON_2_UP = 0x008,
    BUTTON_3_DOWN = 0x010,
    BUTTON_3_UP = 0x020,

    BUTTON_4_DOWN = 0x040,
    BUTTON_4_UP = 0x080,
    BUTTON_5_DOWN = 0x100,
    BUTTON_5_UP = 0x200,

    WHEEL = 0x400,
    H_WHEEL = 0x800,

    LEFT_BUTTON_DOWN = BUTTON_1_DOWN,
    LEFT_BUTTON_UP = BUTTON_1_UP,
    RIGHT_BUTTON_DOWN = BUTTON_2_DOWN,
    RIGHT_BUTTON_UP = BUTTON_2_UP,
    MIDDLE_BUTTON_DOWN = BUTTON_3_DOWN,
    MIDDLE_BUTTON_UP = BUTTON_3_UP,
}

/**
 * Filter the mouse strokes intercepted.
 * 
 * The filter works as a bitfield, so combine flags using bitwise operators:
 * ```ts
 * const wheelsFilter = FilterMouseState.WHEEL | FilterMouseState.H_WHEEL; // Wheel events only.
 * const filter = FilterMouseState.ALL ^ FilterMouseState.MOVE; // Excludes the movement strokes.
 * ```
 */
export enum FilterMouseState {
    NONE = 0x0000,
    ALL = 0xFFFF,

    BUTTON_1_DOWN = 0x001,
    BUTTON_1_UP = 0x002,
    BUTTON_2_DOWN = 0x004,
    BUTTON_2_UP = 0x008,
    BUTTON_3_DOWN = 0x010,
    BUTTON_3_UP = 0x020,

    BUTTON_4_DOWN = 0x040,
    BUTTON_4_UP = 0x080,
    BUTTON_5_DOWN = 0x100,
    BUTTON_5_UP = 0x200,

    /**
     * Vertical wheel movement.
     */
    WHEEL = 0x400,
    /**
     * Horizontal wheel movement.
     */
    H_WHEEL = 0x800,

    /**
     * Mouse movement.
     */
    MOVE = 0x1000,

    LEFT_BUTTON_DOWN = BUTTON_1_DOWN,
    LEFT_BUTTON_UP = BUTTON_1_UP,
    RIGHT_BUTTON_DOWN = BUTTON_2_DOWN,
    RIGHT_BUTTON_UP = BUTTON_2_UP,
    MIDDLE_BUTTON_DOWN = BUTTON_3_DOWN,
    MIDDLE_BUTTON_UP = BUTTON_3_UP,
}

/**
 * Mouse flags altering the sent mouse strokes behaviour.
 */
export enum MouseFlag {
    /**
     * The mouse stroke coordinates sent are relative to the current mouse position.
     */
    MOVE_RELATIVE = 0x000,
    /**
     * The mouse stroke coordinates send are absolution to the screen space.
     */
    MOVE_ABSOLUTE = 0x001,
    /**
     * Unknown.
     */
    VIRTUAL_DESKTOP = 0x002,
    /**
     * Unknown.
     */
    ATTRIBUTES_CHANGED = 0x004,
    /**
     * Unknown.
     */
    MOVE_NOCOALESCE = 0x008,
    /**
     * Unknown.
     */
    TERMSRV_SRC_SHADOW = 0x100,
}

export type KeyboardStroke = {
    type: 'keyboard',
    code: number,
    state: KeyState,
    information: number,
};

export type MouseStroke = {
    type: 'mouse',
    state: MouseState,
    flags: MouseFlag,
    rolling: number,
    x: number,
    y: number,
    information: number,
};

export type Stroke = KeyboardStroke | MouseStroke;

export interface InterceptionNative {
    /**
     * Creates an interception context, inorder for executing any api operation.
     */
    createContext(): Context;
    /**
     * Destroys an interception context, automatically handled when a context is garbage collected.
     * Any further api calls using this context would instantly fail or result with unknown behaviour.
     */
    destroyContext(context: Context): void;
    /**
     * Checks whether if a context is already destoyed or not.
     */
    isContextDestroyed(context: Context): boolean;

    /**
     * Gets the precedence (priority) which this context has for that specific device.
     */
    getPrecedence(context: Context, device: DeviceId): number;
    /**
     * Sets the precedence (priority) which this context wants for that specific device.
     */
    setPrecedence(context: Context, device: DeviceId, precendence: number): void;

    getFilter(context: Context, device: DeviceId): Filter;
    /**
     * Sets the stroke events that get intercepted by this instance of the library.
     * Each predicate has it's own filters state, initially set to 0 (NONE).
     */
    setFilter(context: Context, predicate: 'mouse', filter: FilterMouseState ): void;
    setFilter(context: Context, predicate: 'keyboard', filter: FilterKeyState ): void;
    setFilter(context: Context, predicate: 'keyboard' | 'mouse', filter: Filter): void;

    /**
     * Waits for a device to send a stroke, or null on failure.
     */
    wait(context: Context): DeviceId | null;
    /**
     * Waits asynchronously for device to send a stroke, or null on failure.
     * Any call to any wait method would fail until the promise is resolved either with success or failure.
     */
    waitAsync(context: Context): Promise<DeviceId | null>;

    /**
     * Waits for a device to send a stroke with a timeout, results with null on failure or timeout.
     * @param timeout in milliseconds.
     */
    waitWithTimeout(context: Context, timeout: number): DeviceId | null;
    /**
     * Waits asynchronously for a device to send a stroke with a timeout, results with null on failure or timeout.
     * @param timeout in milliseconds.
     */
    waitWithTimeoutAsync(context: Context, timeout: number): Promise<DeviceId | null>;

    /**
     * Sends a stroke under a specific device.
     */
    send<TStroke extends Stroke>(context: Context, device: DeviceId, stroke: TStroke): boolean;
    /**
     * Receives the stroke sent by a specific device, after waiting for it using one of the wait methods.
     * @returns null on failure.
     */
    receive<TStroke extends Stroke>(context: Context, device: DeviceId): TStroke | null;

    /**
     * Gets the hardware id of a specific device, which may help on disambiguation of device input.
     * The hardware ids are not requried to be unique, but mostly will when you have at least two different device models.
     */
    getHardwareId(context: Context, device: DeviceId): string | null;

    /**
     * Checks whether a device id is invalid or not.
     */
    isInvalid(device: DeviceId): boolean;
    /**
     * Checks whether a device id is for a keyboard device or not.
     */
    isKeyboard(device: DeviceId): boolean;
    /**
     * Checks whether a device id is for a mouse device or not.
     */
    isMouse(device: DeviceId): boolean;
}

import { resolve } from 'path';
const native: InterceptionNative = require('node-gyp-build')(resolve(__dirname, '../'));
export default native;