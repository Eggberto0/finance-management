import { useState } from 'react'
import Layout from '../components/Layout'
import { useAccounts } from '../hooks/useAccounts'
import { useRecurring } from '../hooks/useRecurring'
import { useCategories } from '../hooks/useCategories'
import RecurringForm from '../components/RecurringForm'
import { TRANSACTION_TYPES, DAY_RULE_TYPES, WEEKDAYS } from '../utils/constants'

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

export default function Recurring() {
    const { rules, loading, addRule, updateRule, deleteRule } = useRecurring()
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)

    function handleEdit(rule) {
        setEditing(rule)
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

    const incomeRules = rules.filter(r => r.type === 'income')
    const expenseRules = rules.filter(r => r.type === 'expense')

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
                Carregando...
            </div>
        )
    }

    function RuleCard({ rule }) {
        const category = getCategory(rule.categoryId)
        return (
            <div className={`bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 ${!rule.active ? 'opacity-50' : ''}`}>
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
                        <p className="text-sm font-medium text-gray-800">{rule.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {getAccountName(rule.accountId)} · {dayRuleLabel(rule.dayRule)}
                            {!rule.active && ' · Inativa'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                    <p className={`text-sm font-medium ${rule.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency', currency: 'BRL'
                        }).format(rule.baseAmount)}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleEdit(rule)}
                            className="text-xs text-gray-400 hover:text-gray-600 transition"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => deleteRule(rule.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Layout>
            <div className="w-full px-18 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800">Recorrentes</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition"
                    >
                        Novo recorrente
                    </button>
                </div>

                {rules.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">
                        Nenhum lançamento recorrente cadastrado ainda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {incomeRules.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Receitas</p>
                                {incomeRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
                            </div>
                        )}
                        {expenseRules.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Despesas</p>
                                {expenseRules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
                            </div>
                        )}
                    </div>
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