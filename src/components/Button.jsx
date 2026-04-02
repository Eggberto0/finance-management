export default function Button({ children, onClick, className = '', variant = 'primary', ...props }) {
    if (variant === 'primary') {
        return (
            <button
                onClick={onClick}
                className={`text-sm px-4 py-2 rounded-xl transition font-medium ${className}`}
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                {...props}
            >
                {children}
            </button>
        )
    }

    return (
        <button
            onClick={onClick}
            className={`text-sm px-4 py-2 rounded-xl transition border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}