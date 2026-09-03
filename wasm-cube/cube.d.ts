/* tslint:disable */
/* eslint-disable */

export class Cube {
    free(): void;
    [Symbol.dispose](): void;
    is_face_visible(face_index: number): boolean;
    constructor(width: number, height: number);
    next_frame(): string;
    /**
     * Sets the color of a specific face (0 to 5) using a hex color like "#ff0000" or "ff0000"
     */
    set_face_color(face_index: number, hex_color: string): void;
    /**
     * Sets a multiline string (ASCII art) with per-character colors to be mapped onto a specific face.
     */
    set_face_colored_logo(face_index: number, logo_chars: string, logo_colors: Uint32Array): void;
    /**
     * Sets a multiline string (ASCII art) to be mapped onto a specific face.
     */
    set_face_logo(face_index: number, logo: string): void;
    /**
     * Override the current rotation angles instantly
     */
    set_rotation(a: number, b: number, c: number): void;
    /**
     * Override the rotation speed (how much it turns per frame)
     */
    set_rotation_speed(da: number, db: number, dc: number): void;
    /**
     * Sets the zoom level (projection scale factor, default 1000.0)
     */
    set_zoom(zoom: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_cube_free: (a: number, b: number) => void;
    readonly cube_is_face_visible: (a: number, b: number) => number;
    readonly cube_new: (a: number, b: number) => number;
    readonly cube_next_frame: (a: number) => [number, number];
    readonly cube_set_face_color: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_face_colored_logo: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly cube_set_face_logo: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_rotation: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_rotation_speed: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_zoom: (a: number, b: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
