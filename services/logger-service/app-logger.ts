import { BaseLogger } from './base-logger'

/**
 * Generic application logging
 */
export class AppLogger extends BaseLogger {
  protected readonly category = 'app'

  info(message: string, data?: Record<string, any>): void {
    this.breadcrumb(message, 'info', data)
  }

  warning(message: string, data?: Record<string, any>): void {
    this.breadcrumb(message, 'warning', data)
  }

  debug(message: string, data?: Record<string, any>): void {
    this.breadcrumb(message, 'debug', data)
  }

  error(error: Error, context?: Record<string, any>): void {
    this.captureError(
      error,
      'error',
      undefined,
      context ? { custom: context } : undefined
    )
  }
}
