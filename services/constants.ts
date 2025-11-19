// Initialization defaults
export const OPTION_DEFAULTS = {
  DEVICE_PATH: '/dev/ttyS1',
  BAUD_RATE: 9600,
  DATA_BITS: 8,
  STOP_BITS: 1,
  PARITY: 0
} as const

// Commands
export const COMMANDS = {
  READ_SERIAL: 0x01,
  READ_MOTOR_STATUS: 0x03,
  MOTOR_RUN: 0x05,
  READ_TEMP: 0x07,
  WRITE_DO: 0x08
} as const

// Motors
export const MOTOR_DEFAULTS = {
  MOTOR_TYPE: 10,
  LIGHT_SCREEN_MODE: 1,
  CONTINUE: 0,
  DELAY: 0,
  TIMEOUT: 0,
  LOCK_TIME: 0
} as const

export const MOTOR_STATUSES = {
  SUCCESS: 0x00,
  OVERCURRENT: 0x01,
  UNDERCURRENT: 0x02,
  TIMEOUT: 0x03,
  LIGHT_SCREEN_FAILED: 0x04,
  ELECTROMAGNET_NOT_OPEN: 0x05,
  MICROSWITCH_NOT_PRESSED: 0x0a
} as const

export const MOTOR_RUN_RESULTS = {
  SUCCESS: 0x00,
  INVALID_MOTOR_INDEX: 0x01,
  ANOTHER_MOTER_RUNNING: 0x02,
  PREVIOUS_OPERATION_NOT_COMPLETED: 0x03
} as const

// DO indices and values
export const DO = {
  FAN: 0,
  COMPRESSOR_INDEX: 1,
  LIGHTS_INDEX: 3,
  ON: 0xf1,
  OFF: 0xf0
} as const

// Data sizes
export const SIZES = {
  COMMAND_DATA: 16,
  RESPONSE_MIN_LENGTH: 20
} as const

// Serial number bytes
export const SERIAL = {
  START_INDEX: 2, // Z1
  END_INDEX: 13 // Z12
} as const

// Timeout
export const TIMEOUT = {
  DEFAULT_MS: 1000
} as const

// Cooling system
export enum CoolingState {
  IDLE,
  STARTING_COOLING, // Fan on, waiting 5 minutes before compressor
  COOLING, // Both fan and compressor on
  COOLED, // Both off, waiting for temperature recovery
  COMPRESSOR_REST // Compressor off for rest, fan on
}

export const COOLING = {
  DEFAULT_RECOVERY_OFFSET: 4, // Celsius
  TEMPERATURE_CHECK_INTERVAL: 60 * 1000, // 1 minute in milliseconds
  FAN_START_DELAY: 5 * 60 * 1000, // 5 minutes in milliseconds
  COMPRESSOR_MAX_RUNTIME: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
  COMPRESSOR_REST_DURATION: 15 * 60 * 1000 // 15 minutes in milliseconds
} as const
