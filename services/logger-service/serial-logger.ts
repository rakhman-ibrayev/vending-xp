import { commandToHex } from '../utils'
import { BaseLogger } from './base-logger'
import type { SerialConfig } from './types'

/**
 * Serial communication logging
 */
export class SerialLogger extends BaseLogger {
  protected readonly category = 'serial'

  connected(config: SerialConfig): void {
    this.breadcrumb('Serial connection established', 'info', {
      devicePath: config.devicePath
    })
  }

  connecting(config: SerialConfig): void {
    this.breadcrumb('Attempting serial connection', 'info', config)
  }

  connectionFailed(
    error: Error,
    config: { devicePath: string; baudRate: number }
  ): void {
    this.captureError(
      error,
      'error',
      { serial_operation: 'connect' },
      {
        serial: {
          devicePath: config.devicePath,
          baudRate: config.baudRate,
          error: error.message
        }
      }
    )
  }

  disconnected(): void {
    this.breadcrumb('Serial connection closed', 'info')
  }

  commandSent(bytes: string): void {
    this.breadcrumb('Serial command sent', 'debug', {
      bytes
    })
  }

  commandSendFailed(command: number, commandHex: string): void {
    this.breadcrumb('Serial command send failed', 'warning', {
      command,
      commandHex
    })
  }

  commandError(error: Error, command: number, data: number[]): void {
    this.captureError(
      error,
      'error',
      { serial_operation: 'send_command' },
      {
        serial: { command: commandToHex(command), data: data.join(',') }
      }
    )
  }

  dataReceived(bytes: string): void {
    this.breadcrumb('Serial data received', 'debug', {
      bytes
    })
  }

  frameRejected(reason: string, bytes: string): void {
    this.breadcrumb('Serial frame rejected', 'warning', { reason, bytes })
  }

  deviceNotConnected(error: Error): void {
    this.captureError(error, 'error', { serial_operation: 'send_command' })
  }

  responseTimeout(command: number, timeout: number): void {
    this.captureError(
      new Error(`Timeout waiting for response to command ${command}`),
      'warning',
      { operation: 'wait_for_response' },
      { serial: { command: commandToHex(command), timeout } }
    )
  }
}
