import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-caribbean-50 to-tropical-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-120px)]">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Layout 