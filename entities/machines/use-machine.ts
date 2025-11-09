import { useQuery } from "@tanstack/react-query";
import { machinesQueries } from "./machines.rq";

export function useMachine(serialNumber: string | null) {
  return useQuery({
    ...machinesQueries.machine(),
    enabled: Boolean(serialNumber),
  });
}
