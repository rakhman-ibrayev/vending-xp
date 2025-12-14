import { SerialLogger } from './serial-logger'
import { HardwareLogger } from './hardware-logger'
import { CoolingLogger } from './cooling-logger'
import { NetworkLogger } from './network-logger'
import { SseLogger } from './sse-logger'
import { AppLogger } from './app-logger'

/**
 * Centralized logging abstraction using Sentry.
 * Provides domain-specific loggers for different parts of the application.
 *
 * Usage:
 *   import { logger } from '@/services/logger-service'
 *   logger.serial.connected(config)
 *   logger.hardware.vendingStarted(slot, options, maxWaitMs)
 *   logger.app.info('App started')
 */
export const logger = {
  serial: new SerialLogger(),
  hardware: new HardwareLogger(),
  cooling: new CoolingLogger(),
  network: new NetworkLogger(),
  sse: new SseLogger(),
  app: new AppLogger()
}
