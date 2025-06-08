// Tipos de usuario y roles
export type UserRole = 'ADMIN' | 'CASHIER' | 'COOK' | 'CUSTOMER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos de menú
export interface Category {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  category?: Category
  isAvailable: boolean
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

// Tipos de pedidos
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  quantity: number
  unitPrice: number
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  customer?: User
  status: OrderStatus
  items: OrderItem[]
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
}

// Tipos de carrito (frontend)
export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  customizations?: Record<string, any>
  notes?: string
  addedAt: string
}

export interface CartSummary {
  subtotal: number
  tax: number
  deliveryFee: number
  discount: number
  total: number
  itemCount: number
}

export interface Cart {
  items: CartItem[]
  total: number
}

// Tipos de autenticación
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Tipos de API
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Tipos de WebSocket
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
}

export interface OrderUpdateMessage extends WebSocketMessage {
  type: 'order:new' | 'order:status' | 'order:ready'
  payload: {
    orderId: string
    order?: Order
    status?: OrderStatus
  }
}

// Tipos de estadísticas (para admin)
export interface DailyStats {
  date: string
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export interface PopularProduct {
  productId: string
  product: Product
  totalSold: number
  revenue: number
}

// Tipos de formularios
export interface CreateProductForm {
  name: string
  description: string
  price: number
  categoryId: string
  isAvailable: boolean
  imageUrl?: string
}

export interface CreateOrderForm {
  items: Array<{
    productId: string
    quantity: number
    notes?: string
  }>
  notes?: string
}

// Tipos de configuración
export interface AppConfig {
  apiUrl: string
  wsUrl: string
  restaurantName: string
  currency: string
  taxRate: number
}

// Tipos de chat/IA
export interface ChatMessage {
  id: string
  content: string
  isBot: boolean
  timestamp: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  isActive: boolean
  createdAt: string
} 