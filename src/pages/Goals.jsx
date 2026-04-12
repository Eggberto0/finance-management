import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { useGoals } from '../hooks/useGoals'
import GoalForm from '../components/GoalForm'
import { useAccounts } from '../hooks/useAccounts'
import ConfirmModal from '../components/ConfirmModal'
import CategoryIcon from '../components/CategoryIcon'
import { calcAccountBalance } from '../utils/calcBalance'
import { useTransactions } from '../hooks/useTransactions'
import ContributionModal from '../components/ContributionModal'

function fmtGoal(value, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
}

export default function Goals() {
    const { goals, loading, addGoal, updateGoal, deleteGoal, addContribution } = useGoals()
    const { accounts } = useAccounts()
    const { transactions } = useTransactions()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [contributing, setContributing] = useState(null)
    const [confirming, setConfirming] = useState(null)

    function handleEdit(goal) {
        setEditing(goal)
        setShowForm(true)
    }

    function handleClose() {
        setEditing(null)
        setShowForm(false)
    }

    function getProgress(goal) {
        if (goal.accountId) {
            const account = accounts.find(a => a.id === goal.accountId)
            if (account) return calcAccountBalance(account, transactions)
        }
        return goal.currentAmount ?? 0
    }

    function getDaysLeft(deadline) {
        if (!deadline) return null
        const d = deadline.toDate?.() ?? new Date(deadline)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        d.setHours(0, 0, 0, 0)
        return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
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
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Cofrinhos</h2>
                    <Button onClick={() => setShowForm(true)}>Novo cofrinho</Button>
                </div>

                {goals.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhum cofrinho criado ainda.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {goals.map(goal => {
                            const current = getProgress(goal)
                            const percentage = Math.min((current / goal.targetAmount) * 100, 100)
                            const isComplete = current >= goal.targetAmount
                            const daysLeft = getDaysLeft(goal.deadline)
                            const isOverdue = daysLeft !== null && daysLeft < 0

                            return (
                                <div
                                    key={goal.id}
                                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 md:p-5 flex flex-col gap-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: goal.color + '22' }}
                                            >
                                                <CategoryIcon name={goal.icon} size={16} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{goal.name}</p>
                                                {goal.deadline && (
                                                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500' :
                                                        daysLeft <= 30 ? 'text-amber-500' :
                                                            'text-gray-400 dark:text-gray-500'
                                                        }`}>
                                                        {isOverdue
                                                            ? `Venceu há ${Math.abs(daysLeft)} dias`
                                                            : daysLeft === 0 ? 'Vence hoje'
                                                                : `${daysLeft} dias restantes`
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {isComplete && (
                                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">
                                                Completo!
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{fmtGoal(current, goal.currency ?? 'BRL')}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">de {fmtGoal(goal.targetAmount, goal.currency ?? 'BRL')}</p>
                                        </div>

                                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: isComplete ? '#1D9E75' : goal.color
                                                }}
                                            />
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {Math.round(percentage)}% concluído
                                            </span>
                                            {!isComplete && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    Faltam {fmtGoal(goal.targetAmount - current, goal.currency ?? 'BRL')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {goal.accountId && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                            Vinculado a: {accounts.find(a => a.id === goal.accountId)?.name ?? '—'}
                                        </p>
                                    )}

                                    <div className="flex gap-2 pt-1 border-t border-gray-50 dark:border-gray-700">
                                        {!goal.accountId && !isComplete && (
                                            <button
                                                onClick={() => setContributing(goal)}
                                                className="flex-1 text-xs text-center py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                            >
                                                + Adicionar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="flex-1 text-xs text-center py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => setConfirming(goal)}
                                            className="flex-1 text-xs text-center py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {showForm && (
                    <GoalForm
                        goal={editing}
                        onClose={handleClose}
                        onAdd={addGoal}
                        onUpdate={updateGoal}
                    />
                )}

                {contributing && (
                    <ContributionModal
                        goal={contributing}
                        onClose={() => setContributing(null)}
                        onAdd={addContribution}
                    />
                )}

                {confirming && (
                    <ConfirmModal
                        title="Excluir cofrinho?"
                        message={`"${confirming.name}" será excluído permanentemente.`}
                        onConfirm={() => { deleteGoal(confirming.id); setConfirming(null) }}
                        onClose={() => setConfirming(null)}
                    />
                )}
            </div>
        </Layout>
    )
}