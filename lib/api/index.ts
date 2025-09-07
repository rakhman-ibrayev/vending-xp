import api from "./api";
import {
  ApiResponse,
  Machine,
  MachineProduct,
  Order,
  OrderCreateRequest,
  OrderUpdateRequest,
  OrderWithDetails,
} from "./types";

// Machine API
export const machineApi = {
  // Get machine by serial number
  getMachine: (serialNumber: string): Promise<ApiResponse<Machine>> =>
    api.get(`/machines/${serialNumber}`),

  // Create new order for machine
  createOrder: (
    serialNumber: string,
    data: OrderCreateRequest
  ): Promise<ApiResponse<Order>> =>
    api.post(`/machines/${serialNumber}/orders`, data),

  // Get machine products
  getMachineProducts: (
    serialNumber: string
  ): Promise<ApiResponse<MachineProduct[]>> =>
    api.get(`/machines/${serialNumber}/products`),
};

// Orders API
export const ordersApi = {
  // Get order by ID
  getOrder: (orderId: number): Promise<ApiResponse<OrderWithDetails>> =>
    api.get(`/orders/${orderId}`),

  // Update order
  updateOrder: (
    orderId: number,
    data: OrderUpdateRequest
  ): Promise<ApiResponse<Order>> => api.patch(`/orders/${orderId}`, data),
};
