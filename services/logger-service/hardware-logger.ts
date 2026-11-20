import { BaseLogger } from './base-logger'

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

  vendingStarted(
    slot: number,
    options: Record<string, any>,
    maxWaitMs: number
  ): void {
    this.breadcrumb('Vending product', 'info', { slot, options, maxWaitMs })
  }

  vendingSuccess(slot: number, replyData1: number, replyData2: number): void {
    this.breadcrumb('Product vended successfully', 'info', {
      slot,
      replyData1,
      replyData2
    })
  }

  vendingFailed(
    slot: number,
    faultRow: number,
    faultCol: number,
    options: Record<string, any>
  ): void {
    this.captureMessage(
      'Product vending failed',
      'warning',
      { operation: 'vend_product' },
      { vending: { slot, faultRow, faultCol, options } }
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

  invalidSlot(slot: number, maxSlot: number): void {
    this.captureMessage(
      `Rejected vend for invalid slot ${slot}`,
      'error',
      { operation: 'vend_product' },
      { vending: { slot, maxSlot } }
    )
  }

  replyIgnored(
    slot: number,
    reason: string,
    frame: Record<string, number>
  ): void {
    this.breadcrumb('Motor reply ignored', 'warning', {
      slot,
      reason,
      ...frame
    })
  }

  motorRunCommandFailed(error: Error, slot: number): void {
    this.captureError(
      error,
      'error',
      { operation: 'motor_run_command' },
      { vending: { slot } }
    )
  }
}
