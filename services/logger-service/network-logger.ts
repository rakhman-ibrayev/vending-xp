import { BaseLogger } from './base-logger'

/**
 * Network request logging
 */
export class NetworkLogger extends BaseLogger {
  protected readonly category = 'network'

  requestStarted(method: string, url: string, requestId: string): void {
    this.breadcrumb(`${method.toUpperCase()} ${url}`, 'debug', {
      method,
      url,
      requestId,
      timestamp: Date.now()
    })
  }

  requestCompleted(
    method: string,
    url: string,
    status: number,
    duration: number,
    requestId: string
  ): void {
    this.breadcrumb(`${method.toUpperCase()} ${url} - ${status}`, 'info', {
      method,
      url,
      status,
      duration,
      requestId
    })
  }

  requestFailed(
    method: string,
    url: string,
    error: Error,
    status?: number,
    duration?: number,
    requestId?: string
  ): void {
    this.captureError(
      error,
      'error',
      {
        operation: 'api_request',
        method,
        status: status?.toString() || 'unknown'
      },
      {
        network: {
          url,
          method,
          status,
          duration,
          requestId,
          errorMessage: error.message
        }
      }
    )
  }

  requestTimeout(
    method: string,
    url: string,
    timeout: number,
    requestId: string
  ): void {
    this.captureMessage(
      'API request timeout',
      'error',
      { operation: 'api_timeout', method },
      { network: { url, method, timeout, requestId } }
    )
  }

  connectivityIssue(url: string, error: string): void {
    this.captureMessage(
      'Network connectivity issue',
      'warning',
      { operation: 'network_connectivity' },
      { network: { url, error } }
    )
  }
}
