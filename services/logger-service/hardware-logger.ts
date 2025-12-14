import { BaseLogger } from './base-logger'

/**
 * Hardware operations logging
 */
export class HardwareLogger extends BaseLogger {
  protected readonly category = 'vending_machine'

  initializing(config: { devicePath: string; baudRate: number }): void {
    this.breadcrumb('Initializing vending machine', 'info', config)
  }

  initialized(): void {
    this.breadcrumb('Vending machine initialized successfully', 'info')
  }

  initializationFailed(): void {
    this.captureMessage('Failed to initialize vending machine', 'error', {
      operation: 'init'
    })
  }

  temperatureRead(temperature: number): void {
    this.breadcrumb('Temperature read', 'debug', { temperature })
  }

  temperatureReadError(error: Error): void {
    this.captureError(error, 'warning', { operation: 'get_temperature' })
  }

  vendingStarted(
    slot: number,
    options: Record<string, any>,
    maxWaitMs: number
  ): void {
    this.breadcrumb('Vending product', 'info', { slot, options, maxWaitMs })
  }

  vendingSuccess(slot: number, z3: number, z10: number): void {
    this.breadcrumb('Product vended successfully', 'info', { slot, z3, z10 })
  }

  vendingFailed(
    slot: number,
    z3: number,
    z10: number,
    options: Record<string, any>
  ): void {
    this.captureMessage(
      'Product vending failed',
      'warning',
      { operation: 'vend_product' },
      { vending: { slot, z3, z10, options } }
    )
  }

  vendingTimeout(
    slot: number,
    maxWaitMs: number,
    options: Record<string, any>
  ): void {
    this.captureMessage(
      'Product vending timeout',
      'error',
      { operation: 'vend_product' },
      { vending: { slot, maxWaitMs, options } }
    )
  }

  doStateChanged(doName: string, state: boolean, index: number): void {
    this.breadcrumb(`Setting ${doName} ${state ? 'ON' : 'OFF'}`, 'debug', {
      index,
      on: state,
      doName
    })
  }

  doError(error: Error, doName: string, index: number, state: boolean): void {
    this.captureError(
      error,
      'warning',
      { operation: 'set_do' },
      {
        hardware: { doName, index, state: state ? 'ON' : 'OFF' }
      }
    )
  }
}
