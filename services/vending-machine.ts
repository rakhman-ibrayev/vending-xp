import SerialService from './serial-service'
import * as C from './constants'
import {
  hexToInt,
  parseDOStatus,
  parseMotorStatus,
  buildCommandData
} from './utils'

export interface InitializationSettings {
  devicePath?: string
  baudRate?: number
  dataBits?: number
  stopBits?: number
  parity?: 0 | 1 | 2
}

/**
 * Static API for interacting with the vending machine hardware.
 * Handles serial communication, product vending, and status monitoring.
 */
class VendingMachineAPI {
  private static isInitialized = false
  private static targetTemperature: number | null = null
  private static coolingState: C.CoolingState = C.CoolingState.IDLE
  private static compressorStartTime: number | null = null
  private static fanStartTime: number | null = null
  private static restStartTime: number | null = null
  private static coolingInterval: number | null = null
  private static temperatureChangeCallbacks: ((temp: number) => void)[] = []
  private static serialNumber: string | null = null

  /**
   * Initializes the vending machine connection.
   * Establishes serial communication and turns on lights and compressor.
   * @param settings - Serial connection settings (defaults provided)
   * @returns Promise resolving to true if connected successfully
   */
  static async init({
    devicePath = C.OPTION_DEFAULTS.DEVICE_PATH,
    baudRate = C.OPTION_DEFAULTS.BAUD_RATE,
    dataBits = C.OPTION_DEFAULTS.DATA_BITS,
    stopBits = C.OPTION_DEFAULTS.STOP_BITS,
    parity = C.OPTION_DEFAULTS.PARITY
  }: InitializationSettings = {}): Promise<boolean> {
    if (this.isInitialized) return true

    const connected = await SerialService.connect({
      devicePath,
      baudRate,
      dataBits,
      stopBits,
      parity
    })

    if (connected) {
      this.isInitialized = true
      await this.setLights(true)
    }

    this.coolingInterval = setInterval(async () => {
      const currentTemp = await this.getTemperature()
      this.emitTemperatureChange(currentTemp)
      await this.startCooling(currentTemp)
    }, C.COOLING.TEMPERATURE_CHECK_INTERVAL)

    return connected
  }

  /**
   * Closes the vending machine connection.
   * Turns off lights and compressor, then disconnects serial communication.
   */
  static close() {
    this.setLights(false)
    this.setCompressor(false)
    this.isInitialized = false
    SerialService.disconnect()
    if (this.coolingInterval) {
      clearInterval(this.coolingInterval)
      this.coolingInterval = null
    }
    this.temperatureChangeCallbacks = []
  }

  /**
   * Sets the target temperature for the vending machine.
   * @param temp - Target temperature in Celsius
   */
  static setTargetTemperature(temp: number) {
    this.targetTemperature = temp
  }

  /**
   * Registers a callback to be called when temperature changes.
   * @param callback - Function to call with the new temperature value
   */
  static onTemperatureChange(callback: (temp: number) => void): void {
    this.temperatureChangeCallbacks.push(callback)
  }

  /**
   * Removes a previously registered temperature change callback.
   * @param callback - The callback function to remove
   */
  static offTemperatureChange(callback: (temp: number) => void): void {
    const index = this.temperatureChangeCallbacks.indexOf(callback)
    if (index > -1) {
      this.temperatureChangeCallbacks.splice(index, 1)
    }
  }

  /**
   * Emits a temperature change event to all registered callbacks.
   * @param temp - The new temperature value
   */
  private static emitTemperatureChange(temp: number): void {
    this.temperatureChangeCallbacks.forEach(callback => {
      try {
        callback(temp)
      } catch (error) {
        console.error('[VendingMachineAPI.emitTemperatureChange] Error', error)
      }
    })
  }

