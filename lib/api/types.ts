// Machine types
export interface Machine {
  id: number
  serial_number: string
  name: string | null
  location: string | null
  description: string | null
  status: 'online' | 'offline'
  temperature: number | null
  last_seen: string | null
  target_temperature: number
  num_slots: number
  device_path: string
  baud_rate: number
  data_bits: number
  parity: number
  stop_bits: number
  latitude: number | null
  longitude: number | null
  technician_password: string | null
  created_at: string
}

export interface MachineProduct {
  id: number
  slot_index: number
  current_stock: number
  max_capacity: number
  last_restocked: string | null
  created_at: string
  products: {
    id: number
    name: string
    price: number
    sku: string
    image: string | null
    category: string | null
  } | null
}

export interface Product {
  id: number
  name: string | null
  price: number
  sku: string
  image: string | null
  category: string | null
  created_at: string
}

export interface MachineWithProducts extends Machine {
  machine_products: (MachineProduct & {
    products: Product | null
  })[]
}

// Order types
export interface Order {
  id: number
}

export interface OrderWithStatus extends Order {
  status: 'created' | 'paid' | 'failed' | 'cancelled'
}

export interface OrderWithDetails extends OrderWithStatus {
  created_at: string
  slot_index: number | null
  product_name: string | null
  product_price: number | null
  machine_command: string | null
  qr_link: string
}

export interface OrderCreateRequest {
  slot_index: number
}

// API Response types - matches vending-admin response format
export interface ApiResponse<T = any> {
  data: {
    success: boolean
    message?: string
    data?: T
  }
}
