import { MOTOR_STATUSES, MOTOR_RUN_RESULTS, DO, SIZES } from './constants'

export const hexToInt = (hex: string): number => parseInt(hex, 16)

export const parseMotorStatus = (code: number): string => {
  switch (code) {
    case MOTOR_STATUSES.SUCCESS:
      return 'Success'
    case MOTOR_STATUSES.OVERCURRENT:
      return 'Overcurrent, overload, or stuck cargo'
    case MOTOR_STATUSES.UNDERCURRENT:
      return 'Undercurrent. It is usually caused by a broken wire or an uninstalled load'
    case MOTOR_STATUSES.TIMEOUT:
      return 'Timeout, which means that the motor position signal is not detected for more than 7 seconds. (It is usually caused by heavy load, stuck cargo or interference from switching power supply)'
    case MOTOR_STATUSES.LIGHT_SCREEN_FAILED:
      return 'The light screen fails self-test and the motor is not started'
    case MOTOR_STATUSES.ELECTROMAGNET_NOT_OPEN:
      return 'Feedback electromagnet door is not open'
    case MOTOR_STATUSES.MICROSWITCH_NOT_PRESSED:
      return 'After the three-wire motor is powered on for 1.5 seconds, the microswitch is still not pressed'
    default:
      return `Unknown code ${code}`
  }
}

export const parseMotorRunResult = (code: number): string => {
  switch (code) {
    case MOTOR_RUN_RESULTS.SUCCESS:
      return 'Success'
    case MOTOR_RUN_RESULTS.INVALID_MOTOR_INDEX:
      return 'Invalid motor index'
    case MOTOR_RUN_RESULTS.ANOTHER_MOTER_RUNNING:
      return 'Another motor is currently running'
    case MOTOR_RUN_RESULTS.PREVIOUS_OPERATION_NOT_COMPLETED:
      return 'Previous operation not completed'
    default:
      return `Unknown code ${code}`
  }
}

export const parseDOStatus = (
  response: string[],
  expectedIndex: number,
  on: boolean
): boolean =>
  hexToInt(response[2]) === expectedIndex &&
  hexToInt(response[3]) === (on ? DO.ON : DO.OFF)

export const buildCommandData = (data: number[]): number[] => {
  if (data.length > SIZES.COMMAND_DATA) {
    throw new Error(
      `Data length exceeds maximum of ${SIZES.COMMAND_DATA} bytes`
    )
  }

  return [...data, ...Array(SIZES.COMMAND_DATA - data.length).fill(0)]
}
