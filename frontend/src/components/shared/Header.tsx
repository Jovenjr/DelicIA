import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import CartIcon from './CartIcon'
import CartSidebar from './CartSidebar'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-caribbean-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🍽️</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Delicia</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-caribbean-600' 
                    : 'text-gray-700 hover:text-caribbean-600'
                }`}
              >
                Menú
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'text-caribbean-600' 
                      : 'text-gray-700 hover:text-caribbean-600'
                  }`}
                >
                  Admin
                </Link>
              )}
              {user?.role === 'COOK' && (
                <Link
                  to="/kitchen"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/kitchen') 
                      ? 'text-caribbean-600' 
                      : 'text-gray-700 hover:text-caribbean-600'
                  }`}
                >
                  Cocina
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <CartIcon onClick={() => setIsCartOpen(true)} />

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Hola, {user.name}
                  </span>
                  <span className="px-2 py-1 bg-caribbean-100 text-caribbean-800 text-xs rounded-full">
                    {user.role === 'ADMIN' ? 'Admin' : 
                     user.role === 'COOK' ? 'Cocina' : 'Cliente'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-caribbean-600 hover:text-caribbean-700"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  )
}

export default Header 