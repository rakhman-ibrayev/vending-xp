import { useEffect, useRef } from 'react'
import { subscribeToEvent, unsubscribeFromEvent } from './sse'
import type { SSEEventName } from './types'

interface UseEventSSEProps {
  event: SSEEventName
  callback: (data: any) => void
}

export const useEventSSE = ({ event, callback }: UseEventSSEProps) => {
  const callbackRef = useRef(callback)

  callbackRef.current = callback

  useEffect(() => {
    subscribeToEvent(event, callbackRef.current)

    return () => {
      unsubscribeFromEvent(event)
    }
  }, [event])
}
