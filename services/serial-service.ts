import SerialPortAPI, { type SerialPort } from 'react-native-serial-port-api'
import MockSerialService from './mock-serial-service'
import { FRAME_MODE, TIMEOUT } from './constants'
import { logger } from './logger-service'
import {
  encodeFrame,
  toHex,
  XPFrameReader,
  type ConnectionSettings,
  type XPFrame
} from './xp-frame'

export type { ConnectionSettings, XPFrame } from './xp-frame'

class SerialService {
  private static instance: SerialService
  private serialPort: SerialPort | null = null
  private subscriptions: Set<(frame: XPFrame) => void> = new Set()
  private reader = new XPFrameReader(FRAME_MODE)

  private constructor() {}

  static getInstance(): SerialService {
    if (!SerialService.instance) {
      SerialService.instance = new SerialService()
    }
    return SerialService.instance
  }

  async connect(settings: ConnectionSettings): Promise<boolean> {
    logger.serial.connecting(settings)

    // Never leave a previously opened port locked when re-connecting.
    this.closePort()

    let serialPort: SerialPort | null = null
    try {
      serialPort = await SerialPortAPI.open(settings.devicePath, settings)

      if (!serialPort) {
        throw new Error('XP controller device not found')
      }

      this.reader.reset()
      serialPort.onReceived(buff => this.handleIncoming(Array.from(buff)))
      this.serialPort = serialPort

      logger.serial.connected(settings)
      return true
    } catch (error) {
      try {
        serialPort?.close()
      } catch {
        // ignore close errors during failed setup
      }
      logger.serial.connectionFailed(
        error instanceof Error ? error : new Error(String(error)),
        { devicePath: settings.devicePath, baudRate: settings.baudRate }
      )
      return false
    }
  }

  async sendCommand(
    cmd: number,
    data1: number,
    data2: number
  ): Promise<boolean> {
    if (!this.serialPort) {
      const error = new Error('Device not connected')
      logger.serial.deviceNotConnected(error)
      throw error
    }

    // Validates byte ranges; throws before anything reaches the wire.
    const frame = encodeFrame(cmd, data1, data2, { mode: FRAME_MODE })
    const hex = frame.map(b => b.toString(16).padStart(2, '0')).join('')

    await new Promise(resolve =>
      setTimeout(resolve, TIMEOUT.COMMAND_INTERVAL_MS)
    )

    logger.serial.commandSent(`${toHex(frame)} (mode=${FRAME_MODE})`)

    try {
      const result = await this.serialPort.send(hex)
      if (!result) {
        logger.serial.commandSendFailed(cmd, hex)
      }
      return result
    } catch (error) {
      logger.serial.commandError(
        error instanceof Error ? error : new Error(String(error)),
        cmd,
        [data1, data2]
      )
      throw error
    }
  }

  onData(callback: (frame: XPFrame) => void): () => void {
    this.subscriptions.add(callback)
    return () => {
      this.subscriptions.delete(callback)
    }
  }

  disconnect() {
    logger.serial.disconnected()
    this.subscriptions.clear()
    this.closePort()
  }

  devicePaths = SerialPortAPI.devicePaths
  deviceNames = SerialPortAPI.deviceNames

  private handleIncoming(bytes: number[]) {
    logger.serial.dataReceived(toHex(bytes))

    for (const event of this.reader.push(bytes)) {
      if (event.type === 'frame') {
        this.subscriptions.forEach(cb => cb(event.frame))
      } else {
        logger.serial.frameRejected(event.error, toHex(event.raw))
      }
    }
  }

  private closePort() {
    if (!this.serialPort) return
    try {
      this.serialPort.close()
    } catch {
      // ignore: port may already be closed by the OS
    }
    this.serialPort = null
    this.reader.reset()
  }
}

const service =
  process.env.EXPO_PUBLIC_USE_MOCK_SERIAL !== 'true'
    ? SerialService.getInstance()
    : MockSerialService

export default service
