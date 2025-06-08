import React, { useState, useMemo } from 'react'
import MenuItemCard from '@/components/menu/MenuItemCard'
import CategorySidebar from '@/components/menu/CategorySidebar'
import Input from '@/components/ui/Input'
import type { Product, Category } from '@/types'

// Mock data temporal (será reemplazado por API calls)
const mockCategories: Category[] = [
  { id: '1', name: 'Entradas', description: 'Aperitivos y entradas', isActive: true, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Platos Principales', description: 'Especialidades de la casa', isActive: true, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Postres', description: 'Dulces y helados', isActive: true, createdAt: '', updatedAt: '' },
  { id: '4', name: 'Bebidas', description: 'Refrescos y jugos', isActive: true, createdAt: '', updatedAt: '' },
]

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Tostones Dominicanos',
    description: 'Plátanos verdes fritos típicos dominicanos servidos con ajo',
    price: 8.50,
    categoryId: '1',
    category: mockCategories[0],
    isAvailable: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: '2', 
    name: 'Mangú con Huevos',
    description: 'Puré de plátano verde con cebollitas y huevos fritos',
    price: 12.00,
    categoryId: '2',
    category: mockCategories[1],
    isAvailable: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: '3',
    name: 'Pollo Guisado',
    description: 'Pollo criollo guisado con vegetales y especias dominicanas',
    price: 15.50,
    categoryId: '2',
    category: mockCategories[1],
    isAvailable: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: '4',
    name: 'Tres Golpes',
    description: 'Mangú, queso frito y salami - desayuno típico dominicano',
    price: 14.00,
    categoryId: '2',
    category: mockCategories[1],
    isAvailable: false,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: '5',
    name: 'Flan de Coco',
    description: 'Postre tradicional de coco con caramelo',
    price: 6.00,
    categoryId: '3',
    category: mockCategories[2],
    isAvailable: true,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: '6',
    name: 'Morir Soñando',
    description: 'Bebida refrescante de leche evaporada y jugo de china',
    price: 4.50,
    categoryId: '4',
    category: mockCategories[3],
    isAvailable: true,
    createdAt: '',
    updatedAt: ''
  }
]

const MenuPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let products = mockProducts

    // Filtrar por categoría
    if (selectedCategory) {
      products = products.filter(product => product.categoryId === selectedCategory)
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      products = products.filter(product =>
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      )
    }

    return products
  }, [searchTerm, selectedCategory])

  // Contar productos por categoría
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mockProducts.forEach(product => {
      counts[product.categoryId] = (counts[product.categoryId] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-caribbean-50 via-white to-tropical-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-caribbean-500 to-tropical-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
              🇩🇴 Cocina Dominicana Auténtica
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-caribbean-800 via-tropical-700 to-sunset-600 bg-clip-text text-transparent mb-6">
            Nuestro Menú
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Descubre los sabores auténticos de la cocina dominicana en cada plato, 
            preparados con ingredientes frescos y recetas tradicionales
          </p>
          
          {/* Search */}
          <div className="max-w-lg mx-auto">
            <Input
              type="text"
              placeholder="🔍 Buscar platos deliciosos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<span className="text-caribbean-500">🔍</span>}
            />
          </div>
        </div>

              {/* Stats bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border">
            <div className="text-2xl font-bold text-caribbean-800">{mockProducts.length}</div>
            <div className="text-sm text-gray-600">Platos Disponibles</div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="text-2xl font-bold text-tropical-700">{mockCategories.length}</div>
            <div className="text-sm text-gray-600">Categorías</div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="text-2xl font-bold text-sunset-600">4.9⭐</div>
            <div className="text-sm text-gray-600">Calificación</div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="text-2xl font-bold text-coral-600">🇩🇴</div>
            <div className="text-sm text-gray-600">Auténtico</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-8">
              <CategorySidebar
                categories={mockCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                productCounts={productCounts}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="col-span-12 lg:col-span-9">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory 
                    ? mockCategories.find(c => c.id === selectedCategory)?.name 
                    : 'Todos los Platos'
                  }
                </h2>
                <p className="text-gray-600">
                  {selectedCategory 
                    ? mockCategories.find(c => c.id === selectedCategory)?.description
                    : 'Descubre toda nuestra selección culinaria'
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <button className="p-2 border rounded-lg hover:bg-gray-50">
                  <span>⊞</span>
                </button>
                <button className="p-2 border rounded-lg hover:bg-gray-50 bg-caribbean-50 border-caribbean-200">
                  <span>☷</span>
                </button>
              </div>
            </div>
          {filteredProducts.length > 0 ? (
            <>
            {/* Products Grid */}
            <div className="space-y-8">
              {/* Filter Summary */}
              {(searchTerm || selectedCategory) && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                      </span>
                      {searchTerm && <span> para "{searchTerm}"</span>}
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory(null)
                      }}
                      className="text-xs text-gray-500 hover:text-caribbean-600 px-2 py-1 rounded"
                    >
                      Limpiar ✕
                    </button>
                  </div>
                </div>
              )}
              
              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <MenuItemCard
                    key={product.id}
                    product={product}
                    onClick={() => console.log('Product details:', product)}
                  />
                ))}
              </div>
            </div>
            </>
          ) : (
            /* Empty state */
            <div className="text-center py-12">
              <div className="bg-white border rounded-lg p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron platos
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? `No hay resultados para "${searchTerm}"`
                    : 'No hay platos disponibles en esta categoría'
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory(null)
                    }}
                    className="text-caribbean-600 hover:text-caribbean-700 font-medium"
                  >
                    Ver todos los platos
                  </button>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuPage 