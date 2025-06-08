import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { ApiResponse, PaginatedResponse, LoginCredentials, AuthResponse, User, Product, Order, CreateOrderForm } from '@/types'

// Configuración base de axios
const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Interceptor para agregar token de autenticación
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('delicia_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Interceptor para manejo global de respuestas y errores
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error: AxiosError) => {
      // Manejo global de errores
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('delicia_token')
        localStorage.removeItem('delicia_user')
        window.location.href = '/login'
      }
      
      // Log de errores para debugging
      console.error('API Error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
        url: error.config?.url,
      })
      
      return Promise.reject(error)
    }
  )

  return instance
}

// Instancia principal de la API
let apiInstance: AxiosInstance

// Función para inicializar la API con configuración
export const initializeApi = (baseURL: string): void => {
  apiInstance = createApiInstance(baseURL)
}

// Función para obtener la instancia actual
export const getApiInstance = (): AxiosInstance => {
  if (!apiInstance) {
    // Fallback URL si no se ha inicializado
    apiInstance = createApiInstance('http://localhost:3001/api')
  }
  return apiInstance
}

// Funciones de utilidad para manejo de errores
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.response?.statusText) {
      return error.response.statusText
    }
    if (error.message) {
      return error.message
    }
  }
  return 'Error desconocido'
}

// Función genérica para peticiones GET
export const apiGet = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  try {
    const response = await getApiInstance().get<ApiResponse<T>>(endpoint)
    return response.data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Función genérica para peticiones POST
export const apiPost = async <T, D = any>(endpoint: string, data?: D): Promise<ApiResponse<T>> => {
  try {
    const response = await getApiInstance().post<ApiResponse<T>>(endpoint, data)
    return response.data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Función genérica para peticiones PUT
export const apiPut = async <T, D = any>(endpoint: string, data?: D): Promise<ApiResponse<T>> => {
  try {
    const response = await getApiInstance().put<ApiResponse<T>>(endpoint, data)
    return response.data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Función genérica para peticiones DELETE
export const apiDelete = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  try {
    const response = await getApiInstance().delete<ApiResponse<T>>(endpoint)
    return response.data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Función para peticiones con paginación
export const apiGetPaginated = async <T>(
  endpoint: string, 
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse<T>> => {
  try {
    const response = await getApiInstance().get<PaginatedResponse<T>>(
      `${endpoint}?page=${page}&limit=${limit}`
    )
    return response.data
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// === SERVICIOS ESPECÍFICOS ===

// Servicio de Autenticación
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiPost<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  me: async (): Promise<User> => {
    const response = await apiGet<User>('/auth/me')
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiPost('/auth/logout')
  },
}

// Servicio de Productos
export const productsService = {
  getAll: async (page?: number, limit?: number): Promise<PaginatedResponse<Product>> => {
    if (page && limit) {
      return await apiGetPaginated<Product>('/products', page, limit)
    }
    const response = await apiGet<Product[]>('/products')
    return {
      data: response.data,
      meta: {
        total: response.data.length,
        page: 1,
        limit: response.data.length,
        totalPages: 1
      }
    }
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiGet<Product>(`/products/${id}`)
    return response.data
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    const response = await apiGet<Product[]>(`/products/category/${categoryId}`)
    return response.data
  },
}

// Servicio de Pedidos
export const ordersService = {
  create: async (orderData: CreateOrderForm): Promise<Order> => {
    const response = await apiPost<Order>('/orders', orderData)
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiGet<Order>(`/orders/${id}`)
    return response.data
  },

  getMyOrders: async (page?: number, limit?: number): Promise<PaginatedResponse<Order>> => {
    return await apiGetPaginated<Order>('/orders/my', page, limit)
  },

  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiPut<Order>(`/orders/${id}/status`, { status })
    return response.data
  },
}

// Servicio de Categorías
export const categoriesService = {
  getAll: async (): Promise<any[]> => {
    const response = await apiGet<any[]>('/categories')
    return response.data
  },
}

// Servicio de Chat/IA
export const chatService = {
  sendMessage: async (message: string, sessionId?: string): Promise<any> => {
    const response = await apiPost('/ai/chat', { message, sessionId })
    return response.data
  },
}

// Función para verificar el estado de la API
export const healthCheck = async (): Promise<boolean> => {
  try {
    await getApiInstance().get('/health')
    return true
  } catch {
    return false
  }
}

export default {
  initializeApi,
  getApiInstance,
  handleApiError,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiGetPaginated,
  authService,
  productsService,
  ordersService,
  categoriesService,
  chatService,
  healthCheck,
} 