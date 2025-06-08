import React from 'react'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'

interface MenuItemCardProps {
  product: Product
  onClick?: () => void
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ product, onClick }) => {
  const { addItem, hasItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(product, 1)
  }

  const isInCart = hasItem(product.id)

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden rounded-t-lg">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl text-gray-400">🍽️</span>
          </div>
        )}
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isAvailable 
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {product.isAvailable ? 'Disponible' : 'Agotado'}
          </span>
        </div>

        {/* In cart indicator */}
        {isInCart && (
          <div className="absolute top-3 left-3">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              En carrito
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Price and category */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
          {product.category && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Actions */}
        <Button
          variant={isInCart ? "secondary" : "primary"}
          size="sm"
          onClick={handleAddToCart}
          disabled={!product.isAvailable}
          fullWidth
        >
          {isInCart ? 'En carrito' : 'Agregar'}
        </Button>
      </div>
    </div>
  )
}

export default MenuItemCard 