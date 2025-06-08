import React from 'react'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCheckout?: () => void
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  onCheckout
}) => {
  const {
    items,
    summary,
    isEmpty,
    removeItem,
    updateQuantity,
    clearCart
  } = useCart()

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout()
    } else {
      console.log('Proceeding to checkout...')
    }
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Tu Carrito ({summary.itemCount})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-500 mb-6">
                Agrega algunos platos deliciosos para empezar
              </p>
              <Button variant="primary" onClick={onClose}>
                Explorar Menú
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 bg-gray-50 rounded-lg p-4"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl text-gray-400">🍽️</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatPrice(item.product.price)} c/u
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                              disabled={item.quantity <= 1}
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isEmpty && (
                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Limpiar carrito
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="border-t bg-gray-50 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ITBIS (18%)</span>
                    <span className="font-medium">{formatPrice(summary.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span className="font-medium">
                      {summary.deliveryFee === 0 ? 'Gratis' : formatPrice(summary.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                    <span>Total</span>
                    <span>{formatPrice(summary.total)}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleCheckout}
                  className="mt-6"
                >
                  Proceder al Checkout
                </Button>

                {summary.deliveryFee === 0 && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    🎉 ¡Envío gratis por compras mayores a $1,000!
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CartSidebar 