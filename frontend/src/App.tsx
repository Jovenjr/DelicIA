import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { AppProvider } from '@/context/AppContext'

// Páginas existentes
import LoginPage from '@/pages/LoginPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import MenuPage from '@/pages/MenuPage'

// Components de layout
import Header from '@/components/shared/Header'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen">
              <Routes>
                {/* Rutas públicas sin header */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Rutas con header */}
                <Route
                  path="/*"
                  element={
                    <>
                      <Header />
                      <Routes>
                        <Route path="/" element={<MenuPage />} />
                        <Route path="/menu" element={<Navigate to="/" replace />} />
                        
                        {/* Rutas protegidas futuras */}
                        <Route path="/admin" element={
                          <ProtectedRoute roles={['ADMIN']}>
                            <div className="p-8 text-center">
                              <h1 className="text-2xl font-bold">Panel de Administración</h1>
                              <p className="text-gray-600 mt-2">Próximamente...</p>
                            </div>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/kitchen" element={
                          <ProtectedRoute roles={['COOK', 'ADMIN']}>
                            <div className="p-8 text-center">
                              <h1 className="text-2xl font-bold">Panel de Cocina</h1>
                              <p className="text-gray-600 mt-2">Próximamente...</p>
                            </div>
                          </ProtectedRoute>
                        } />
                        
                        {/* 404 para rutas no encontradas */}
                        <Route path="*" element={
                          <div className="p-8 text-center">
                            <h1 className="text-2xl font-bold">Página no encontrada</h1>
                            <p className="text-gray-600 mt-2">La página que buscas no existe.</p>
                          </div>
                        } />
                      </Routes>
                    </>
                  }
                />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  )
}

export default App
