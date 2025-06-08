import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, Product, CartSummary, OrderStatus } from '@/types'

// Tipos del estado del carrito
interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  summary: CartSummary
}

// Tipos de acciones
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; customizations?: Record<string, any> } }
  | { type: 'REMOVE_ITEM'; payload: string } // productId
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'UPDATE_CUSTOMIZATIONS'; payload: { productId: string; customizations: Record<string, any> } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESTORE_CART'; payload: CartItem[] }

// Tipos del contexto
interface CartContextType {
  // Estado
  items: CartItem[]
  itemCount: number
  totalAmount: number
  summary: CartSummary
  isLoading: boolean
  error: string | null
  isEmpty: boolean
  
  // Funciones
  addItem: (product: Product, quantity: number, customizations?: Record<string, any>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateCustomizations: (productId: string, customizations: Record<string, any>) => void
  clearCart: () => void
  getItem: (productId: string) => CartItem | undefined
  hasItem: (productId: string) => boolean
  getTotalItems: () => number
  calculateSummary: () => CartSummary
}

// Función para calcular el resumen del carrito
const calculateCartSummary = (items: CartItem[]): CartSummary => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity
    const customizationsTotal = Object.values(item.customizations || {})
      .reduce((custSum, customization: unknown) => {
        if (typeof customization === 'object' && customization !== null && 'price' in customization) {
          const price = (customization as { price: number }).price
          return custSum + price
        }
        return custSum
      }, 0) * item.quantity
    
    return sum + itemTotal + customizationsTotal
  }, 0)

  const tax = subtotal * 0.18 // 18% ITBIS en República Dominicana
  const deliveryFee = subtotal > 1000 ? 0 : 150 // Envío gratis por compras mayores a $1000
  const total = subtotal + tax + deliveryFee

  return {
    subtotal,
    tax,
    deliveryFee,
    discount: 0, // Para futuras promociones
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  }
}

// Estado inicial
const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
  summary: {
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    itemCount: 0
  }
}

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[]
  
  switch (action.type) {
    case 'ADD_ITEM':
      const { product, quantity, customizations } = action.payload
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && 
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
      )

      if (existingItemIndex >= 0) {
        // Actualizar cantidad si el item ya existe con las mismas customizaciones
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Agregar nuevo item
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          customizations: customizations || {},
          addedAt: new Date().toISOString()
        }
        newItems = [...state.items, newItem]
      }

      return {
        ...state,
        items: newItems,
        summary: calculateCartSummary(newItems),
        error: null
      }

    case 'REMOVE_ITEM':
      newItems = state.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        summary: calculateCartSummary(newItems)
      }

    case 'UPDATE_QUANTITY':
      const { productId, quantity: newQuantity } = action.payload
      if (newQuantity <= 0) {
        newItems = state.items.filter(item => item.id !== productId)
      } else {
        newItems = state.items.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      }
      return {
        ...state,
        items: newItems,
        summary: calculateCartSummary(newItems)
      }

    case 'UPDATE_CUSTOMIZATIONS':
      newItems = state.items.map(item =>
        item.id === action.payload.productId
          ? { ...item, customizations: action.payload.customizations }
          : item
      )
      return {
        ...state,
        items: newItems,
        summary: calculateCartSummary(newItems)
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        summary: calculateCartSummary([])
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }

    case 'RESTORE_CART':
      return {
        ...state,
        items: action.payload,
        summary: calculateCartSummary(action.payload)
      }

    default:
      return state
  }
}

// Crear contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

// Hook para usar el contexto
export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider')
  }
  return context
}

// Props del provider
interface CartProviderProps {
  children: ReactNode
}

// Provider del contexto
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const loadStoredCart = () => {
      try {
        const storedCart = localStorage.getItem('delicia_cart')
        if (storedCart) {
          const items: CartItem[] = JSON.parse(storedCart)
          dispatch({ type: 'RESTORE_CART', payload: items })
        }
      } catch (error) {
        console.error('Error loading stored cart:', error)
        localStorage.removeItem('delicia_cart')
      }
    }

    loadStoredCart()
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('delicia_cart', JSON.stringify(state.items))
    } else {
      localStorage.removeItem('delicia_cart')
    }
  }, [state.items])

  // Función para agregar item
  const addItem = (product: Product, quantity: number, customizations?: Record<string, any>): void => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { product, quantity, customizations }
    })
  }

  // Función para remover item
  const removeItem = (productId: string): void => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  // Función para actualizar cantidad
  const updateQuantity = (productId: string, quantity: number): void => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { productId, quantity }
    })
  }

  // Función para actualizar customizaciones
  const updateCustomizations = (productId: string, customizations: Record<string, any>): void => {
    dispatch({
      type: 'UPDATE_CUSTOMIZATIONS',
      payload: { productId, customizations }
    })
  }

  // Función para limpiar carrito
  const clearCart = (): void => {
    dispatch({ type: 'CLEAR_CART' })
  }

  // Función para obtener un item específico
  const getItem = (productId: string): CartItem | undefined => {
    return state.items.find(item => item.id === productId)
  }

  // Función para verificar si existe un item
  const hasItem = (productId: string): boolean => {
    return state.items.some(item => item.product.id === productId)
  }

  // Función para calcular resumen (wrapper)
  const getTotalItems = (): number => {
    return state.summary.itemCount
  }

  const calculateSummary = (): CartSummary => {
    return calculateCartSummary(state.items)
  }

  // Valores computados
  const itemCount = state.summary.itemCount
  const totalAmount = state.summary.total
  const isEmpty = state.items.length === 0

  // Valor del contexto
  const contextValue: CartContextType = {
    // Estado
    items: state.items,
    itemCount,
    totalAmount,
    summary: state.summary,
    isLoading: state.isLoading,
    error: state.error,
    isEmpty,
    
    // Funciones
    addItem,
    removeItem,
    updateQuantity,
    updateCustomizations,
    clearCart,
    getItem,
    hasItem,
    getTotalItems,
    calculateSummary,
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext 