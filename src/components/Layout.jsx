import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import { useOnboarding } from '../hooks/useOnboarding'
import { Link, useLocation } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import OnboardingModal from '../components/OnboardingModal'
import {
    LayoutDashboard, CreditCard, Wallet, ArrowLeftRight,
    RefreshCw, PiggyBank, Calculator, Tag, BookOpen, LogOut, Trash2
} from 'lucide-react'

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accounts', label: 'Contas', icon: Wallet },
    { to: '/cards', label: 'Cartões', icon: CreditCard },
    { to: '/transactions', label: 'Lançamentos', icon: ArrowLeftRight },
    { to: '/recurring', label: 'Recorrentes', icon: RefreshCw },
    { to: '/goals', label: 'Cofrinhos', icon: PiggyBank },
    { to: '/budget', label: 'Orçamento', icon: Calculator },
    { to: '/categories', label: 'Categorias', icon: Tag },
]

function FinancerLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--accent)', border: 'solid 1px white' }}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M8 3v10" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M5 5l6 6" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
                    <path d="M11 5l-6 6" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
                </svg>
            </div>
            <span
                className="text-base font-semibold tracking-tight text-gray-100 dark:text-gray-100"
                style={{ letterSpacing: '-0.3px' }}
            >
                Financer
            </span>
        </div>
    )
}

export default function Layout({ children }) {
    const { user, logout, deleteAccount } = useAuth()
    const [confirmDelete, setConfirmDelete] = useState(false)
    const { theme, toggleTheme, accent, changeAccent, ACCENT_COLORS } = useTheme()
    const { showOnboarding, completeOnboarding, restartOnboarding } = useOnboarding()
    const location = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900">
            <header
                className="w-full px-8 py-3 flex items-center justify-between border-b"
                style={{
                    backgroundColor: 'var(--accent)',
                    borderBottomColor: 'transparent'
                }}
            >
                <FinancerLogo />

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(o => !o)}
                        className="flex items-center gap-2 text-sm transition"
                        style={{ color: 'var(--accent-text)', opacity: 0.9 }}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                        >
                            {user.displayName?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <span className="hidden sm:block text-white">{user.displayName}</span>
                        <span className="text-white opacity-60">▾</span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-10 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg py-2 z-50">
                            <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 mb-1">
                                <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{user.displayName}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                            </div>

                            <div className="w-full px-4 py-2 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-sm">{theme === 'dark' ? '🌙' : '☀️'}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Modo escuro</span>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                                    style={{ backgroundColor: theme === 'dark' ? '#4B5563' : '#D1D5DB' }}
                                >
                                    <span
                                        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                                        style={{ transform: theme === 'dark' ? 'translateX(16px)' : 'translateX(0px)' }}
                                    />
                                </button>
                            </div>

                            <div className="w-full px-4 py-2 flex flex-col gap-2">
                                <span className="text-xs text-gray-400 dark:text-gray-500">Cor de destaque</span>
                                <div className="flex gap-2">
                                    {Object.entries(ACCENT_COLORS).map(([key, colors]) => (
                                        <button
                                            key={key}
                                            onClick={() => changeAccent(key)}
                                            className="w-6 h-6 rounded-full transition"
                                            style={{
                                                backgroundColor: theme === 'dark' ? colors.dark : colors.light,
                                                outline: accent === key ? `2px solid ${theme === 'dark' ? colors.dark : colors.light}` : 'none',
                                                outlineOffset: '2px',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => { restartOnboarding(); setMenuOpen(false) }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3"
                            >
                                <BookOpen size={14} className="text-gray-400" />
                                Ver tutorial
                            </button>

                            <div className="border-t border-gray-50 dark:border-gray-700 mt-1 pt-1">
                                <button
                                    onClick={() => { logout(); setMenuOpen(false) }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-3"
                                >
                                    <LogOut size={14} className="text-gray-400" />
                                    Sair
                                </button>

                                <button
                                    onClick={() => { setConfirmDelete(true); setMenuOpen(false) }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-3"
                                >
                                    <Trash2 size={14} className="text-red-400" />
                                    Excluir conta
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <nav className="w-full bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8">
                <div className="flex gap-6">
                    {navItems.map(item => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.to
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-1.5 text-sm py-3 border-b-2 transition ${isActive
                                        ? 'border-b-2 font-medium'
                                        : 'text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                                style={isActive ? {
                                    color: 'var(--accent)',
                                    borderBottomColor: 'var(--accent)'
                                } : {}}
                            >
                                <Icon size={14} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            <main className="w-full">
                {children}
            </main>

            {showOnboarding && (
                <OnboardingModal onComplete={completeOnboarding} />
            )}

            {confirmDelete && (
                <ConfirmModal
                    title="Excluir conta?"
                    message="Todos os seus dados serão excluídos permanentemente. Esta ação não pode ser desfeita."
                    confirmLabel="Excluir conta"
                    onConfirm={async () => { await deleteAccount(); setConfirmDelete(false) }}
                    onClose={() => setConfirmDelete(false)}
                />
            )}
        </div>
    )
}