import axios from 'axios'
import { logger } from '@/services/logger-service'
import { API_TIMEOUT_MS } from './constants'

// Extend Axios config to include metadata for tracking
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number
      requestId: string
    }
  }
}

let machineSerialNumber: string | null = null

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: API_TIMEOUT_MS
})

// Request interceptor - log all outgoing requests
api.interceptors.request.use(
  config => {
    // Generate unique request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    config.metadata = { startTime: Date.now(), requestId }

    if (machineSerialNumber) {
      config.headers['x-serial-number'] = machineSerialNumber
    } else {
      console.warn('[API] No serial number set for request:', config.url)
    }

    // Log request start
    logger.network.requestStarted(
      config.method?.toUpperCase() || 'UNKNOWN',
      config.url || 'unknown',
      requestId
    )

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - log all responses and errors
api.interceptors.response.use(
  response => {
    // Calculate request duration
    const duration = Date.now() - (response.config.metadata?.startTime || 0)
    const requestId = response.config.metadata?.requestId || 'unknown'

    // Log successful response
    logger.network.requestCompleted(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || 'unknown',
      response.status,
      duration,
      requestId
    )

    return response
  },
  error => {
    const config = error.config
    const duration = config?.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : undefined
    const requestId = config?.metadata?.requestId || 'unknown'
    const method = config?.method?.toUpperCase() || 'UNKNOWN'
    const url = config?.url || 'unknown'

    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      logger.network.requestTimeout(
        method,
        url,
        config?.timeout || API_TIMEOUT_MS,
        requestId
      )
    }
    // Handle network connectivity issues
    else if (error.message === 'Network Error' || !error.response) {
      logger.network.connectivityIssue(url, error.message || 'Network Error')
    }
    // Handle HTTP error responses
    else {
      // Special logging for 401 errors to diagnose authentication issues
      if (error.response?.status === 401) {
        console.error('[API] 401 Unauthorized:', {
          url,
          method,
          duration,
          requestId,
          serialNumberSet: !!machineSerialNumber,
          serialNumber: machineSerialNumber
            ? `${machineSerialNumber.substring(0, 4)}...`
            : 'none'
        })
      }

      logger.network.requestFailed(
        method,
        url,
        error,
        error.response?.status,
        duration,
        requestId
      )
    }

    // Preserve original error handling
    if (error.response?.data) {
      const { message } = error.response.data
      error.response.data = { error: message || 'Request failed' }
    }

    return Promise.reject(error)
  }
)

export const setMachineSerialNumber = (serialNumber: string) => {
  machineSerialNumber = serialNumber
}

export default api
