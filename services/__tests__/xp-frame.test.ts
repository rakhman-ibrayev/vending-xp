import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  computeLrc,
  decodeFrame,
  encodeFrame,
  slotToMotor,
  XPFrameReader,
  type XPFrame
} from '../xp-frame'

const MOTOR_RUN = 0x11
const MOTOR_ERROR = 0x10

const frames = (reader: XPFrameReader, chunk: number[]): XPFrame[] =>
  reader.push(chunk).flatMap(e => (e.type === 'frame' ? [e.frame] : []))

describe('slotToMotor', () => {
  it('maps 1-based slots to 1-based row/col with 10 columns per row', () => {
    assert.deepEqual(slotToMotor(1), { row: 1, col: 1 })
    assert.deepEqual(slotToMotor(10), { row: 1, col: 10 })
    assert.deepEqual(slotToMotor(11), { row: 2, col: 1 })
    assert.deepEqual(slotToMotor(100), { row: 10, col: 10 })
  })

  it('rejects out-of-range and non-integer slots', () => {
    for (const bad of [0, -1, 101, 1.5, NaN, Infinity]) {
      assert.equal(slotToMotor(bad), null, `slot ${bad}`)
    }
  })
})

describe('encodeFrame (spec)', () => {
  it('inverts data when ENC & 0x20 == 0 and computes LRC over wire bytes', () => {
    const f = encodeFrame(MOTOR_RUN, 1, 1, { enc: 0x00 })
    assert.deepEqual(f, [0x58, 0x50, 0x11, 0xfe, 0xfe, 0x00, 0x19, 0x4c])
  })

  it('XORs data with ENC when ENC & 0x20 != 0', () => {
    const f = encodeFrame(MOTOR_RUN, 3, 3, { enc: 0x25 })
    assert.deepEqual(f.slice(0, 6), [
      0x58,
      0x50,
      0x11,
      0x03 ^ 0x25,
      0x03 ^ 0x25,
      0x25
    ])
    assert.equal(f[6], computeLrc(f))
    assert.equal(f[7], 0x4c)
  })

  it('never encrypts the command byte', () => {
    for (let enc = 0; enc < 256; enc++) {
      assert.equal(encodeFrame(MOTOR_RUN, 1, 5, { enc })[2], MOTOR_RUN)
    }
  })

  it('round-trips every ENC value for every addressable motor', () => {
    for (let slot = 1; slot <= 100; slot++) {
      const { row, col } = slotToMotor(slot)!
      for (let enc = 0; enc < 256; enc++) {
        const decoded = decodeFrame(encodeFrame(MOTOR_RUN, row, col, { enc }))
        assert.ok(decoded.ok)
        assert.deepEqual(decoded.frame, {
          cmd: MOTOR_RUN,
          data1: row,
          data2: col
        })
      }
    }
  })

  it('rejects non-byte input before building a frame', () => {
    assert.throws(() => encodeFrame(MOTOR_RUN, 1, 256), RangeError)
    assert.throws(() => encodeFrame(MOTOR_RUN, -1, 1), RangeError)
    assert.throws(() => encodeFrame(MOTOR_RUN, 1, 1.5), RangeError)
  })
})

describe('manufacturer example variants', () => {
  it('literal mode is byte-identical to 58 50 11 01 01 00 00 4C', () => {
    assert.deepEqual(
      encodeFrame(MOTOR_RUN, 1, 1, { mode: 'literal' }),
      [0x58, 0x50, 0x11, 0x01, 0x01, 0x00, 0x00, 0x4c]
    )
  })

  it('plain mode keeps plaintext data with the spec LRC (0x19)', () => {
    assert.deepEqual(
      encodeFrame(MOTOR_RUN, 1, 1, { mode: 'plain' }),
      [0x58, 0x50, 0x11, 0x01, 0x01, 0x00, 0x19, 0x4c]
    )
  })

  it('the example frame fails strict spec decoding (LRC 00 != 19)', () => {
    const r = decodeFrame([0x58, 0x50, 0x11, 0x01, 0x01, 0x00, 0x00, 0x4c])
    assert.deepEqual(r, { ok: false, error: 'lrc' })
  })

  it('literal/plain modes read ENC=00 replies as plaintext', () => {
    for (const mode of ['literal', 'plain'] as const) {
      for (const lrc of [0x00, 0x19]) {
        const r = decodeFrame([0x58, 0x50, 0x11, 0x01, 0x01, 0x00, lrc, 0x4c], {
          mode
        })
        assert.ok(r.ok)
        assert.deepEqual(r.frame, { cmd: MOTOR_RUN, data1: 1, data2: 1 })
      }
    }
  })

  it('literal/plain modes still accept spec-encrypted replies', () => {
    const wire = encodeFrame(MOTOR_RUN, 1, 7, { enc: 0x6b })
    const r = decodeFrame(wire, { mode: 'literal' })
    assert.ok(r.ok)
    assert.deepEqual(r.frame, { cmd: MOTOR_RUN, data1: 1, data2: 7 })
  })
})

