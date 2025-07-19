'use client'
interface ButtonProps {
    size: 'lg' | 'md' | 'sm', 
    extraClass?: string, 
    clickHandler: () => void, 
    children: React.ReactNode,
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
    disabled?: boolean,
    loading?: boolean,
}

const sizeVariants = {
    'lg': 'text-xl px-8 py-4', 
    'md': 'text-lg px-6 py-3', 
    'sm': 'text-sm px-4 py-2'
}

const variantStyles = {
    'primary': 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl border-indigo-600',
    'secondary': 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600',
    'danger': 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    'ghost': 'bg-transparent hover:bg-white/10 text-white border-white/20 hover:border-white/40'
}

export function Button({
    size, 
    extraClass = '', 
    clickHandler, 
    children, 
    variant = 'ghost',
    disabled = false,
    loading = false
}: ButtonProps) {
    return (
        <button 
            onClick={disabled || loading ? undefined : clickHandler} 
            disabled={disabled || loading}
            className={`
                transition-all duration-200 ease-in-out
                inline-flex items-center justify-center
                border rounded-xl font-semibold
                transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${sizeVariants[size]} 
                ${variantStyles[variant]}
                ${extraClass}
            `}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    )
}