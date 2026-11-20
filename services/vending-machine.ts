import SerialService, { type XPFrame } from './serial-service'
import { COMMANDS, OPTION_DEFAULTS, TIMEOUT, XP } from './constants'
import { slotToMotor } from './xp-frame'
import { logger } from './logger-service'

export interface InitializationSettings {
  devicePath?: string
  baudRate?: number
  dataBits?: number
  stopBits?: number
  parity?: 0 | 1 | 2
}

class VendingMachineAPI {
  private static isInitialized = false
  private static initPromise: Promise<boolean> | null = null
  private static consumers = 0
  private static slotCount: number | null = null
  // Serializes vends so only one command/reply exchange is in flight at a time.
  private static vendQueue: Promise<unknown> = Promise.resolve()

  static init(settings: InitializationSettings = {}): Promise<boolean> {
    if (this.isInitialized) return Promise.resolve(true)
    // Concurrent callers (several hooks mount at once) share one open attempt.
    if (!this.initPromise) {
      this.initPromise = this.connect(settings).finally(() => {
        this.initPromise = null
      })
    }
    return this.initPromise
  }

  private static async connect({
    devicePath = OPTION_DEFAULTS.DEVICE_PATH,
    baudRate = OPTION_DEFAULTS.BAUD_RATE,
    dataBits = OPTION_DEFAULTS.DATA_BITS,
    stopBits = OPTION_DEFAULTS.STOP_BITS,
    parity = OPTION_DEFAULTS.PARITY
  }: InitializationSettings): Promise<boolean> {
    logger.hardware.initializing({ devicePath, baudRate })

    const connected = await SerialService.connect({
      devicePath,
      baudRate,
      dataBits,
      stopBits,
      parity
    })

    // A release() that dropped consumers to zero while we were opening wins.
    if (connected && this.consumers === 0) {
      SerialService.disconnect()
      return false
    }

    if (connected) {
      this.isInitialized = true
      logger.hardware.initialized()
    } else {
      logger.hardware.initializationFailed()
    }

    return connected
  }

  /** Registers a consumer of the serial port (e.g. a mounted hook). */
  static acquire() {
    this.consumers++
  }

  /** Releases a consumer; the port is closed when the last one is gone. */
  static release() {
    this.consumers = Math.max(0, this.consumers - 1)
    if (this.consumers === 0) this.close()
  }

  static close() {
    this.isInitialized = false
    SerialService.disconnect()
  }

  /** Machine's configured slot count (vending_machines.num_slots), if known. */
  static setSlotCount(numSlots: number | null | undefined) {
    this.slotCount =
      typeof numSlots === 'number' && Number.isInteger(numSlots) && numSlots > 0
        ? numSlots
        : null
  }

  // slotIndex is 1-based (same as DB slot_index). Mapped to row/col with 10 columns per row.
  static vendProduct(slotIndex: number): Promise<{ success: boolean }> {
    const run = this.vendQueue.then(() => this.vendNow(slotIndex))
    this.vendQueue = run.catch(() => undefined)
    return run
  }

  private static vendNow(slotIndex: number): Promise<{ success: boolean }> {
    const maxSlot = Math.min(this.slotCount ?? XP.MAX_SLOTS, XP.MAX_SLOTS)
    const motor = slotIndex <= maxSlot ? slotToMotor(slotIndex) : null

    if (!motor) {
      logger.hardware.invalidSlot(slotIndex, maxSlot)
      return Promise.resolve({ success: false })
    }

    const { row, col } = motor
    logger.hardware.vendingStarted(slotIndex, { row, col }, TIMEOUT.RESPONSE_MS)

    return new Promise(resolve => {
      let settled = false
      let timeoutId: ReturnType<typeof setTimeout> | undefined

      const finish = (result: { success: boolean }) => {
        settled = true
        if (timeoutId) clearTimeout(timeoutId)
        unsubscribe()
        resolve(result)
      }

      const unsubscribe = SerialService.onData((frame: XPFrame) => {
        if (settled) return

        if (frame.cmd === COMMANDS.MOTOR_RUN) {
          // Only a success for *this* motor counts; a stale reply must not
          // complete the current order.
          if (frame.data1 !== row || frame.data2 !== col) {
            logger.hardware.replyIgnored(slotIndex, 'row/col mismatch', {
              ...frame
            })
            return
          }
          logger.hardware.vendingSuccess(slotIndex, frame.data1, frame.data2)
          finish({ success: true })
        } else if (frame.cmd === COMMANDS.MOTOR_ERROR) {
          // Only one vend is in flight, so any motor error fails it.
          if (frame.data1 !== row || frame.data2 !== col) {
            logger.hardware.replyIgnored(
              slotIndex,
              'fault row/col mismatch (treated as failure)',
              {
                ...frame
              }
            )
          }
          logger.hardware.vendingFailed(slotIndex, frame.data1, frame.data2, {
            row,
            col
          })
          finish({ success: false })
        }
      })

      timeoutId = setTimeout(() => {
        if (settled) return
        logger.hardware.vendingTimeout(slotIndex, TIMEOUT.RESPONSE_MS, {
          row,
          col
        })
        finish({ success: false })
      }, TIMEOUT.RESPONSE_MS)

      SerialService.sendCommand(COMMANDS.MOTOR_RUN, row, col)
        .then(sent => {
          if (settled || sent) return
          logger.hardware.motorRunCommandFailed(
            new Error('Serial write returned false'),
            slotIndex
          )
          finish({ success: false })
        })
        .catch(error => {
          if (settled) return
          logger.hardware.motorRunCommandFailed(
            error instanceof Error ? error : new Error(String(error)),
            slotIndex
          )
          finish({ success: false })
        })
    })
  }
}

export default VendingMachineAPI
