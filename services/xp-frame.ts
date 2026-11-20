// Pure XP protocol codec (no React Native imports) so it can be shared by the
// real serial service, the mock, and unit tests run under plain Node.
//
// Frame (8 bytes, both directions): 58 50 CMD D1 D2 ENC LRC 4C
//  - Only D1/D2 are encrypted (manufacturer answer Q2), CMD is sent as-is.
//  - ENC & 0x20 == 0  -> D1/D2 are bitwise inverted
//    ENC & 0x20 != 0  -> D1/D2 are XORed with ENC
//  - LRC = XOR of bytes 0..5 as they appear on the wire.
//
// The manufacturer's example `58 50 11 01 01 00 00 4C` contradicts the spec
// (ENC=00 implies inversion, and the spec LRC is 0x19, not 0x00), so the frame
// mode is selectable for on-device testing:
//  - 'spec'    random ENC, encrypted data, spec LRC          (default)
//  - 'literal' plaintext data, ENC=00, LRC=00               (byte-identical to the example)
//  - 'plain'   plaintext data, ENC=00, spec LRC             (example with only LRC zeroed)

export const FRAME = {
  HEADER_1: 0x58,
  HEADER_2: 0x50,
  FOOTER: 0x4c,
  LENGTH: 8
} as const

export const XP = {
  MAX_ROWS: 10,
  MAX_COLS: 10,
  MAX_SLOTS: 100
} as const

export type XPFrameMode = 'spec' | 'literal' | 'plain'

export interface XPFrame {
  cmd: number
  data1: number
  data2: number
}

export interface ConnectionSettings {
  devicePath: string
  baudRate: number
  dataBits: number
  stopBits: number
  parity: 0 | 1 | 2
}

export type XPDecodeError = 'length' | 'header' | 'footer' | 'lrc'

export type XPDecodeResult =
  | { ok: true; frame: XPFrame }
  | { ok: false; error: XPDecodeError }

export function parseFrameMode(value: string | undefined): XPFrameMode {
  return value === 'literal' || value === 'plain' ? value : 'spec'
}

const isByte = (n: number) => Number.isInteger(n) && n >= 0 && n <= 0xff

function assertByte(name: string, n: number) {
  if (!isByte(n))
    throw new RangeError(`${name} must be a byte (0-255), got ${n}`)
}

export function computeLrc(bytes: readonly number[]): number {
  let lrc = 0
  for (let i = 0; i < 6; i++) lrc ^= bytes[i]
  return lrc & 0xff
}

function cipher(enc: number, value: number): number {
  // Inversion and XOR are both self-inverse, so the same function encrypts and decrypts.
  return (enc & 0x20) === 0 ? ~value & 0xff : (value ^ enc) & 0xff
}

/**
 * Maps a 1-based slot index to the controller's 1-based row/column address
 * (10 columns per row). Slots 1-10 -> row 1, cols 1-10 (manufacturer answer Q5).
 * Returns null for anything outside 1..100 or non-integers.
 */
export function slotToMotor(slot: number): { row: number; col: number } | null {
  if (!Number.isInteger(slot) || slot < 1 || slot > XP.MAX_SLOTS) return null
  return {
    row: Math.floor((slot - 1) / XP.MAX_COLS) + 1,
    col: ((slot - 1) % XP.MAX_COLS) + 1
  }
}

export function encodeFrame(
  cmd: number,
  data1: number,
  data2: number,
  options: { mode?: XPFrameMode; enc?: number } = {}
): number[] {
  const mode = options.mode ?? 'spec'
  assertByte('cmd', cmd)
  assertByte('data1', data1)
  assertByte('data2', data2)

  if (mode === 'literal' || mode === 'plain') {
    const frame = [
      FRAME.HEADER_1,
      FRAME.HEADER_2,
      cmd,
      data1,
      data2,
      0x00,
      0x00,
      FRAME.FOOTER
    ]
    if (mode === 'plain') frame[6] = computeLrc(frame)
    return frame
  }

  const enc = options.enc ?? Math.floor(Math.random() * 256)
  assertByte('enc', enc)

  const frame = [
    FRAME.HEADER_1,
    FRAME.HEADER_2,
    cmd,
    cipher(enc, data1),
    cipher(enc, data2),
    enc,
    0x00,
    FRAME.FOOTER
  ]
  frame[6] = computeLrc(frame)
  return frame
}

