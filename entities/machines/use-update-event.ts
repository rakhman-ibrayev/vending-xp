import { useQueryClient } from '@tanstack/react-query'
import { machinesQueries } from './machines.rq'
import { useEventSSE } from '@/lib/sse'

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()

  useEventSSE({
    event: 'update',
    callback: () => {
      console.info('[SSE] Update event received')
      queryClient.invalidateQueries({
        queryKey: machinesQueries.machine().queryKey,
        exact: true
      })
    }
  })
}
