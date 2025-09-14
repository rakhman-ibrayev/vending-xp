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
  created_at: string;
  products: {
    category: string;
    id: number;
    image: string;
    name: string;
    price: number;
    sku: string;
  };
  vending_machines: {
    serial_number: string;
  };
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
}

export interface OrderWithStatus extends Order {
  status: "created" | "paid" | "failed" | "cancelled";
}

export interface OrderWithDetails extends OrderWithStatus {
  created_at: string;
  id: number;
  product_name: string;
  product_price: number;
  slot_index: number;
  machine_command: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export interface OrderCreateRequest {
  slot_index: number;
}

// API function types
export interface MachineApi {
  getMachine: (serialNumber: string) => Promise<ApiResponse<Machine>>;
  createOrder: (
    serialNumber: string,
    data: OrderCreateRequest
  ) => Promise<ApiResponse<Order>>;
  getMachineProducts: (
    serialNumber: string
  ) => Promise<ApiResponse<MachineProduct[]>>;
}

export interface OrdersApi {
  getOrder: (orderId: number) => Promise<ApiResponse<OrderWithDetails>>;
  cancelOrder: (orderId: number) => Promise<ApiResponse<OrderWithStatus>>;
}
