import { BaseLogger } from './base-logger'

/**
 * Server-Sent Events (SSE) logging
 */
export class SseLogger extends BaseLogger {
  protected readonly category = 'sse'

  connecting(url: string, serialNumber: string): void {
    this.breadcrumb('Connecting to SSE', 'info', { url, serialNumber })
  }

  connected(serialNumber: string): void {
    this.breadcrumb('SSE connection established', 'info', {
      serialNumber,
      timestamp: Date.now()
    })
  }

  closed(serialNumber: string, reason?: string): void {
    this.breadcrumb('SSE connection closed', 'info', {
      serialNumber,
      reason,
      timestamp: Date.now()
    })
  }

  eventReceived(eventType: string, data: any): void {
    // Skip logging ping events to reduce noise
    if (eventType === 'ping') return

    this.breadcrumb(`SSE event: ${eventType}`, 'debug', {
      eventType,
      eventData: data,
      timestamp: Date.now()
    })
  }

  connectionError(error: any, serialNumber: string): void {
    this.captureError(
      error instanceof Error ? error : new Error(JSON.stringify(error)),
      'error',
      { operation: 'sse_connection', serialNumber },
      {
        sse: {
          serialNumber,
          error: error?.message || JSON.stringify(error),
          timestamp: Date.now()
        }
      }
    )
  }

  parseError(rawData: string, error: Error): void {
    this.captureError(
      error,
      'warning',
      { operation: 'sse_parse' },
      {
        sse: { rawData: rawData.substring(0, 500), errorMessage: error.message }
      }
    )
  }

  disconnected(serialNumber?: string): void {
    this.breadcrumb('SSE disconnected', 'info', {
      serialNumber,
      timestamp: Date.now()
    })
  }
}
