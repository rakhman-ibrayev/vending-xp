import * as Sentry from '@sentry/react-native'
import type { LogLevel } from './types'

/**
 * Base logger class - all Sentry calls happen here only
 */
export abstract class BaseLogger {
  protected abstract readonly category: string

  protected breadcrumb(
    message: string,
    level: LogLevel = 'info',
    data?: Record<string, any>
  ): void {
    Sentry.addBreadcrumb({
      category: this.category,
      message,
      level: level as Sentry.Breadcrumb['level'],
      data
    })
  }

  protected captureError(
    error: Error,
    level: Sentry.SeverityLevel = 'error',
    tags?: Record<string, string>,
    contexts?: Record<string, any>
  ): void {
    const mergedTags = { ...tags, category: this.category }
    Sentry.captureException(error, { level, tags: mergedTags, contexts })
  }

  protected captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    tags?: Record<string, string>,
    contexts?: Record<string, any>
  ): void {
    const mergedTags = { ...tags, category: this.category }
    Sentry.captureMessage(message, { level, tags: mergedTags, contexts })
  }
}
