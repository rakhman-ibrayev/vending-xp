import api from "./api";
import { MachineApi, OrdersApi } from "./types";

// Machine API
export const machineApi: MachineApi = {
  // Get machine by serial number
  getMachine: (serialNumber) => api.get(`/machines/${serialNumber}`),

  // Create new order for machine
  createOrder: (serialNumber, data) =>
    api.post(`/machines/${serialNumber}/orders`, data),

  // Get machine products
  getMachineProducts: (serialNumber) =>
    api.get(`/machines/${serialNumber}/products`),
};

// Orders API
export const ordersApi: OrdersApi = {
  // Get order by ID
  getOrder: (orderId) => api.get(`/orders/${orderId}`),

  // Update order
  cancelOrder: (orderId) => api.patch(`/orders/${orderId}/cancel`),
};
