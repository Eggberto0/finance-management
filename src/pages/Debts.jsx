import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { useDebts } from '../hooks/useDebts'
import DebtForm from '../components/DebtForm'
import ConfirmModal from '../components/ConfirmModal'
import { SkeletonList } from '../components/Skeleton'
import DebtPaymentModal from '../components/DebtPaymentModal'
import { useSettingsContext } from '../contexts/SettingsContext'

const CATEGORY_LABELS = {
    loan: 'Empréstimo',
    financing: 'Financiamento',
    personal: 'Dívida pessoal',
    other: 'Outro',
}

const FREQUENCY_LABELS = {
    daily: 'dia', weekly: 'semana', monthly: 'mês', yearly: 'ano'
}

function getDaysUntil(dueDate) {
    if (!dueDate) return null
    const d = dueDate.toDate?.() ?? new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    d.setHours(0, 0, 0, 0)
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
}

export default function Debts() {
    const { debts, loading, addDebt, updateDebt, deleteDebt, addPayment } = useDebts()
    const { settings } = useSettingsContext()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [paying, setPaying] = useState(null)
    const [confirming, setConfirming] = useState(null)
    const [expandedId, setExpandedId] = useState(null)

    function fmt(value, currency) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency ?? defaultCurrency }).format(value)
    }

    function handleEdit(debt) { setEditing(debt); setShowForm(true) }
    function handleClose() { setEditing(null); setShowForm(false) }

    const activeDebts = debts.filter(d => d.currentBalance > 0)
    const paidDebts = debts.filter(d => d.currentBalance <= 0)

    const debtsByCurrency = activeDebts.reduce((acc, d) => {
        acc[d.currency] = (acc[d.currency] ?? 0) + d.currentBalance
        return acc
    }, {})

    if (loading) return (
        <Layout>
            <div className="w-full px-4 md:px-18 py-6 md:py-8">
                <SkeletonList count={3} />
            </div>
        </Layout>
    )

    return (
        <Layout>
            <div className="w-full px-4 md:px-18 py-6 md:py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Dívidas</h2>
                    <Button onClick={() => setShowForm(true)}>Nova dívida</Button>
                </div>

                {activeDebts.length > 0 && (
                    <div className="rounded-2xl px-5 py-4 mb-6" style={{ backgroundColor: 'var(--accent)' }}>
                        <p className="text-xs mb-2" style={{ color: 'var(--accent-light)' }}>Total em dívidas</p>
                        <div className="flex flex-col gap-0.5">
                            {Object.entries(debtsByCurrency).map(([currency, total]) => (
                                <p key={currency} className="text-2xl font-medium text-white">
                                    {fmt(total, currency)}
                                </p>
                            ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--accent-light)' }}>
                            {activeDebts.length} dívida{activeDebts.length !== 1 ? 's' : ''} ativa{activeDebts.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {debts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhuma dívida cadastrada ainda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {activeDebts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Ativas</p>
                                {activeDebts.map(debt => {
                                    const paid = debt.totalAmount - debt.currentBalance
                                    const percentage = Math.min((paid / debt.totalAmount) * 100, 100)
                                    const daysUntil = getDaysUntil(debt.dueDate)
                                    const isOverdue = daysUntil !== null && daysUntil < 0
                                    const isExpanded = expandedId === debt.id

                                    return (
                                        <div key={debt.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-4 flex flex-col gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{debt.name}</p>
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                                            {CATEGORY_LABELS[debt.category]}
                                                        </span>
                                                        {debt.interestRule?.enabled && (
                                                            <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                                {debt.interestRule.type === 'fixed'
                                                                    ? `+${fmt(debt.interestRule.rate, debt.currency)}/${FREQUENCY_LABELS[debt.interestRule.frequency]}`
                                                                    : `+${debt.interestRule.rate}%/${FREQUENCY_LABELS[debt.interestRule.frequency]}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                        Credor: {debt.creditor}
                                                        {daysUntil !== null && (
                                                            <span className={`ml-2 ${isOverdue ? 'text-red-500' : daysUntil <= 30 ? 'text-amber-500' : ''}`}>
                                                                · {isOverdue ? `Venceu há ${Math.abs(daysUntil)} dias` : daysUntil === 0 ? 'Vence hoje' : `Vence em ${daysUntil} dias`}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-medium text-red-500">{fmt(debt.currentBalance, debt.currency)}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500">de {fmt(debt.totalAmount, debt.currency)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${percentage}%` }} />
                                                </div>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{Math.round(percentage)}% pago</p>
                                            </div>

                                            {isExpanded && debt.payments?.length > 0 && (
                                                <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 border-b border-gray-100 dark:border-gray-700">Pagamentos</p>
                                                    {debt.payments.slice().reverse().map(p => {
                                                        const d = p.date?.toDate?.() ?? new Date(p.date?.seconds * 1000)
                                                        return (
                                                            <div key={p.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                                                                <div>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{p.notes || 'Pagamento'}</p>
                                                                    <p className="text-xs text-gray-400 dark:text-gray-500">{d.toLocaleDateString('pt-BR')}</p>
                                                                </div>
                                                                <p className="text-xs font-medium text-green-600">{fmt(p.amount, debt.currency)}</p>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                                                <button
                                                    onClick={() => setPaying(debt)}
                                                    className="flex-1 text-xs text-center py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 transition font-medium"
                                                >
                                                    Pagar
                                                </button>
                                                {debt.payments?.length > 0 && (
                                                    <button
                                                        onClick={() => setExpandedId(isExpanded ? null : debt.id)}
                                                        className="flex-1 text-xs text-center py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                                    >
                                                        {isExpanded ? 'Ocultar' : `Ver ${debt.payments.length} pagamento${debt.payments.length !== 1 ? 's' : ''}`}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(debt)}
                                                    className="flex-1 text-xs text-center py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => setConfirming(debt)}
                                                    className="flex-1 text-xs text-center py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {paidDebts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Quitadas</p>
                                {paidDebts.map(debt => (
                                    <div key={debt.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-4 flex flex-col gap-3 opacity-60">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{debt.name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{debt.creditor} · {fmt(debt.totalAmount, debt.currency)}</p>
                                            </div>
                                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">Quitada</span>
                                        </div>
                                        <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                                            <button onClick={() => setConfirming(debt)} className="flex-1 text-xs text-center py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 transition">
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {showForm && <DebtForm debt={editing} onClose={handleClose} onAdd={addDebt} onUpdate={updateDebt} />}
                {paying && <DebtPaymentModal debt={paying} onClose={() => setPaying(null)} onAdd={addPayment} />}
                {confirming && (
                    <ConfirmModal
                        title="Excluir dívida?"
                        message={`"${confirming.name}" será excluída permanentemente.`}
                        onConfirm={() => { deleteDebt(confirming.id); setConfirming(null) }}
                        onClose={() => setConfirming(null)}
                    />
                )}
            </div>
        </Layout>
    )
}