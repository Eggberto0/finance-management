import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import InvoicePreview from '../components/InvoicePreview'
import { calcAccountBalance } from '../utils/calcBalance'
import { useGenerateBudgets } from '../hooks/useGenerateBudgets'
import { useGenerateInstances } from '../hooks/useGenerateInstances'

const PERIOD_OPTIONS = [
    { value: 'month', label: 'Mês atual' },
    { value: 'quarter', label: '3 meses' },
    { value: 'half', label: '6 meses' },
    { value: 'year', label: 'Ano' },
]

function fmt(value, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}

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

    const {
        normalAccounts,
        benefitAccounts,
        transactions,
        totalBalance,
        totalIncome,
        totalExpense,
        expenseByCategory,
        upcomingTransactions,
        creditCardAlerts,
        budgetAlerts,
        overdueTransactions,
        invoicePreview,
    } = useDashboard(selectedMonth)

    const maxCategoryAmount = expenseByCategory[0]?.amount ?? 1

    function formatDate(date) {
        const d = date?.toDate?.() ?? new Date(date?.seconds * 1000)
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
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
            <div className="w-full px-18 py-8 flex flex-col gap-6">

                <div className="flex items-center justify-between">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Olá, {user.displayName.split(' ')[0]}! Aqui está seu resumo financeiro.
                    </p>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                        {PERIOD_OPTIONS.map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`text-xs px-3 py-1.5 rounded-lg transition ${period === p.value
                                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Patrimônio total</p>
                        <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{fmt(totalBalance)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">contas e poupança</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Receitas</p>
                        <p className="text-2xl font-medium text-green-600">{fmt(totalIncome)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">confirmadas no mês</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Despesas</p>
                        <p className="text-2xl font-medium text-red-500">{fmt(totalExpense)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">confirmadas no mês</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Balanço</p>
                        <p className={`text-2xl font-medium ${totalIncome - totalExpense >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-500'}`}>
                            {fmt(totalIncome - totalExpense)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">receitas − despesas</p>
                    </div>
                </div>

                {budgetAlerts.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 flex flex-col gap-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Alertas de orçamento</p>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {budgetAlerts.map(budget => (
                                <div
                                    key={budget.id}
                                    className={`rounded-xl px-4 py-3 ${budget.isOver
                                            ? 'bg-red-50 dark:bg-red-900/20'
                                            : 'bg-amber-50 dark:bg-amber-900/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span style={{ fontSize: 14 }}>{budget.category?.icon}</span>
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
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-5 py-5 flex flex-col gap-4">
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

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-4">
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

                        {normalAccounts.filter(a => a.type === 'credit').length > 0 && (
                            <>
                                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Cartões</p>
                                <div className="flex flex-col gap-1">
                                    {normalAccounts.filter(a => a.type === 'credit').map(account => {
                                        const balance = calcAccountBalance(account, transactions)
                                        const used = (account.creditLimit ?? 0) - balance
                                        return (
                                            <div key={account.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account.color }} />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{account.name}</span>
                                                </div>
                                                <span className="text-sm font-medium text-red-500">
                                                    {fmt(used)} usado
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}

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

                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Gastos por categoria</p>
                        {expenseByCategory.length === 0 ? (
                            <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum gasto registrado.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {expenseByCategory.map(({ categoryId, amount, category }) => (
                                    <div key={categoryId} className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span style={{ fontSize: 14 }}>{category.icon}</span>
                                                <span className="text-xs text-gray-600 dark:text-gray-400">{category.name}</span>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{fmt(amount)}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${(amount / maxCategoryAmount) * 100}%`,
                                                    backgroundColor: category.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Próximos lançamentos</p>

                        {creditCardAlerts.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {creditCardAlerts.map(({ account, balance, daysUntilDue }) => {
                                    const used = (account.creditLimit ?? 0) - balance
                                    return (
                                        <div key={account.id} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2">
                                            <div>
                                                <p className="text-xs font-medium text-red-700 dark:text-red-400">Fatura {account.name}</p>
                                                <p className="text-xs text-red-500 dark:text-red-400">{daysLabel(daysUntilDue)}</p>
                                            </div>
                                            <span className="text-xs font-medium text-red-700 dark:text-red-400">{fmt(used)}</span>
                                        </div>
                                    )
                                })}
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
                                            <div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{t.description || '—'}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{daysLabel(days)} · {formatDate(t.date)}</p>
                                            </div>
                                            <span className={`text-sm font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}