import React, { useState, forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isLoading?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  // Estilos base
  const baseStyles = 'w-full border rounded-xl transition-all duration-300 focus:outline-none shadow-sm hover:shadow-md focus:shadow-lg backdrop-blur-sm'
  
  // Variantes de estilo
  const variantStyles = {
    default: 'border-gray-200 bg-white/90 focus:border-caribbean-500 focus:ring-2 focus:ring-caribbean-500/20 hover:border-gray-300',
    filled: 'border-gray-100 bg-gradient-to-br from-gray-50 to-white focus:bg-white focus:border-caribbean-500 focus:ring-2 focus:ring-caribbean-500/20',
    outlined: 'border-2 border-gray-300 bg-white/50 focus:border-caribbean-500 hover:bg-white/80'
  }

  // Tamaños
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  }

  // Estados de error
  const errorStyles = error 
    ? 'border-coral-500 focus:border-coral-500 focus:ring-coral-500/20' 
    : ''

  // Estilos de loading
  const loadingStyles = isLoading ? 'opacity-50 cursor-wait' : ''

  // Estilos de disabled
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''

  const inputClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${errorStyles}
    ${loadingStyles}
    ${disabledStyles}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || isLoading ? 'pr-10' : ''}
    ${className}
  `.trim()

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium mb-2 transition-colors ${
          error ? 'text-coral-700' : isFocused ? 'text-caribbean-700' : 'text-gray-700'
        }`}>
          {label}
          {props.required && <span className="text-coral-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          className={inputClasses}
          disabled={disabled || isLoading}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {/* Right icon or loading */}
        {(rightIcon || isLoading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-caribbean-600"></div>
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>

      {/* Helper text o error */}
      {(error || helperText) && (
        <p className={`text-sm mt-1 ${
          error ? 'text-coral-600' : 'text-gray-500'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input 