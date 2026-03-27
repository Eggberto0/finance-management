import { useState } from 'react'
import Layout from '../components/Layout'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { TRANSACTION_STATUS } from '../utils/constants'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'

const STATUS_STYLES = {
    confirmed: 'bg-green-50 text-green-700',
    pending: 'bg-yellow-50 text-yellow-700',
    cancelled: 'bg-gray-100 text-gray-400',
}

export default function Transactions() {
    const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, confirmTransaction, cancelTransaction } = useTransactions()
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [filterType, setFilterType] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [viewMode, setViewMode] = useState('all')
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear())

    function changeMonth(direction) {
        const [year, month] = selectedMonth.split('-').map(Number)
        const date = new Date(year, month - 1 + direction, 1)
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    }

    function formatMonthLabel(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number)
        return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
            month: 'long', year: 'numeric'
        })
    }

    function handleEdit(transaction) {
        setEditing(transaction)
        setShowForm(true)
    }

    function handleClose() {
        setEditing(null)
        setShowForm(false)
    }

    function getAccountName(id) {
        return accounts.find(a => a.id === id)?.name ?? '—'
    }

    function getCategory(id) {
        return categories.find(c => c.id === id)
    }

    function formatDate(date) {
        const d = date?.toDate?.() ?? new Date(date)
        return d.toLocaleDateString('pt-BR')
    }

    function formatAmount(amount, type) {
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Math.abs(amount))

        if (type === 'income') return `+${formatted}`
        if (type === 'expense') return `-${formatted}`
        return formatted
    }

    const filtered = transactions.filter(t => {
        const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
        const dateMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (dateMonth !== selectedMonth) return false
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        return true
    })

    const benefitAccountIds = accounts
        .filter(a => a.type === 'benefit')
        .map(a => a.id)

    const filteredForSummary = filtered.filter(t => {
        if (viewMode === 'patrimony') return !benefitAccountIds.includes(t.accountId)
        if (viewMode === 'benefits') return benefitAccountIds.includes(t.accountId)
        return true
    })

    const monthSummary = filteredForSummary.reduce((acc, t) => {
        if (t.status === 'cancelled') return acc
        if (t.type === 'income') acc.income += t.amount
        if (t.type === 'expense') acc.expense += t.amount
        return acc
    }, { income: 0, expense: 0 })

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
                Carregando...
            </div>
        )
    }

    return (
        <Layout>
            <div className="w-full px-18 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800">Lançamentos</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition"
                    >
                        Novo lançamento
                    </button>
                </div>

                <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl w-fit">
                    {[
                        { value: 'all', label: 'Geral' },
                        { value: 'patrimony', label: 'Patrimônio' },
                        { value: 'benefits', label: 'Benefícios' },
                    ].map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => setViewMode(mode.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg transition ${viewMode === mode.value
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="text-gray-400 hover:text-gray-600 transition px-2 py-1 rounded-lg hover:bg-gray-100"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => {
                            setPickerYear(parseInt(selectedMonth.split('-')[0]))
                            setShowMonthPicker(true)
                        }}
                        className="text-sm font-medium text-gray-700 capitalize hover:text-gray-900 transition"
                    >
                        {formatMonthLabel(selectedMonth)}
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className="text-gray-400 hover:text-gray-600 transition px-2 py-1 rounded-lg hover:bg-gray-100"
                    >
                        →
                    </button>
                </div>

                {showMonthPicker && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                        onClick={e => e.target === e.currentTarget && setShowMonthPicker(false)}
                    >
                        <div className="bg-white rounded-2xl shadow-lg p-5 w-72 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setPickerYear(y => y - 1)}
                                    className="text-gray-400 hover:text-gray-600 transition px-2 py-1 rounded-lg hover:bg-gray-100"
                                >
                                    ←
                                </button>
                                <span className="text-sm font-medium text-gray-800">{pickerYear}</span>
                                <button
                                    onClick={() => setPickerYear(y => y + 1)}
                                    className="text-gray-400 hover:text-gray-600 transition px-2 py-1 rounded-lg hover:bg-gray-100"
                                >
                                    →
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const monthValue = `${pickerYear}-${String(i + 1).padStart(2, '0')}`
                                    const isSelected = monthValue === selectedMonth
                                    const label = new Date(pickerYear, i, 1)
                                        .toLocaleDateString('pt-BR', { month: 'short' })
                                        .replace('.', '')

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setSelectedMonth(monthValue)
                                                setShowMonthPicker(false)
                                            }}
                                            className={`py-2 rounded-xl text-sm capitalize transition ${isSelected
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>

                            <button
                                onClick={() => {
                                    const now = new Date()
                                    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
                                    setShowMonthPicker(false)
                                }}
                                className="text-xs text-gray-400 hover:text-gray-600 transition text-center"
                            >
                                Ir para o mês atual
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400 mb-1">Receitas</p>
                        <p className="text-sm font-medium text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.income)}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400 mb-1">Despesas</p>
                        <p className="text-sm font-medium text-red-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.expense)}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400 mb-1">Balanço</p>
                        <p className={`text-sm font-medium ${monthSummary.income - monthSummary.expense >= 0 ? 'text-gray-800' : 'text-red-500'
                            }`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                monthSummary.income - monthSummary.expense
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {[
                        { value: 'all', label: 'Todos' },
                        { value: 'expense', label: 'Despesas' },
                        { value: 'income', label: 'Receitas' },
                        { value: 'transfer', label: 'Transferências' },
                    ].map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilterType(f.value)}
                            className={`text-sm px-4 py-1.5 rounded-xl transition ${filterType === f.value
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}

                    <div className="ml-auto">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 outline-none bg-white"
                        >
                            <option value="all">Todos os status</option>
                            {TRANSACTION_STATUS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">
                        Nenhum lançamento encontrado.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map(transaction => {
                            const category = getCategory(transaction.categoryId)
                            return (
                                <div
                                    key={transaction.id}
                                    className={`bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 ${transaction.status === 'cancelled' ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        {category ? (
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                                style={{ backgroundColor: category.color + '22' }}
                                            >
                                                {category.icon}
                                            </div>
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex-shrink-0" />
                                        )}

                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {transaction.description || '—'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatDate(transaction.date)} · {getAccountName(transaction.accountId)}
                                                {transaction.installmentTotal > 1 && (
                                                    <span className="ml-1 text-gray-400">
                                                        · {transaction.installmentNumber}/{transaction.installmentTotal}x
                                                    </span>
                                                )}
                                            </p>
                                            {transaction.tags?.length > 0 && (
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {transaction.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' :
                                                transaction.type === 'expense' ? 'text-red-500' :
                                                    'text-gray-600'
                                                }`}>
                                                {formatAmount(transaction.amount, transaction.type)}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[transaction.status]}`}>
                                                {TRANSACTION_STATUS.find(s => s.value === transaction.status)?.label}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            {(() => {
                                                if (transaction.status !== 'pending') return null
                                                const date = transaction.date?.toDate?.() ?? new Date(transaction.date.seconds * 1000)
                                                const today = new Date()
                                                today.setHours(23, 59, 59, 999)
                                                if (date > today) return null
                                                return (
                                                    <button
                                                        onClick={() => confirmTransaction(transaction.id)}
                                                        className="text-xs text-green-500 hover:text-green-700 transition"
                                                    >
                                                        Confirmar
                                                    </button>
                                                )
                                            })()}
                                            <button
                                                onClick={() => handleEdit(transaction)}
                                                className="text-xs text-gray-400 hover:text-gray-600 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => deleteTransaction(transaction.id)}
                                                className="text-xs text-red-400 hover:text-red-600 transition"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {showForm && (
                    <TransactionForm
                        transaction={editing}
                        onClose={handleClose}
                        onAdd={addTransaction}
                        onUpdate={updateTransaction}
                    />
                )}
            </div>
        </Layout>
    )
}