import api from './api'
import {
  ApiResponse,
  Machine,
  MachineProduct,
  Order,
  OrderCreateRequest,
  OrderWithDetails,
  OrderWithStatus
} from './types'

export const getMachine = () =>
  api.get(`/vending-machines`) as Promise<ApiResponse<Machine[]>>

export const createOrder = (data: OrderCreateRequest) =>
  api.post(`/vending-machines/orders`, data) as Promise<ApiResponse<Order>>

export const getMachineProducts = () =>
  api.get(`/vending-machines/products`) as Promise<
    ApiResponse<MachineProduct[]>
  >

export const getOrder = (orderId: number) =>
  api.get(`/vending-machines/orders/${orderId}`) as Promise<
    ApiResponse<OrderWithDetails>
  >

export const cancelOrder = (orderId: number) =>
  api.patch(`/vending-machines/orders/${orderId}/cancel`) as Promise<
    ApiResponse<OrderWithStatus>
  >
