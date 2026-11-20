import { COMMANDS, FRAME_MODE } from './constants'
import {
  decodeFrame,
  encodeFrame,
  XPFrameReader,
  type ConnectionSettings,
  type XPFrame
} from './xp-frame'

// Simulates the XP board at the byte level: TX frames are encoded and decoded
// exactly as the board would, and replies are encoded, fragmented and fed through
// the same XPFrameReader the real SerialService uses.
//
// EXPO_PUBLIC_MOCK_SERIAL_SCENARIO = success | error | timeout | random (default success)
type Scenario = 'success' | 'error' | 'timeout' | 'random'

const SCENARIO: Scenario = (() => {
  const value = process.env.EXPO_PUBLIC_MOCK_SERIAL_SCENARIO
  return value === 'error' || value === 'timeout' || value === 'random'
    ? value
    : 'success'
})()

const MOTOR_TIME_MS = 2000 // manufacturer answer Q4: ~2 s per spin

class MockSerialService {
  private static instance: MockSerialService
  private subscriptions: Set<(frame: XPFrame) => void> = new Set()
  private reader = new XPFrameReader(FRAME_MODE)
  private isConnected = false
  private motorBusyUntil = 0

  private constructor() {}

  static getInstance(): MockSerialService {
    if (!MockSerialService.instance) {
      MockSerialService.instance = new MockSerialService()
    }
    return MockSerialService.instance
  }

  async connect(_settings: ConnectionSettings): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300))
    this.reader.reset()
    this.isConnected = true
    return true
  }

  async sendCommand(
    cmd: number,
    data1: number,
    data2: number
  ): Promise<boolean> {
    if (!this.isConnected) throw new Error('Mock device not connected')

    // Same encoder (and byte validation) as the real port...
    const wire = encodeFrame(cmd, data1, data2, { mode: FRAME_MODE })
    // ...and decode it as the board would.
    const received = decodeFrame(wire, { mode: FRAME_MODE })
    if (!received.ok) {
      throw new Error(`Mock board rejected frame: ${received.error}`)
    }

    this.simulateBoard(received.frame)
    return true
  }

  onData(callback: (frame: XPFrame) => void): () => void {
    this.subscriptions.add(callback)
    return () => {
      this.subscriptions.delete(callback)
    }
  }

  disconnect() {
    this.subscriptions.clear()
    this.reader.reset()
    this.isConnected = false
  }

  devicePaths(callback: (paths: string[]) => void) {
    setTimeout(
      () => callback(['/dev/ttyS1', '/dev/ttyS0', '/dev/ttyUSB0']),
      100
    )
  }

  deviceNames(callback: (names: string[]) => void) {
    setTimeout(
      () => callback(['Serial Port 1', 'Serial Port 0', 'USB Serial']),
      100
    )
  }

  private simulateBoard({ cmd, data1: row, data2: col }: XPFrame) {
    if (cmd !== COMMANDS.MOTOR_RUN) return

    const outcome: Exclude<Scenario, 'random'> =
      SCENARIO === 'random'
        ? (['success', 'success', 'error', 'timeout'] as const)[
            Math.floor(Math.random() * 4)
          ]
        : SCENARIO

    if (outcome === 'timeout') return

    // The board queues commands while a motor is running (answers Q4).
    const now = Date.now()
    const startAt = Math.max(now, this.motorBusyUntil)
    this.motorBusyUntil = startAt + MOTOR_TIME_MS
    const delay = this.motorBusyUntil - now

    const replyCmd =
      outcome === 'success' ? COMMANDS.MOTOR_RUN : COMMANDS.MOTOR_ERROR
    // Board-generated reply always uses a fresh random ENC in spec mode.
    const reply = encodeFrame(replyCmd, row, col, { mode: FRAME_MODE })

    setTimeout(() => this.deliverFragmented(reply), delay)
  }

  private deliverFragmented(bytes: number[]) {
    // Split into random 1-5 byte chunks to exercise reassembly, like real UART reads.
    let offset = 0
    let chunkDelay = 0
    while (offset < bytes.length) {
      const size = Math.min(
        bytes.length - offset,
        1 + Math.floor(Math.random() * 5)
      )
      const chunk = bytes.slice(offset, offset + size)
      offset += size
      setTimeout(() => this.receive(chunk), chunkDelay)
      chunkDelay += 5
    }
  }

  private receive(chunk: number[]) {
    if (!this.isConnected) return
    for (const event of this.reader.push(chunk)) {
      if (event.type === 'frame')
        this.subscriptions.forEach(cb => cb(event.frame))
    }
  }
}

export default MockSerialService.getInstance()
