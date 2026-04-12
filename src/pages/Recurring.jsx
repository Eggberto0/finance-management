import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { WEEKDAYS } from '../utils/constants'
import { useAccounts } from '../hooks/useAccounts'
import { useRecurring } from '../hooks/useRecurring'
import CategoryIcon from '../components/CategoryIcon'
import ConfirmModal from '../components/ConfirmModal'
import { useCategories } from '../hooks/useCategories'
import RecurringForm from '../components/RecurringForm'

function dayRuleLabel(dayRule) {
    if (!dayRule) return '—'
    const { type, day, weekday } = dayRule
    if (type === 'fixed') return `Todo dia ${day}`
    if (type === 'lastBusinessDay') return 'Último dia útil'
    if (type === 'nthBusinessDay') return `${day}º dia útil`
    if (type === 'nthWeekday') {
        const wdLabel = WEEKDAYS.find(w => w.value === parseInt(weekday))?.label ?? ''
        return `${day}ª ${wdLabel}`
    }
    return '—'
}

const CURRENCY_SYMBOLS = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£', ARS: '$' }

export default function Recurring() {
    const { rules, loading, addRule, updateRule, deleteRule } = useRecurring()
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [confirming, setConfirming] = useState(null)

    function handleEdit(rule) { setEditing(rule); setShowForm(true) }
    function handleClose() { setEditing(null); setShowForm(false) }
    function getAccountName(id) { return accounts.find(a => a.id === id)?.name ?? '—' }
    function getCategory(id) { return categories.find(c => c.id === id) }

    function getAccountCurrency(accountId) {
        const account = accounts.find(a => a.id === accountId)
        return account?.currency ?? 'BRL'
    }

    function fmt(amount, accountId) {
        const currency = getAccountCurrency(accountId)
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount)
    }

    const incomeRules = rules.filter(r => r.type === 'income')
    const expenseRules = rules.filter(r => r.type === 'expense')

    function RuleCard({ rule }) {
        const category = getCategory(rule.categoryId)
        return (
            <div className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-4 flex flex-col gap-3 ${!rule.active ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                    {category ? (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color + '22' }}>
                            <CategoryIcon name={category.icon} size={14} />
                        </div>
                    ) : (
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{rule.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                            {getAccountName(rule.accountId)} · {dayRuleLabel(rule.dayRule)}
                            {!rule.active && ' · Inativa'}
                        </p>
                    </div>
                    <p className={`text-sm font-medium flex-shrink-0 ${rule.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {fmt(rule.baseAmount, rule.accountId)}
                    </p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                    <button
                        onClick={() => handleEdit(rule)}
                        className="flex-1 text-xs text-center py-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => setConfirming(rule)}
                        className="flex-1 text-xs text-center py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Carregando...
            </div>
        )
    }

    return (
        <Layout>
            <div className="w-full px-4 md:px-18 py-6 md:py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Recorrentes</h2>
                    <Button onClick={() => setShowForm(true)}>Novo recorrente</Button>
                </div>

                {rules.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhum lançamento recorrente cadastrado ainda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {incomeRules.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Receitas</p>
                                {incomeRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
                            </div>
                        )}
                        {expenseRules.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Despesas</p>
                                {expenseRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
                            </div>
                        )}
                    </div>
                )}

                {confirming && (
                    <ConfirmModal
                        title="Excluir recorrente?"
                        message={`"${confirming.description}" e todas as instâncias futuras serão removidas.`}
                        onConfirm={() => { deleteRule(confirming.id); setConfirming(null) }}
                        onClose={() => setConfirming(null)}
                    />
                )}

                {showForm && (
                    <RecurringForm
                        rule={editing}
                        onClose={handleClose}
                        onAdd={addRule}
                        onUpdate={updateRule}
                    />
                )}
            </div>
        </Layout>
    )
}