describe('decodeFrame validation', () => {
  const good = encodeFrame(MOTOR_RUN, 1, 4, { enc: 0x31 })

  it('rejects bad LRC', () => {
    const bad = [...good]
    bad[6] ^= 0x01
    assert.deepEqual(decodeFrame(bad), { ok: false, error: 'lrc' })
  })

  it('rejects corrupted data byte via LRC', () => {
    const bad = [...good]
    bad[3] ^= 0x10
    assert.deepEqual(decodeFrame(bad), { ok: false, error: 'lrc' })
  })

  it('rejects bad header, footer and length', () => {
    assert.deepEqual(decodeFrame([0x00, ...good.slice(1)]), {
      ok: false,
      error: 'header'
    })
    assert.deepEqual(decodeFrame([...good.slice(0, 7), 0x00]), {
      ok: false,
      error: 'footer'
    })
    assert.deepEqual(decodeFrame(good.slice(0, 7)), {
      ok: false,
      error: 'length'
    })
  })

  it('decodes motor error (0x10) with fault row/col', () => {
    const r = decodeFrame(encodeFrame(MOTOR_ERROR, 1, 9, { enc: 0x80 }))
    assert.ok(r.ok)
    assert.deepEqual(r.frame, { cmd: MOTOR_ERROR, data1: 1, data2: 9 })
  })
})

describe('XPFrameReader', () => {
  const a = encodeFrame(MOTOR_RUN, 1, 2, { enc: 0x44 })
  const b = encodeFrame(MOTOR_ERROR, 1, 3, { enc: 0x12 })

  it('reassembles a frame delivered one byte at a time', () => {
    const reader = new XPFrameReader()
    const out: XPFrame[] = []
    for (const byte of a) out.push(...frames(reader, [byte]))
    assert.deepEqual(out, [{ cmd: MOTOR_RUN, data1: 1, data2: 2 }])
  })

  it('splits two frames delivered in one chunk', () => {
    const reader = new XPFrameReader()
    assert.deepEqual(frames(reader, [...a, ...b]), [
      { cmd: MOTOR_RUN, data1: 1, data2: 2 },
      { cmd: MOTOR_ERROR, data1: 1, data2: 3 }
    ])
  })

  it('skips leading garbage, including a lone 0x58', () => {
    const reader = new XPFrameReader()
    assert.deepEqual(frames(reader, [0x00, 0x58, 0xff, 0x4c, ...a]), [
      { cmd: MOTOR_RUN, data1: 1, data2: 2 }
    ])
  })

  it('handles a header split across chunks', () => {
    const reader = new XPFrameReader()
    assert.deepEqual(frames(reader, [0x13, a[0]]), [])
    assert.deepEqual(frames(reader, a.slice(1)), [
      { cmd: MOTOR_RUN, data1: 1, data2: 2 }
    ])
  })

  it('drops a corrupt frame and recovers the next good one', () => {
    const reader = new XPFrameReader()
    const corrupt = [...a]
    corrupt[6] ^= 0xff
    const events = reader.push([...corrupt, ...b])
    assert.ok(events.some(e => e.type === 'rejected' && e.error === 'lrc'))
    assert.deepEqual(
      events.flatMap(e => (e.type === 'frame' ? [e.frame] : [])),
      [{ cmd: MOTOR_ERROR, data1: 1, data2: 3 }]
    )
  })

  it('recovers when a truncated frame is followed by a full one', () => {
    const reader = new XPFrameReader()
    assert.deepEqual(frames(reader, [...a.slice(0, 5), ...b]), [
      { cmd: MOTOR_ERROR, data1: 1, data2: 3 }
    ])
  })

  it('reset() discards a pending partial frame', () => {
    const reader = new XPFrameReader()
    frames(reader, a.slice(0, 4))
    reader.reset()
    assert.deepEqual(frames(reader, a.slice(4)), [])
    assert.deepEqual(frames(reader, b), [
      { cmd: MOTOR_ERROR, data1: 1, data2: 3 }
    ])
  })
})
