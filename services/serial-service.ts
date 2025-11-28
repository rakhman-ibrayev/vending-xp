import SerialPortAPI, { type SerialPort } from 'react-native-serial-port-api'
import crc16modbus from './crc16modbus'
import MockSerialService from './mock-serial-service'
import { SIZES, TIMEOUT } from './constants'

/**
 * Settings for establishing a serial connection to the vending machine.
 */
export interface ConnectionSettings {
  devicePath: string
  baudRate: number
  dataBits: number
  stopBits: number
  parity: 0 | 1 | 2
}

/**
 * Singleton service for handling serial communication with the vending machine hardware.
 * Manages connection, command sending, and data reception. Uses react-native-serial-port-api
 * for real hardware connections and falls back to a mock service in development.
 */
class SerialService {
  private static instance: SerialService
  private serialPort: SerialPort | null = null
  private subscriptions: Set<(decimalData: string[]) => void> = new Set()

  private constructor() {}

  /**
   * Gets the singleton instance of SerialService.
   * @returns The SerialService instance
   */
  static getInstance(): SerialService {
    if (!SerialService.instance) {
      SerialService.instance = new SerialService()
    }

    return SerialService.instance
  }

  /**
   * Establishes a serial connection to the vending machine.
   * @param settings - Connection parameters including device path and baud rate
   * @returns Promise resolving to true if connection successful
   */
  async connect(settings: ConnectionSettings): Promise<boolean> {
    try {
      const serialPort = await SerialPortAPI.open(settings.devicePath, settings)

      if (!serialPort) throw new Error('M109E device not found')

      this.serialPort = serialPort

      this.serialPort.onReceived(buff => {
        const bytes = this.hexToByteArray(buff.toString('hex'))

        console.info(
          'onData(): received buffer -',
          buff,
          'transformed to bytes -',
          bytes
        )

        this.subscriptions.forEach(cb => cb(bytes))
      })

      return true
    } catch (error) {
      console.error('Connection failed:', error)
      return false
    }
  }

  /**
   * Sends a command to the vending machine with associated data.
   * @param command - Command byte (e.g., 0x01 for read serial)
   * @param data - Array of data bytes to send with the command
   * @returns Promise resolving to true if send successful
   */
  async sendCommand(command: number, data: number[]): Promise<boolean> {
    if (!this.serialPort) throw new Error('Device not connected')

    await new Promise(resolve =>
      setTimeout(resolve, TIMEOUT.COMMAND_INTERVAL_MS)
    )

    const frame = this.buildFrame(command, data)
    const commandHex = this.toHexString(frame)

    console.info(
      'sendCommand(): command -',
      command,
      'and data -',
      data,
      'resulted in hex string command -',
      commandHex
    )

    return await this.serialPort.send(commandHex)
  }

  /**
   * Subscribes to incoming data from the serial port.
   * @param callback - Function called with received data as hex string array
   * @returns Unsubscribe function
   */
  onData(callback: (data: string[]) => void): () => void {
    this.subscriptions.add(callback) // subscribe

    return () => this.subscriptions.delete(callback) // unsubscribe
  }

  /**
   * Disconnects from the serial port and clears subscriptions.
   */
  disconnect() {
    this.subscriptions.clear()
    this.serialPort?.close()
    this.serialPort = null
  }

  /**
   * Gets available serial device paths.
   * @param callback - Function called with array of device paths
   */
  devicePaths = SerialPortAPI.devicePaths

  /**
   * Gets available serial device names.
   * @param callback - Function called with array of device names
   */
  deviceNames = SerialPortAPI.deviceNames

  /**
   * Builds a complete Modbus frame with CRC for the given command and data.
   * @param command - Command byte
   * @param data - Data bytes (up to 16 bytes)
   * @returns Complete frame as number array (20 bytes)
   */
  private buildFrame(command: number, data: number[]): number[] {
    if (data.length > SIZES.COMMAND_DATA) {
      throw new Error(
        `Data length exceeds maximum of ${SIZES.COMMAND_DATA} bytes`
      )
    }

    const frame = new Array(20).fill(0)
    frame[0] = 0x01 // Slave address
    frame[1] = command

    data.forEach((byte, i) => (frame[i + 2] = byte))

    const crc = crc16modbus(new Uint8Array(frame.slice(0, 18)))
    frame[18] = crc & 0xff
    frame[19] = (crc >> 8) & 0xff

    return frame
  }

  /**
   * Converts a byte array to a hex string.
   * @param bytes - Array of byte values
   * @returns Concatenated hex string
   */
  private toHexString(bytes: number[]): string {
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Converts a hex string to an array of hex byte strings.
   * @param hex - Hex string (e.g., "010203")
   * @returns Array of 2-character hex strings (e.g., ["01", "02", "03"])
   */
  private hexToByteArray(hex: string): string[] {
    const bytes: string[] = []

    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(hex.substring(i, i + 2))
    }

    return bytes
  }
}

// Export the appropriate service based on environment
const service =
  process.env.EXPO_PUBLIC_USE_MOCK_SERIAL !== 'true'
    ? SerialService.getInstance()
    : MockSerialService

export default service
