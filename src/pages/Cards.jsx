import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { useCardInvoice } from '../hooks/useCardInvoice'
import { useCategories } from '../hooks/useCategories'
import { calcAccountBalance } from '../utils/calcBalance'
import TransactionForm from '../components/TransactionForm'
import AccountForm from '../components/AccountForm'
import ConfirmModal from '../components/ConfirmModal'
import DeleteTransactionModal from '../components/DeleteTransactionModal'
import Layout from '../components/Layout'

function fmt(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function InvoiceView({ card, month, onBack }) {
    const { invoiceTransactions, total, isPaid, payInvoice } = useCardInvoice(card.id, month)
    const { categories } = useCategories()
    const { addTransaction, deleteTransaction, deleteInstallments, updateTransaction } = useTransactions()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [confirmPay, setConfirmPay] = useState(false)

    const [year, m] = month.split('-').map(Number)
    const monthLabel = new Date(year, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    function getCategory(id) {
        return categories.find(c => c.id === id)
    }

    function formatDate(date) {
        const d = date?.toDate?.() ?? new Date(date?.seconds * 1000)
        return d.toLocaleDateString('pt-BR')
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                    ← Voltar
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">{card.name}</h2>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mb-1">{monthLabel}</p>
                    <p className="text-2xl font-medium text-gray-800 dark:text-gray-100">{fmt(total)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {invoiceTransactions.length} lançamento{invoiceTransactions.length !== 1 ? 's' : ''}
                        {isPaid && ' · Paga'}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                    >
                        Nova compra
                    </button>
                    {!isPaid && total > 0 && (
                        <button
                            onClick={() => setConfirmPay(true)}
                            className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-green-700 transition"
                        >
                            Pagar fatura
                        </button>
                    )}
                </div>
            </div>

            {invoiceTransactions.length === 0 ? (
                <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                    Nenhuma compra nesta fatura.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {invoiceTransactions.map(transaction => {
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
                                            {category.icon}
                                        </div>
                                    ) : (
                                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                            {transaction.description || '—'}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            {formatDate(transaction.date)}
                                            {transaction.installmentTotal > 1 && (
                                                <span className="ml-1">· {transaction.installmentNumber}/{transaction.installmentTotal}x</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <p className="text-sm font-medium text-red-500">{fmt(transaction.amount)}</p>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => { setEditing(transaction); setShowForm(true) }}
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
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {showForm && (
                <TransactionForm
                    transaction={editing ?? { type: 'expense', accountId: card.id }}
                    onClose={() => { setEditing(null); setShowForm(false) }}
                    onAdd={addTransaction}
                    onUpdate={updateTransaction}
                />
            )}

            {deleting && (
                <DeleteTransactionModal
                    transaction={deleting}
                    onClose={() => setDeleting(null)}
                    onDelete={deleteTransaction}
                    onDeleteAll={deleteInstallments}
                />
            )}

            {confirmPay && (
                <ConfirmModal
                    title="Pagar fatura?"
                    message={`Isso confirmará ${invoiceTransactions.length} lançamento${invoiceTransactions.length !== 1 ? 's' : ''} e lançará ${fmt(total)} na conta vinculada.`}
                    confirmLabel="Pagar"
                    danger={false}
                    onConfirm={() => { payInvoice(); setConfirmPay(false) }}
                    onClose={() => setConfirmPay(false)}
                />
            )}
        </div>
    )
}

export default function Cards() {
    const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts()
    const { transactions } = useTransactions()
    const [selectedCard, setSelectedCard] = useState(null)
    const [showCardForm, setShowCardForm] = useState(false)
    const [editingCard, setEditingCard] = useState(null)
    const [confirmingDelete, setConfirmingDelete] = useState(null)
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [pickerYear, setPickerYear] = useState(now.getFullYear())

    const creditCards = accounts.filter(a => a.type === 'credit')

    function changeMonth(direction) {
        const [year, month] = selectedMonth.split('-').map(Number)
        const date = new Date(year, month - 1 + direction, 1)
        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    }

    function formatMonthLabel(yearMonth) {
        const [year, month] = yearMonth.split('-').map(Number)
        return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }

    function getInvoiceTotal(cardId) {
        const [year, m] = selectedMonth.split('-').map(Number)
        return transactions
            .filter(t => {
                if (t.accountId !== cardId || t.type !== 'expense' || t.status === 'cancelled') return false
                const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
                return date.getFullYear() === year && date.getMonth() + 1 === m
            })
            .reduce((sum, t) => sum + t.amount, 0)
    }

    if (selectedCard) {
        return (
            <Layout>
                <div className="w-full px-18 py-8">
                    <InvoiceView
                        card={selectedCard}
                        month={selectedMonth}
                        onBack={() => setSelectedCard(null)}
                    />
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="w-full px-18 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Cartões</h2>
                    <button
                        onClick={() => setShowCardForm(true)}
                        className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                    >
                        Novo cartão
                    </button>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => { setPickerYear(parseInt(selectedMonth.split('-')[0])); setShowMonthPicker(true) }}
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

                {creditCards.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhum cartão cadastrado ainda.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {creditCards.map(card => {
                            const balance = calcAccountBalance(card, transactions)
                            const used = (card.creditLimit ?? 0) - balance
                            const invoiceTotal = getInvoiceTotal(card.id)
                            const usagePercent = Math.min((used / (card.creditLimit ?? 1)) * 100, 100)

                            return (
                                <div
                                    key={card.id}
                                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-300 dark:hover:border-gray-500 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => setSelectedCard(card)}
                                            className="flex items-center gap-3 flex-1 text-left"
                                        >
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{card.name}</p>
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">Vence dia {card.dueDay}</span>
                                            <button
                                                onClick={() => { setEditingCard(card); setShowCardForm(true) }}
                                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setConfirmingDelete(card)}
                                                className="text-xs text-red-400 hover:text-red-600 transition"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>

                                    <button onClick={() => setSelectedCard(card)} className="flex flex-col gap-4 text-left">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between">
                                                <span className="text-xs text-gray-400 dark:text-gray-500">Usado</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">Limite</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' :
                                                            usagePercent >= 70 ? 'bg-amber-400' :
                                                                'bg-green-500'
                                                        }`}
                                                    style={{ width: `${usagePercent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-red-500">{fmt(used)}</span>
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{fmt(card.creditLimit ?? 0)}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-50 dark:border-gray-700 pt-3">
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Fatura do mês</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{fmt(invoiceTotal)}</p>
                                        </div>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}

                {showMonthPicker && (
                    <div
                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                        onClick={e => e.target === e.currentTarget && setShowMonthPicker(false)}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 w-72 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <button onClick={() => setPickerYear(y => y - 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">←</button>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{pickerYear}</span>
                                <button onClick={() => setPickerYear(y => y + 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">→</button>
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
                                onClick={() => { setSelectedMonth(currentMonth); setShowMonthPicker(false) }}
                                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition text-center"
                            >
                                Ir para o mês atual
                            </button>
                        </div>
                    </div>
                )}

                {showCardForm && (
                    <AccountForm
                        account={editingCard}
                        onClose={() => { setEditingCard(null); setShowCardForm(false) }}
                        onAdd={addAccount}
                        onUpdate={updateAccount}
                        excludeTypes={['checking', 'savings', 'investment', 'wallet', 'benefit']}
                    />
                )}

                {confirmingDelete && (
                    <ConfirmModal
                        title="Excluir cartão?"
                        message={`"${confirmingDelete.name}" será excluído permanentemente.`}
                        onConfirm={() => { deleteAccount(confirmingDelete.id); setConfirmingDelete(null) }}
                        onClose={() => setConfirmingDelete(null)}
                    />
                )}
            </div>
        </Layout>
    )
}