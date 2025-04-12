'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export default function LoadingSpinner({ size = 'md', message, className = '' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: {
      spinner: 'h-6 w-6',
      text: 'text-sm'
    },
    md: {
      spinner: 'h-10 w-10',
      text: 'text-base'
    },
    lg: {
      spinner: 'h-16 w-16',
      text: 'text-lg'
    }
  }

  const sizeClass = sizeMap[size]

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClass.spinner} rounded-full border-2 border-t-transparent border-purple-500 animate-spin mb-4`}></div>
      {message && (
        <p className={`${sizeClass.text} text-gray-400`}>{message}</p>
      )}
    </div>
  )
}