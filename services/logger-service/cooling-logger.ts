import { BaseLogger } from './base-logger'

/**
 * Cooling system logging
 */
export class CoolingLogger extends BaseLogger {
  protected readonly category = 'vending_machine'

  stateChanged(
    previousState: string,
    newState: string,
    currentTemp: number,
    targetTemp: number
  ): void {
    this.breadcrumb('Cooling state changed', 'info', {
      previousState,
      newState,
      currentTemp,
      targetTemp
    })
  }
}
