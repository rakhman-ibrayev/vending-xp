import { useEffect } from 'react'
import { connectSSE, disconnectSSE } from './sse'

interface UseConnectSSEProps {
  serialNumber: string | null
}

export const useConnectSSE = ({ serialNumber }: UseConnectSSEProps) => {
  useEffect(() => {
    if (serialNumber) connectSSE(serialNumber)

    return () => {
      if (serialNumber) disconnectSSE()
    }
  }, [serialNumber])
}
