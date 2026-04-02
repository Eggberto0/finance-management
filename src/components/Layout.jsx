import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/accounts', label: 'Contas' },
    { to: '/cards', label: 'Cartões' },
    { to: '/transactions', label: 'Lançamentos' },
    { to: '/recurring', label: 'Recorrentes' },
    { to: '/goals', label: 'Cofrinhos' },
    { to: '/budget', label: 'Orçamento' },
    { to: '/categories', label: 'Categorias' },
]

export default function Layout({ children }) {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900">
            <header className="w-full bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8 py-4 flex items-center justify-between">
                <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">Financer</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{user.displayName}</span>
                    <button
                        onClick={toggleTheme}
                        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-2"
                        title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <nav className="w-full bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8">
                <div className="flex gap-6">
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`text-sm py-3 border-b-2 transition ${location.pathname === item.to
                                ? 'text-gray-800 dark:text-gray-100 border-gray-800 dark:border-gray-100'
                                : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </nav>

            <main className="w-full">
                {children}
            </main>
        </div>
    )
}