import { useQuery } from "@tanstack/react-query";
import { machinesQueries } from "./machines.rq";

export function useMachineProducts(serialNumber: string | null) {
  return useQuery({
    ...machinesQueries.machineProducts(serialNumber || ""),
    enabled: Boolean(serialNumber),
  });
}
