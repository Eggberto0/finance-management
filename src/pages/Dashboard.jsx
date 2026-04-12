import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import CategoryIcon from '../components/CategoryIcon'
import InvoicePreview from '../components/InvoicePreview'
import PercentageView from '../components/PercentageView'
import { calcAccountBalance } from '../utils/calcBalance'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { useSettingsContext } from '../contexts/SettingsContext'
import { useGenerateBudgets } from '../hooks/useGenerateBudgets'
import { useGenerateInstances } from '../hooks/useGenerateInstances'

const PERIOD_OPTIONS = [
    { value: 'month', label: 'Mês atual' },
    { value: 'quarter', label: '3 meses' },
    { value: 'half', label: '6 meses' },
    { value: 'year', label: 'Ano' },
]

function daysLabel(days) {
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Amanhã'
    return `Em ${days} dias`
}

export default function Dashboard() {
    useGenerateInstances()
    useGenerateBudgets()
    const { user } = useAuth()

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [period, setPeriod] = useState('month')
    const [viewMode, setViewMode] = useState('general')

    const periodMonths = period === 'quarter' ? 3 : period === 'half' ? 6 : period === 'year' ? 12 : 1

    const {
        normalAccounts, benefitAccounts, transactions, totalBalance,
        totalIncome, totalExpense, expenseByCategory, upcomingTransactions,
        creditCardAlerts, budgetAlerts, overdueTransactions, invoicePreview,
        lastUpdated, goalsSummary, prevTotalExpense, expenseByCategotyPrev,
    } = useDashboard(selectedMonth, period)

    const maxCategoryAmount = expenseByCategory[0]?.amount ?? 1

    const { convert } = useExchangeRates()

    function formatDate(date) {
        const d = date?.toDate?.() ?? new Date(date?.seconds * 1000)
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }

    const { settings } = useSettingsContext()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'

    function fmt(value, currency) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency ?? defaultCurrency
        }).format(value)
    }

    function getDaysUntil(date) {
        const d = date?.toDate?.() ?? new Date(date?.seconds * 1000)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        d.setHours(0, 0, 0, 0)
        return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
    }

    return (
        <Layout>
            <div className="w-full px-4 md:px-18 py-6 md:py-8 flex flex-col gap-4 md:gap-6">

                {/* Header do dashboard */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Olá, {user.displayName?.split(' ')[0]}! Aqui está seu resumo financeiro.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('general')}
                                className={`text-xs px-3 py-1.5 rounded-lg transition ${viewMode === 'general'
                                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                Geral
                            </button>
                            <button
                                onClick={() => setViewMode('percentage')}
                                className={`text-xs px-3 py-1.5 rounded-lg transition ${viewMode === 'percentage'
                                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                Percentual
                            </button>
                        </div>
                        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            {PERIOD_OPTIONS.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={`text-xs px-2 md:px-3 py-1.5 rounded-lg transition ${period === p.value
                                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cards de resumo — 2 colunas no mobile, 4 no desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-2xl px-4 md:px-5 py-4" style={{ backgroundColor: 'var(--accent)' }}>
                        <p className="text-xs mb-2" style={{ color: 'var(--accent-light)' }}>Patrimônio total</p>
                        <p className="text-xl md:text-2xl font-medium text-white">{fmt(totalBalance)}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--accent-light)' }}>contas e poupança</p>
                        {lastUpdated && (
                            <p className="text-xs mt-1 opacity-50 text-white">
                                Câmbio: {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Receitas</p>
                        <p className="text-xl md:text-2xl font-medium text-green-600">{fmt(totalIncome)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {period === 'month' ? 'confirmadas no mês' : `últimos ${periodMonths} meses`}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Despesas</p>
                        <p className="text-xl md:text-2xl font-medium text-red-500">{fmt(totalExpense)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {period === 'month' ? 'confirmadas no mês' : `últimos ${periodMonths} meses`}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Balanço</p>
                        <p className={`text-xl md:text-2xl font-medium ${totalIncome - totalExpense >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-500'}`}>
                            {fmt(totalIncome - totalExpense)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">receitas − despesas</p>
                    </div>
                </div>

                {viewMode === 'percentage' ? (
                    <PercentageView
                        totalIncome={totalIncome}
                        totalExpense={totalExpense}
                        expenseByCategory={expenseByCategory}
                        prevTotalExpense={prevTotalExpense}
                        expenseByCategotyPrev={expenseByCategotyPrev}
                        normalAccounts={normalAccounts}
                        totalBalance={totalBalance}
                        transactions={transactions}
                        convert={convert}
                        defaultCurrency={defaultCurrency}
                    />
                ) : (
                    <>
                        {budgetAlerts.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-4 flex flex-col gap-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Alertas de orçamento</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {budgetAlerts.map(budget => (
                                        <div
                                            key={budget.id}
                                            className={`rounded-xl px-4 py-3 ${budget.isOver ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <CategoryIcon name={budget.category?.icon} size={14} />
                                                <span className={`text-xs font-medium ${budget.isOver ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                                    {budget.category?.name}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                                                <div
                                                    className={`h-full rounded-full ${budget.isOver ? 'bg-red-500' : 'bg-amber-400'}`}
                                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                                />
                                            </div>
                                            <p className={`text-xs ${budget.isOver ? 'text-red-500 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                {Math.round(budget.percentage)}% usado
                                                {budget.isOver && ` · +${fmt(budget.spent - budget.amount)}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {overdueTransactions.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-4 md:px-5 py-5 flex flex-col gap-4">
                                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                    {overdueTransactions.length === 1
                                        ? '1 lançamento em atraso'
                                        : `${overdueTransactions.length} lançamentos em atraso`
                                    }
                                </p>
                                <div className="flex flex-col gap-1">
                                    {overdueTransactions.map(t => {
                                        const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
                                        const daysLate = Math.floor((new Date().setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
                                        return (
                                            <div key={t.id} className="flex items-center justify-between py-2 border-b border-red-100 dark:border-red-800 last:border-0">
                                                <div>
                                                    <p className="text-sm text-red-800 dark:text-red-300">{t.description || '—'}</p>
                                                    <p className="text-xs text-red-400 dark:text-red-500">
                                                        {date.toLocaleDateString('pt-BR')} · {daysLate === 1 ? '1 dia em atraso' : `${daysLate} dias em atraso`}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                                                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <InvoicePreview invoicePreview={invoicePreview} />

                        {goalsSummary.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-5 flex flex-col gap-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Cofrinhos</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {goalsSummary.map(goal => (
                                        <div key={goal.id} className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon name={goal.icon} size={14} />
                                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{goal.name}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${goal.percentage}%`,
                                                        backgroundColor: goal.isComplete ? '#1D9E75' : goal.color
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                {Math.round(goal.percentage)}% · {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency', currency: 'BRL'
                                                }).format(goal.current)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Grid principal — coluna única no mobile, 3 colunas no desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-5 flex flex-col gap-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Contas</p>
                                <div className="flex flex-col gap-1">
                                    {normalAccounts.filter(a => a.type !== 'credit').map(account => (
                                        <div key={account.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account.color }} />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{account.name}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                {fmt(calcAccountBalance(account, transactions), account.currency)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {benefitAccounts.length > 0 && (
                                    <>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Benefícios</p>
                                        <div className="flex flex-col gap-1">
                                            {benefitAccounts.map(account => (
                                                <div key={account.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account.color }} />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">{account.name}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                        {fmt(calcAccountBalance(account, transactions), account.currency)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-5 flex flex-col gap-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Gastos por categoria</p>
                                {expenseByCategory.length === 0 ? (
                                    <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum gasto registrado.</p>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {expenseByCategory.map(({ categoryId, amount, category }) => (
                                            <div key={categoryId} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <CategoryIcon name={category.icon} size={14} />
                                                    <span className="text-xs text-gray-600 dark:text-gray-400">{category.name}</span>
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{fmt(amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-5 flex flex-col gap-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Próximos lançamentos</p>
                                {creditCardAlerts.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {creditCardAlerts.map(({ account, invoiceTotal, daysUntilDue }) => (
                                            <div key={account.id} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
                                                <div>
                                                    <p className="text-xs font-medium text-red-700 dark:text-red-400">Fatura {account.name}</p>
                                                    <p className="text-xs text-red-500 dark:text-red-400">{daysLabel(daysUntilDue)}</p>
                                                </div>
                                                <span className="text-xs font-medium text-red-700 dark:text-red-400">{fmt(invoiceTotal)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {upcomingTransactions.length === 0 && creditCardAlerts.length === 0 ? (
                                    <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum lançamento pendente.</p>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {upcomingTransactions.map(t => {
                                            const days = getDaysUntil(t.date)
                                            return (
                                                <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                                    <div className="min-w-0 flex-1 mr-3">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{t.description || '—'}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">{daysLabel(days)} · {formatDate(t.date)}</p>
                                                    </div>
                                                    <span className={`text-sm font-medium flex-shrink-0 ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    )
}