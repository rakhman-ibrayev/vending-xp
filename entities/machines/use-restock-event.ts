import { useQueryClient } from '@tanstack/react-query'
import { machinesQueries } from './machines.rq'
import { useEventSSE } from '@/lib/sse'

export const useRestockEvent = () => {
  const queryClient = useQueryClient()

  useEventSSE({
    event: 'restock',
    callback: () => {
      console.info('[SSE] Restock event received')
      queryClient.invalidateQueries({
        queryKey: machinesQueries.machineProducts().queryKey,
        exact: true
      })
    }
  })
}