  /**
   * Processes the cooling algorithm for the current temperature reading.
   * This method is called automatically every minute by the cooling interval.
   * @param currentTemp - Current temperature in Celsius
   */
  static async startCooling(currentTemp: number): Promise<void> {
    if (this.targetTemperature === null) {
      return
    }

    switch (this.coolingState) {
      case C.CoolingState.IDLE:
        if (
          currentTemp >
          this.targetTemperature + C.COOLING.DEFAULT_RECOVERY_OFFSET
        ) {
          // Start cooling: turn on fan
          await this.setFan(true)
          this.fanStartTime = Date.now()
          this.coolingState = C.CoolingState.STARTING_COOLING
        }
        break

      case C.CoolingState.STARTING_COOLING:
        if (Date.now() - this.fanStartTime! >= C.COOLING.FAN_START_DELAY) {
          // 5 minutes - turn on compressor
          await this.setCompressor(true)
          this.compressorStartTime = Date.now()
          this.coolingState = C.CoolingState.COOLING
        }
        break

      case C.CoolingState.COOLING:
        if (currentTemp <= this.targetTemperature) {
          // Target reached: turn off both
          await this.setFan(false)
          await this.setCompressor(false)
          this.compressorStartTime = null
          this.fanStartTime = null
          this.coolingState = C.CoolingState.COOLED
        } else if (
          this.compressorStartTime &&
          Date.now() - this.compressorStartTime >=
            C.COOLING.COMPRESSOR_MAX_RUNTIME
        ) {
          // 3 hours - compressor protection: shut down compressor for rest
          await this.setCompressor(false)
          this.restStartTime = Date.now()
          this.coolingState = C.CoolingState.COMPRESSOR_REST
        }
        break

      case C.CoolingState.COOLED:
        if (
          currentTemp >=
          this.targetTemperature + C.COOLING.DEFAULT_RECOVERY_OFFSET
        ) {
          // Temperature recovered: restart cooling
          await this.setFan(true)
          this.fanStartTime = Date.now()
          this.coolingState = C.CoolingState.STARTING_COOLING
        }
        break

      case C.CoolingState.COMPRESSOR_REST:
        if (
          Date.now() - this.restStartTime! >=
          C.COOLING.COMPRESSOR_REST_DURATION
        ) {
          // 15 minutes rest - restart compressor
          await this.setCompressor(true)
          this.compressorStartTime = Date.now()
          this.coolingState = C.CoolingState.COOLING
        }
        break
    }
  }

  /**
   * Stops the automatic cooling algorithm and turns off fan and compressor.
   */
  static async stopCooling(): Promise<void> {
    this.coolingState = C.CoolingState.IDLE
    this.compressorStartTime = null
    this.fanStartTime = null
    this.restStartTime = null
    await this.setFan(false)
    await this.setCompressor(false)
  }

  /**
   * Retrieves the current temperature from the vending machine.
   * @returns Promise resolving to temperature in Celsius
   */
  static async getTemperature(): Promise<number> {
    const command = C.COMMANDS.READ_TEMP

    await SerialService.sendCommand(command, buildCommandData([]))

    return this.waitForResponse(command, response => {
      if (response.length < C.SIZES.RESPONSE_MIN_LENGTH) return null

      return (hexToInt(`${response[2]}${response[3]}`) - 20) / 10
    })
  }

  /**
   * Retrieves the serial number of the vending machine.
   * @returns Promise resolving to serial number as a hex string
   */
  static async getSerialNumber(): Promise<string> {
    if (this.serialNumber) {
      return this.serialNumber
    }

    const command = C.COMMANDS.READ_SERIAL

    await SerialService.sendCommand(command, buildCommandData([]))

    this.serialNumber = await this.waitForResponse(command, response => {
      if (response.length < C.SIZES.RESPONSE_MIN_LENGTH) return null

      const serialBytes = response.slice(
        C.SERIAL.START_INDEX,
        C.SERIAL.END_INDEX + 1
      )

      return serialBytes.map(byte => hexToInt(byte)).join('')
    })

    return this.serialNumber
  }

