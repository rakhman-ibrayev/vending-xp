import EventSource from 'react-native-sse'
import { SSEEventName } from './types'

const eventHandlers = new Map<SSEEventName, Function[]>()

let eventSource: EventSource | null = null

export const connectSSE = (serialNumber: string) => {
  if (eventSource) return

  eventSource = new EventSource(
    `${process.env.EXPO_PUBLIC_API_URL}/vending-machines/sse/${serialNumber}`,
    {
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    }
  )

  eventSource.addEventListener('open', () => {
    console.info('[SSE] Connected to server')
  })

  eventSource.addEventListener('close', () => {
    console.info('[SSE] Connection closed by server')
  })

  eventSource.addEventListener('message', (event: any) => {
    try {
      const data = JSON.parse(event.data)
      const eventType = data.event
      const handlers = eventHandlers.get(eventType) ?? []

      handlers.forEach(fn => fn(data))
    } catch (error) {
      console.error('[SSE] Failed to parse message:', event.data, error)
    }
  })

  eventSource.addEventListener('error', (event: any) => {
    console.error('[SSE] Error:', event)
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
  }
  eventHandlers.clear()
}
