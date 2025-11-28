import { updateTelemetry } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'

export function useUpdateTelemetry() {
  return useMutation({
    mutationFn: updateTelemetry
  })
}
