import React from 'react'
import type { FormHTMLAttributes, ReactNode } from 'react'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  title?: string
  subtitle?: string
  footer?: ReactNode
  isLoading?: boolean
}

const Form: React.FC<FormProps> = ({
  children,
  title,
  subtitle,
  footer,
  isLoading = false,
  className = '',
  ...props
}) => {
  const formClasses = `space-y-6 ${className}`.trim()

  return (
    <div className="w-full">
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      <form
        className={formClasses}
        {...props}
      >
        <fieldset disabled={isLoading} className="space-y-6">
          {children}
        </fieldset>
      </form>

      {/* Footer */}
      {footer && (
        <div className="mt-6">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Form 