import { failOrder } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'

export function useFailOrder() {
  return useMutation({
    mutationFn: failOrder
  })
}
