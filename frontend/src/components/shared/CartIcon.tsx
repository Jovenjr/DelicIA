import React from 'react'
import { useCart } from '@/context/CartContext'

interface CartIconProps {
  onClick: () => void
  className?: string
}

const CartIcon: React.FC<CartIconProps> = ({ onClick, className = '' }) => {
  const { items, getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-caribbean-600 transition-colors ${className}`}
      aria-label={`Carrito de compras${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
    >
      {/* Cart Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2 2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4"
        />
      </svg>

      {/* Badge */}
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}

      {/* Pulse effect for new items */}
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-coral-500 rounded-full w-[18px] h-[18px] animate-ping opacity-75"></span>
      )}
    </button>
  )
}

export default CartIcon 