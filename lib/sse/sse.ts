import EventSource from 'react-native-sse'
import { logger } from '@/services/logger-service'
import { SSEEventName } from './types'

const eventHandlers = new Map<SSEEventName, Function[]>()

let eventSource: EventSource | null = null

export const connectSSE = (serialNumber: string) => {
  if (eventSource) return

  const url = `${process.env.EXPO_PUBLIC_API_URL}/vending-machines/sse/${serialNumber}`

  logger.sse.connecting(url, serialNumber)

  eventSource = new EventSource(url, {
    headers: {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  })

  eventSource.addEventListener('open', () => {
    console.info('[SSE] Connected to server')
    logger.sse.connected(serialNumber)
  })

  eventSource.addEventListener('close', () => {
    console.info('[SSE] Connection closed by server')
    logger.sse.closed(serialNumber, 'server_closed')
  })

  eventSource.addEventListener('message', (event: any) => {
    try {
      const data = JSON.parse(event.data)
      const eventType = data.event

      // Log the received event
      logger.sse.eventReceived(eventType, data)

      const handlers = eventHandlers.get(eventType) ?? []
      handlers.forEach(fn => fn(data))
    } catch (error) {
      console.error('[SSE] Failed to parse message:', event.data, error)
      logger.sse.parseError(
        event.data,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  })

  eventSource.addEventListener('error', (event: any) => {
    console.error('[SSE] Error:', event)
    logger.sse.connectionError(event, serialNumber)
  })
}

export const subscribeToEvent = (event: SSEEventName, cb: Function) => {
  const handlers = eventHandlers.get(event) || []
  eventHandlers.set(event, [...handlers, cb])
}

export const unsubscribeFromEvent = (event: SSEEventName) => {
  eventHandlers.delete(event)
}

export const disconnectSSE = () => {
  if (eventSource) {
    eventSource.removeAllEventListeners()
    eventSource.close()
    eventSource = null
    console.info('[SSE] Disconnected from server')
    logger.sse.disconnected()
  }
  eventHandlers.clear()
}
