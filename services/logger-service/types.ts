import * as Sentry from '@sentry/react-native'

/**
 * Type for Sentry SeverityLevel and BreadcrumbLevel
 */
export type LogLevel = Sentry.SeverityLevel | Sentry.Breadcrumb['level']

/**
 * Interface for common Sentry options
 */
export interface SentryOptions {
  tags?: Record<string, string>
  contexts?: Record<string, any>
}

/**
 * Serial connection configuration
 */
export interface SerialConfig {
  devicePath: string
  baudRate: number
  dataBits: number
  stopBits: number
  parity: number
}
