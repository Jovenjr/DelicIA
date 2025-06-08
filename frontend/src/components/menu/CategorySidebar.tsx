import React from 'react'
import type { Category } from '@/types'

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory?: string | null
  onCategorySelect: (categoryId: string | null) => void
  productCounts?: Record<string, number>
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  productCounts = {}
}) => {
  const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Categorías
      </h2>
      
      <div className="space-y-2">
        {/* All categories option */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
            !selectedCategory
              ? 'bg-caribbean-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="font-medium">Todos los platos</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            !selectedCategory
              ? 'bg-caribbean-500 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {totalProducts}
          </span>
        </button>

        {/* Category list */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
              selectedCategory === category.id
                ? 'bg-caribbean-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div>
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className={`text-sm ${
                  selectedCategory === category.id
                    ? 'text-caribbean-100'
                    : 'text-gray-500'
                }`}>
                  {category.description}
                </div>
              )}
            </div>
            <span className={`text-sm px-2 py-1 rounded-full ${
              selectedCategory === category.id
                ? 'bg-caribbean-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {productCounts[category.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">No hay categorías disponibles</p>
        </div>
      )}
    </div>
  )
}

export default CategorySidebar 