import { useQuery } from '@tanstack/react-query'
import { ordersQueries } from './order.rq'

export function useOrder(id: number, refetchInterval?: number | false) {
  return useQuery({
    ...ordersQueries.order(id),
    refetchInterval
  })
}
