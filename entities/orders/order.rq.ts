import { getOrder } from "@/lib/api";

export const ordersQueries = {
  all: () => ["orders"],

  order: (id: number) => ({
    queryKey: [...ordersQueries.all(), id],
    queryFn: () => getOrder(id),
  }),
};
