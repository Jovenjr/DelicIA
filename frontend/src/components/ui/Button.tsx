import React, { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}, ref) => {
  // Estilos base
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'

  // Variantes de color
  const variantStyles = {
    primary: 'bg-gradient-to-r from-caribbean-600 to-caribbean-700 hover:from-caribbean-700 hover:to-caribbean-800 text-white focus:ring-caribbean-500 shadow-caribbean-500/25',
    secondary: 'bg-gradient-to-r from-tropical-600 to-tropical-700 hover:from-tropical-700 hover:to-tropical-800 text-white focus:ring-tropical-500 shadow-tropical-500/25',
    outline: 'border-2 border-caribbean-600 text-caribbean-600 hover:bg-gradient-to-r hover:from-caribbean-50 hover:to-caribbean-100 focus:ring-caribbean-500 bg-white/80 backdrop-blur-sm',
    ghost: 'text-caribbean-600 hover:bg-gradient-to-r hover:from-caribbean-50 hover:to-caribbean-100 focus:ring-caribbean-500 shadow-none hover:shadow-md',
    danger: 'bg-gradient-to-r from-coral-600 to-coral-700 hover:from-coral-700 hover:to-coral-800 text-white focus:ring-coral-500 shadow-coral-500/25'
  }

  // Tamaños
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
    xl: 'px-8 py-5 text-xl'
  }

  // Ancho completo
  const widthStyles = fullWidth ? 'w-full' : ''

  // Estilos de loading
  const loadingStyles = isLoading ? 'cursor-wait' : ''

  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyles}
    ${loadingStyles}
    ${className}
  `.trim()

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
      )}
      
      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {/* Content */}
      <span>{children}</span>
      
      {/* Right icon */}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button 