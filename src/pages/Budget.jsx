import { useState, useMemo } from 'react'
import { useBudgets } from '../hooks/useBudgets'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import BudgetForm from '../components/BudgetForm'
import ConfirmModal from '../components/ConfirmModal'
import Layout from '../components/Layout'

export default function Budget() {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [pickerYear, setPickerYear] = useState(now.getFullYear())
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [confirming, setConfirming] = useState(null)

    const { budgets, loading, addBudget, updateBudget, deleteBudget, copyFromPreviousMonth } = useBudgets(selectedMonth)
    const { transactions } = useTransactions()
    const { categories } = useCategories()

    const [prevYear, prevMonth] = (() => {
        const [y, m] = selectedMonth.split('-').map(Number)
        const d = new Date(y, m - 2, 1)
        return [d.getFullYear(), d.getMonth() + 1]
    })()
    const previousMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
    const { budgets: previousBudgets } = useBudgets(previousMonthStr)

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

    function fmt(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const budgetsWithSpent = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number)
        return budgets.map(budget => {
            const spent = transactions
                .filter(t => {
                    if (t.categoryId !== budget.categoryId) return false
                    if (t.type !== 'expense') return false
                    if (t.status === 'cancelled') return false
                    const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
                    return date.getFullYear() === year && date.getMonth() + 1 === month
                })
                .reduce((sum, t) => sum + t.amount, 0)

            const category = categories.find(c => c.id === budget.categoryId)
            const percentage = Math.min((spent / budget.amount) * 100, 100)
            const isOver = spent > budget.amount

            return { ...budget, spent, category, percentage, isOver }
        })
    }, [budgets, transactions, categories, selectedMonth])

    const overBudgets = budgetsWithSpent.filter(b => b.isOver)
    const existingCategoryIds = budgets.map(b => b.categoryId)

    function handleEdit(budget) {
        setEditing(budget)
        setShowForm(true)
    }

    function handleClose() {
        setEditing(null)
        setShowForm(false)
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
            <div className="w-full px-18 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Orçamento</h2>
                    <div className="flex gap-3">
                        {budgets.length === 0 && previousBudgets.length > 0 && (
                            <button
                                onClick={() => copyFromPreviousMonth(previousBudgets)}
                                className="text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Copiar mês anterior
                            </button>
                        )}
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                        >
                            Novo limite
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
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

                {overBudgets.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl px-5 py-4 mb-6">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                            {overBudgets.length === 1 ? '1 categoria ultrapassou' : `${overBudgets.length} categorias ultrapassaram`} o limite
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400">
                            {overBudgets.map(b => b.category?.name).join(', ')}
                        </p>
                    </div>
                )}

                {budgetsWithSpent.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhum limite definido para esse mês.
                        {previousBudgets.length > 0 && (
                            <p className="mt-2">
                                <button
                                    onClick={() => copyFromPreviousMonth(previousBudgets)}
                                    className="text-gray-600 dark:text-gray-400 underline"
                                >
                                    Copiar do mês anterior
                                </button>
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {budgetsWithSpent.map(budget => (
                            <div
                                key={budget.id}
                                className={`bg-white dark:bg-gray-800 border rounded-2xl px-5 py-4 ${budget.isOver
                                        ? 'border-red-200 dark:border-red-800'
                                        : 'border-gray-100 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {budget.category && (
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                                style={{ backgroundColor: budget.category.color + '22' }}
                                            >
                                                {budget.category.icon}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                {budget.category?.name ?? '—'}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                {fmt(budget.spent)} de {fmt(budget.amount)}
                                                {budget.repeat && ' · Repete todo mês'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <p className={`text-sm font-medium ${budget.isOver ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {budget.isOver
                                                ? `+${fmt(budget.spent - budget.amount)} acima`
                                                : `${fmt(budget.amount - budget.spent)} restante`
                                            }
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleEdit(budget)}
                                                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setConfirming(budget)}
                                                className="text-xs text-red-400 hover:text-red-600 transition"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${budget.isOver ? 'bg-red-500' :
                                                budget.percentage >= 80 ? 'bg-amber-400' :
                                                    'bg-green-500'
                                            }`}
                                        style={{ width: `${budget.percentage}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">0%</span>
                                    <span className={`text-xs font-medium ${budget.isOver ? 'text-red-500' :
                                            budget.percentage >= 80 ? 'text-amber-500' :
                                                'text-gray-400 dark:text-gray-500'
                                        }`}>
                                        {Math.round(budget.percentage)}%
                                    </span>
                                </div>
                            </div>
                        ))}
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

                {confirming && (
                    <ConfirmModal
                        title="Excluir limite?"
                        message={`O limite de "${confirming.category?.name}" será excluído.`}
                        onConfirm={() => { deleteBudget(confirming.id); setConfirming(null) }}
                        onClose={() => setConfirming(null)}
                    />
                )}

                {showForm && (
                    <BudgetForm
                        budget={editing}
                        onClose={handleClose}
                        onAdd={addBudget}
                        onUpdate={updateBudget}
                        existingCategoryIds={existingCategoryIds}
                    />
                )}
            </div>
        </Layout>
    )
}