  /**
   * Vends a product from the specified slot.
   * @param slot - Motor slot index (0-based)
   * @param options - Optional motor configuration
   * @returns Promise resolving to vend result with success status and error if failed
   */
  static async vendProduct(
    slot: number,
    options: {
      motorType?: number
      lightScreenMode?: number
      delay?: number
      timeout?: number
    } = {}
  ): Promise<{ success: boolean }> {
    const command = C.COMMANDS.MOTOR_RUN
    const maxWaitMs = options.timeout
      ? options.timeout / 10
      : C.TIMEOUT.MOTOR_TIMEOUT_MS

    await SerialService.sendCommand(
      command,
      buildCommandData([
        slot,
        options.motorType ?? C.MOTOR_DEFAULTS.MOTOR_TYPE,
        options.lightScreenMode ?? C.MOTOR_DEFAULTS.LIGHT_SCREEN_MODE,
        options.delay ?? C.MOTOR_DEFAULTS.DELAY,
        C.MOTOR_DEFAULTS.CONTINUE,
        options.timeout ?? C.MOTOR_DEFAULTS.TIMEOUT,
        C.MOTOR_DEFAULTS.LOCK_TIME
      ])
    )

    return await new Promise(resolve => {
      const intervalId = setInterval(async () => {
        const { raw } = await this.getMotorStatus()
        const z3 = hexToInt(raw[C.RESPONSE_INDICES.Z3])
        const z10 = hexToInt(raw[C.RESPONSE_INDICES.Z10])

        if (z3 === 0 && z10 > 0) {
          clearInterval(intervalId)
          resolve({ success: true })
          return
        }

        if (z3 !== 0) {
          clearInterval(intervalId)
          resolve({ success: false })
          return
        }
      }, C.TIMEOUT.DEFAULT_MS)

      // overall timeout to stop polling
      setTimeout(() => {
        clearInterval(intervalId)
        resolve({ success: false })
      }, maxWaitMs)
    })
  }

  /**
   * Retrieves the current motor status.
   * @returns Promise resolving to human-readable status string
   */
  static async getMotorStatus(): Promise<{
    raw: string[]
    status: string
  }> {
    const command = C.COMMANDS.READ_MOTOR_STATUS

    await SerialService.sendCommand(command, buildCommandData([]))

    return this.waitForResponse(command, response => {
      if (response.length < C.SIZES.RESPONSE_MIN_LENGTH) return null

      return {
        raw: response,
        status: parseMotorStatus(hexToInt(response[C.RESPONSE_INDICES.Z3]))
      }
    })
  }

  /**
   * Controls the compressor (cooling system).
   * @param on - True to turn on, false to turn off
   * @returns Promise resolving to true if command succeeded
   */
  static async setCompressor(on: boolean): Promise<boolean> {
    return this.setDO(C.DO.COMPRESSOR_INDEX, on)
  }

  /**
   * Controls the internal lights.
   * @param on - True to turn on, false to turn off
   * @returns Promise resolving to true if command succeeded
   */
  static async setLights(on: boolean): Promise<boolean> {
    return this.setDO(C.DO.LIGHTS_INDEX, on)
  }

  /**
   * Controls the fan.
   * @param on - True to turn on, false to turn off
   * @returns Promise resolving to true if command succeeded
   */
  static async setFan(on: boolean): Promise<boolean> {
    return this.setDO(C.DO.FAN, on)
  }

  /**
   * Sets a digital output (DO) on the vending machine.
   * @param index - The DO index
   * @param on - True to turn on, false to turn off
   * @returns Promise resolving to true if command succeeded
   */
  private static async setDO(index: number, on: boolean): Promise<boolean> {
    const command = C.COMMANDS.WRITE_DO
    const data = buildCommandData([index, on ? 1 : 0])

    await SerialService.sendCommand(command, data)

    return this.waitForResponse(command, resp => parseDOStatus(resp, index, on))
  }

  /**
   * Waits for a response matching the specified command and criteria.
   * @param command - The command byte to match in the response
   * @param matcher - A function that processes the response data and returns a result or null if not matched
   * @param timeout - Optional timeout in milliseconds (default is C.TIMEOUT.DEFAULT_MS)
   * @returns A promise that resolves with the matched result or rejects on timeout
   */
  private static waitForResponse<T>(
    command: number,
    matcher: (data: string[]) => T | null,
    timeout = C.TIMEOUT.DEFAULT_MS
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const unsubscribe = SerialService.onData(resp => {
        if (hexToInt(resp[1]) !== command) return

        const result = matcher(resp)

        if (result !== null && result !== undefined) {
          unsubscribe()
          resolve(result)
        }
      })

      setTimeout(() => {
        unsubscribe()
        reject(new Error(`Timeout waiting for response to command ${command}`))
      }, timeout)
    })
  }
}

export default VendingMachineAPI
