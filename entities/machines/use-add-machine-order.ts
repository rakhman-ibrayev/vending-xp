import { machineApi } from "@/lib/api";
import { OrderCreateRequest } from "@/lib/api/types";
import { useMutation } from "@tanstack/react-query";

export function useAddVendingMachine() {
  return useMutation({
    mutationFn: (params: { serialNumber: string; data: OrderCreateRequest }) =>
      machineApi.createOrder(params.serialNumber, params.data),
  });
}
