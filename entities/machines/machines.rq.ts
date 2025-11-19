import { getMachine, getMachineProducts } from '@/lib/api'
import VendingMachineAPI from '@/services/vending-machine'

export const machinesQueries = {
  all: () => ['machines'],

  machine: () => ({
    queryKey: [...machinesQueries.all(), 'current'],
    queryFn: async () => {
      const res = await getMachine()
      const targetTemperature = res.data.data?.target_temperature

      if (typeof targetTemperature === 'number') {
        VendingMachineAPI.setTargetTemperature(targetTemperature)
      }

      return res
    }
  }),

  machineProducts: () => ({
    queryKey: [...machinesQueries.machine().queryKey, 'products'],
    queryFn: getMachineProducts
  })
}
