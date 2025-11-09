import { createOrder } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useAddMachineOrder() {
  return useMutation({
    mutationFn: createOrder,
  });
}
