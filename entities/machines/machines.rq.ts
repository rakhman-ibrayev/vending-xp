import { getMachine, getMachineProducts } from "@/lib/api";

export const machinesQueries = {
  all: () => ["machines"],

  machine: () => ({
    queryKey: [...machinesQueries.all(), "current"],
    queryFn: () => getMachine(),
  }),

  machineProducts: () => ({
    queryKey: [...machinesQueries.machine().queryKey, "products"],
    queryFn: () => getMachineProducts(),
  }),
};
