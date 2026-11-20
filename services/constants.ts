import { parseFrameMode } from './xp-frame'

export { FRAME, XP } from './xp-frame'

export const OPTION_DEFAULTS = {
  DEVICE_PATH: '/dev/ttyS1',
  BAUD_RATE: 115200,
  DATA_BITS: 8,
  STOP_BITS: 1,
  PARITY: 0
} as const

export const COMMANDS = {
  MOTOR_RUN: 0x11,
  MOTOR_ERROR: 0x10
} as const

export const TIMEOUT = {
  // ~2 s per spin (answers Q4) + queueing behind a running motor + PUSH door cycle.
  RESPONSE_MS: 8000,
  COMMAND_INTERVAL_MS: 50
} as const

// Selects TX/RX framing for on-device verification; see services/xp-frame.ts.
export const FRAME_MODE = parseFrameMode(process.env.EXPO_PUBLIC_XP_FRAME_MODE)
