import { ordersApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useCancelOrder() {
  return useMutation({
    mutationFn: (id: number) => ordersApi.cancelOrder(id),
  });
}