/**
 * Decodes exactly one 8-byte frame. In 'spec' mode the LRC must match and data
 * is decrypted. In 'literal'/'plain' mode a frame that fails the spec check is
 * additionally accepted as plaintext when ENC=00 and LRC is 00 or the plaintext LRC.
 */
export function decodeFrame(
  bytes: readonly number[],
  options: { mode?: XPFrameMode } = {}
): XPDecodeResult {
  const mode = options.mode ?? 'spec'

  if (bytes.length !== FRAME.LENGTH) return { ok: false, error: 'length' }
  if (bytes[0] !== FRAME.HEADER_1 || bytes[1] !== FRAME.HEADER_2) {
    return { ok: false, error: 'header' }
  }
  if (bytes[7] !== FRAME.FOOTER) return { ok: false, error: 'footer' }

  const [, , cmd, wire1, wire2, enc, lrc] = bytes
  const expectedLrc = computeLrc(bytes)

  if (lrc === expectedLrc && mode === 'spec') {
    return {
      ok: true,
      frame: { cmd, data1: cipher(enc, wire1), data2: cipher(enc, wire2) }
    }
  }

  if (mode !== 'spec') {
    // Non-spec modes: prefer the plaintext reading for ENC=00 frames, since the
    // spec reading of ENC=00 (inversion) is exactly what is under test.
    if (enc === 0x00 && (lrc === 0x00 || lrc === expectedLrc)) {
      return { ok: true, frame: { cmd, data1: wire1, data2: wire2 } }
    }
    if (lrc === expectedLrc) {
      return {
        ok: true,
        frame: { cmd, data1: cipher(enc, wire1), data2: cipher(enc, wire2) }
      }
    }
  }

  return { ok: false, error: 'lrc' }
}

export type XPReaderEvent =
  | { type: 'frame'; frame: XPFrame; raw: number[] }
  | { type: 'rejected'; error: XPDecodeError | 'overflow'; raw: number[] }

const MAX_BUFFER = 64

/**
 * Reassembles frames from an arbitrarily fragmented byte stream: resyncs on the
 * `58 50` header, waits for a full 8 bytes, and on a bad frame drops one byte
 * and rescans so a corrupt or partial frame cannot swallow the next good one.
 */
export class XPFrameReader {
  private buffer: number[] = []

  constructor(private readonly mode: XPFrameMode = 'spec') {}

  reset() {
    this.buffer = []
  }

  push(chunk: ArrayLike<number>): XPReaderEvent[] {
    const events: XPReaderEvent[] = []
    for (let i = 0; i < chunk.length; i++) this.buffer.push(chunk[i] & 0xff)

    while (this.buffer.length > 0) {
      const start = this.findHeader()
      if (start === -1) {
        // Keep a trailing 0x58: it may be the first half of a split header.
        const keep =
          this.buffer[this.buffer.length - 1] === FRAME.HEADER_1 ? 1 : 0
        const dropped = this.buffer.splice(0, this.buffer.length - keep)
        if (dropped.length > 0)
          events.push({ type: 'rejected', error: 'header', raw: dropped })
        break
      }
      if (start > 0) {
        events.push({
          type: 'rejected',
          error: 'header',
          raw: this.buffer.splice(0, start)
        })
      }
      if (this.buffer.length < FRAME.LENGTH) break

      const candidate = this.buffer.slice(0, FRAME.LENGTH)
      const result = decodeFrame(candidate, { mode: this.mode })
      if (result.ok) {
        this.buffer.splice(0, FRAME.LENGTH)
        events.push({ type: 'frame', frame: result.frame, raw: candidate })
      } else {
        this.buffer.splice(0, 1)
        events.push({ type: 'rejected', error: result.error, raw: candidate })
      }
    }

    if (this.buffer.length > MAX_BUFFER) {
      events.push({
        type: 'rejected',
        error: 'overflow',
        raw: this.buffer.splice(0)
      })
    }
    return events
  }

  private findHeader(): number {
    for (let i = 0; i < this.buffer.length - 1; i++) {
      if (
        this.buffer[i] === FRAME.HEADER_1 &&
        this.buffer[i + 1] === FRAME.HEADER_2
      )
        return i
    }
    return -1
  }
}

export const toHex = (bytes: readonly number[]) =>
  bytes.map(b => b.toString(16).padStart(2, '0')).join(' ')
