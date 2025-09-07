// types/api.ts

// Machine types
export interface Machine {
  id: number;
  serial_number: string;
  name: string | null;
  location: string | null;
  description: string | null;
  status: "online" | "offline";
  temperature: number | null;
  last_seen: string | null;
  target_temperature: number;
  num_slots: number;
  device_path: string;
  baud_rate: number;
  data_bits: number;
  parity: number;
  stop_bits: number;
  latitude: number | null;
  longitude: number | null;
  technician_password: string | null;
  created_at: string;
}

export interface MachineProduct {
  id: number;
  slot_index: number;
  current_stock: number;
  max_capacity: number;
  last_restocked: string | null;
  product_id: number | null;
  machine_id: number | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string | null;
  price: number;
  sku: string;
  image: string | null;
  category: string | null;
  created_at: string;
}

export interface MachineWithProducts extends Machine {
  machine_products: (MachineProduct & {
    products: Product | null;
  })[];
}

// Order types
export interface Order {
  id: number;
  status: "created" | "paid" | "failed";
  created_at: string;
  machine_id: number | null;
  machine_product_id: number | null;
  kaspi_txn_id: string | null;
  kaspi_txn_date: string | null;
  payment_amount: number | null;
}

export interface OrderWithDetails extends Order {
  machine_products?: {
    slot_index: number;
    products: {
      name: string | null;
      price: number;
    } | null;
  } | null;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export interface OrderCreateRequest {
  slot_index: number;
}

export interface OrderUpdateRequest {
  status?: "created" | "paid" | "failed";
  payment_amount?: number;
  kaspi_txn_id?: string;
  kaspi_txn_date?: string;
}

// API function types
export interface MachineApi {
  getMachine: (serialNumber: string) => Promise<ApiResponse<Machine>>;
  createOrder: (
    machineId: number,
    data: OrderCreateRequest
  ) => Promise<ApiResponse<Order>>;
  getMachineProducts: (
    machineId: number
  ) => Promise<ApiResponse<MachineProduct[]>>;
}

export interface OrdersApi {
  getOrder: (orderId: number) => Promise<ApiResponse<OrderWithDetails>>;
  updateOrder: (
    orderId: number,
    data: OrderUpdateRequest
  ) => Promise<ApiResponse<Order>>;
}
