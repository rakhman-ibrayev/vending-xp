import { getMachine, getMachineProducts } from '@/lib/api'
import VendingMachineAPI from '@/services/vending-machine'

export const machinesQueries = {
  all: () => ['machines'],

  machine: () => ({
    queryKey: [...machinesQueries.all(), 'current'],
    queryFn: async () => {
      const res = await getMachine()

      // Lets the hardware layer reject slots beyond the machine's configured count.
      VendingMachineAPI.setSlotCount(res.data.data?.num_slots)

      return res
    }
  }),

  machineProducts: () => ({
    queryKey: [...machinesQueries.machine().queryKey, 'products'],
    queryFn: getMachineProducts
  })
}
