import { machineApi } from "@/lib/api";

export const machinesQueries = {
  all: () => ["machines"],

  machine: (serialNumber: string) => ({
    queryKey: [...machinesQueries.all(), serialNumber],
    queryFn: () => machineApi.getMachine(serialNumber),
  }),

  machineProducts: (serialNumber: string) => ({
    queryKey: [...machinesQueries.machine(serialNumber).queryKey, "products"],
    queryFn: () => machineApi.getMachineProducts(serialNumber),
  }),
};
