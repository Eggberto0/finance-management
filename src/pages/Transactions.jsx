import { useState } from 'react'
import Layout from '../components/Layout'
import { useAccounts } from '../hooks/useAccounts'
import CategoryIcon from '../components/CategoryIcon'
import { useCategories } from '../hooks/useCategories'
import { TRANSACTION_STATUS } from '../utils/constants'
import { useTransactions } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import DeleteTransactionModal from '../components/DeleteTransactionModal'

const STATUS_STYLES = {
    confirmed: 'bg-green-50 text-green-700',
    pending: 'bg-yellow-50 text-yellow-700',
    cancelled: 'bg-gray-100 text-gray-400',
    overdue: 'bg-red-50 text-red-600',
}

const STATUS_LABELS = {
    confirmed: 'Confirmado',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    overdue: 'Atrasado',
}

export default function Transactions() {
    const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, confirmTransaction, cancelTransaction, deleteInstallments } = useTransactions()
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [viewMode, setViewMode] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
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
            style: 'currency', currency: 'BRL'
        }).format(Math.abs(amount))
        if (type === 'income') return `+${formatted}`
        if (type === 'expense') return `-${formatted}`
        return formatted
    }

    function getEffectiveStatus(transaction) {
        if (transaction.status !== 'pending') return transaction.status
        const date = transaction.date?.toDate?.() ?? new Date(transaction.date?.seconds * 1000)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        date.setHours(0, 0, 0, 0)
        if (date < today && !transaction.autoConfirm) return 'overdue'
        return 'pending'
    }

    const filtered = transactions.filter(t => {
        const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
        const dateMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (dateMonth !== selectedMonth) return false
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        return true
    })

    const benefitAccountIds = accounts.filter(a => a.type === 'benefit').map(a => a.id)

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
            <div className="min-h-screen flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Carregando...
            </div>
        )
    }

    return (
        <Layout>
            <div className="w-full px-18 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Lançamentos</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                    >
                        Novo lançamento
                    </button>
                </div>

                <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit">
                    {[
                        { value: 'all', label: 'Geral' },
                        { value: 'patrimony', label: 'Patrimônio' },
                        { value: 'benefits', label: 'Benefícios' },
                    ].map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => setViewMode(mode.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg transition ${viewMode === mode.value
                                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => {
                            setPickerYear(parseInt(selectedMonth.split('-')[0]))
                            setShowMonthPicker(true)
                        }}
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize hover:text-gray-900 dark:hover:text-white transition"
                    >
                        {formatMonthLabel(selectedMonth)}
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        →
                    </button>
                </div>

                {showMonthPicker && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                        onClick={e => e.target === e.currentTarget && setShowMonthPicker(false)}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 w-72 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <button onClick={() => setPickerYear(y => y - 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">←</button>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{pickerYear}</span>
                                <button onClick={() => setPickerYear(y => y + 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">→</button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const monthValue = `${pickerYear}-${String(i + 1).padStart(2, '0')}`
                                    const isSelected = monthValue === selectedMonth
                                    const label = new Date(pickerYear, i, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => { setSelectedMonth(monthValue); setShowMonthPicker(false) }}
                                            className={`py-2 rounded-xl text-sm capitalize transition ${isSelected
                                                ? 'bg-gray-900 dark:bg-gray-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition text-center"
                            >
                                Ir para o mês atual
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Receitas</p>
                        <p className="text-sm font-medium text-green-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.income)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Despesas</p>
                        <p className="text-sm font-medium text-red-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.expense)}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Balanço</p>
                        <p className={`text-sm font-medium ${monthSummary.income - monthSummary.expense >= 0
                            ? 'text-gray-800 dark:text-gray-100'
                            : 'text-red-500'
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
                                ? 'bg-gray-900 dark:bg-gray-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}

                    <div className="ml-auto">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-1.5 text-gray-600 dark:text-gray-300 outline-none bg-white dark:bg-gray-800"
                        >
                            <option value="all">Todos os status</option>
                            {TRANSACTION_STATUS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhum lançamento encontrado.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map(transaction => {
                            const category = getCategory(transaction.categoryId)
                            return (
                                <div
                                    key={transaction.id}
                                    className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 ${transaction.status === 'cancelled' ? 'opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        {category ? (
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                                style={{ backgroundColor: category.color + '22' }}
                                            >
                                                <CategoryIcon name={category.icon} size={14} />
                                            </div>
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                                        )}

                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                {transaction.description || '—'}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {formatDate(transaction.date)} · {getAccountName(transaction.accountId)}
                                                {transaction.installmentTotal > 1 && (
                                                    <span className="ml-1">
                                                        · {transaction.installmentNumber}/{transaction.installmentTotal}x
                                                    </span>
                                                )}
                                            </p>
                                            {transaction.confirmedAt && transaction.status === 'confirmed' && (
                                                <p className="text-xs text-green-500 dark:text-green-400 mt-0.5">
                                                    Pago em: {formatDate(transaction.confirmedAt)}
                                                </p>
                                            )}

                                            {transaction.isHistorical && (
                                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded-full">
                                                    Histórico
                                                </span>
                                            )}

                                            {transaction.tags?.length > 0 && (
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {transaction.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full"
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
                                                    'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {formatAmount(transaction.amount, transaction.type)}
                                            </p>
                                            {(() => {
                                                const effective = getEffectiveStatus(transaction)
                                                return (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[effective]}`}>
                                                        {STATUS_LABELS[effective]}
                                                    </span>
                                                )
                                            })()}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            {(() => {
                                                const effective = getEffectiveStatus(transaction)
                                                const date = transaction.date?.toDate?.() ?? new Date(transaction.date?.seconds * 1000)
                                                const today = new Date()
                                                today.setHours(23, 59, 59, 999)
                                                return (
                                                    <>
                                                        {(effective === 'pending' || effective === 'overdue') && date <= today && (
                                                            <button
                                                                onClick={() => confirmTransaction(transaction.id)}
                                                                className="text-xs text-green-500 hover:text-green-700 transition"
                                                            >
                                                                Confirmar
                                                            </button>
                                                        )}
                                                        {(effective === 'pending' || effective === 'overdue' || effective === 'confirmed') && (
                                                            <button
                                                                onClick={() => cancelTransaction(transaction.id)}
                                                                className="text-xs text-yellow-500 hover:text-yellow-700 transition"
                                                            >
                                                                Cancelar
                                                            </button>
                                                        )}
                                                        {effective === 'cancelled' && (
                                                            <button
                                                                onClick={() => updateTransaction(transaction.id, { status: 'pending' })}
                                                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                                                            >
                                                                Reativar
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEdit(transaction)}
                                                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                                        >
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleting(transaction)}
                                                            className="text-xs text-red-400 hover:text-red-600 transition"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {deleting && (
                    <DeleteTransactionModal
                        transaction={deleting}
                        onClose={() => setDeleting(null)}
                        onDelete={deleteTransaction}
                        onDeleteAll={deleteInstallments}
                    />
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