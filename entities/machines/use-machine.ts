import { useQuery } from '@tanstack/react-query'
import { machinesQueries } from './machines.rq'
import { useVendingMachine } from './use-vending-machine'

export function useMachine() {
  const { serialNumber } = useVendingMachine()

  return useQuery({
    ...machinesQueries.machine(),
    enabled: Boolean(serialNumber)
  })
}
