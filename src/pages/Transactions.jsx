import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { TRANSACTION_STATUS } from '../utils/constants'
import TransactionForm from '../components/TransactionForm'
import Layout from '../components/Layout'

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
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        return true
    })

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
                Carregando...
            </div>
        )
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800">Lançamentos</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition"
                    >
                        Novo lançamento
                    </button>
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
                                            {transaction.status === 'pending' && (() => {
                                                const date = transaction.date?.toDate?.() ?? new Date(transaction.date)
                                                const today = new Date()
                                                today.setHours(23, 59, 59, 999)
                                                return date <= today
                                            })()}
                                            <button
                                                onClick={() => confirmTransaction(transaction.id)}
                                                className="text-xs text-green-500 hover:text-green-700 transition"
                                            >
                                                Confirmar
                                            </button>
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