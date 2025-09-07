import { ordersApi } from "@/lib/api";
import { OrderUpdateRequest } from "@/lib/api/types";
import { useMutation } from "@tanstack/react-query";

export function useAddVendingMachine() {
  return useMutation({
    mutationFn: (params: { id: number; data: OrderUpdateRequest }) =>
      ordersApi.updateOrder(params.id, params.data),
  });
}
