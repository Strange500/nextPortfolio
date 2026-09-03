/* tslint:disable */
/* eslint-disable */

export class Cube {
    free(): void;
    [Symbol.dispose](): void;
    chars_ptr(): number;
    colors_ptr(): number;
    is_face_visible(face_index: number): boolean;
    constructor(width: number, height: number);
    next_frame(): void;
    set_face_color(face_index: number, hex_color: string): void;
    set_face_colored_logo(face_index: number, logo_chars: string, logo_colors: Uint32Array): void;
    set_face_logo(face_index: number, logo: string): void;
    set_rotation(a: number, b: number, c: number): void;
    set_rotation_speed(da: number, db: number, dc: number): void;
    set_zoom(zoom: number): void;
    update_face_fast(face_index: number, logo_chars: Uint8Array, logo_colors: Uint32Array): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_cube_free: (a: number, b: number) => void;
    readonly cube_chars_ptr: (a: number) => number;
    readonly cube_colors_ptr: (a: number) => number;
    readonly cube_is_face_visible: (a: number, b: number) => number;
    readonly cube_new: (a: number, b: number) => number;
    readonly cube_next_frame: (a: number) => void;
    readonly cube_set_face_color: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_face_colored_logo: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly cube_set_face_logo: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_rotation: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_rotation_speed: (a: number, b: number, c: number, d: number) => void;
    readonly cube_set_zoom: (a: number, b: number) => void;
    readonly cube_update_face_fast: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
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
