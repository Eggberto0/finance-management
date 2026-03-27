import { useAuth } from '../contexts/AuthContext'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/accounts', label: 'Contas' },
    { to: '/categories', label: 'Categorias' },
    { to: '/transactions', label: 'Lançamentos' },
]

export default function Layout({ children }) {
    const { user, logout } = useAuth()
    const location = useLocation()

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
            <header className="w-full bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                <h1 className="text-lg font-medium text-gray-800">Financer</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{user.displayName}</span>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-400 hover:text-gray-600 transition"
                    >
                        Sair
                    </button>
                </div>
            </header>

            <nav className="w-full bg-white border-b border-gray-100 px-8">
                <div className="flex gap-6">
                    {navItems.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`text-sm py-3 border-b-2 transition ${location.pathname === item.to
                                ? 'text-gray-800 border-gray-800'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
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