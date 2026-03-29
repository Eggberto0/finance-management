import { useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { useCategories } from '../hooks/useCategories'

export default function BudgetForm({ budget, onClose, onAdd, onUpdate, existingCategoryIds }) {
    const { categories } = useCategories()
    const isEditing = !!budget

    const [form, setForm] = useState({
        categoryId: budget?.categoryId ?? '',
        amount: budget?.amount ?? '',
        repeat: budget?.repeat ?? false,
    })

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        if (!form.categoryId || !form.amount) return
        const data = {
            categoryId: form.categoryId,
            amount: parseFloat(form.amount),
            repeat: form.repeat,
        }
        if (isEditing) {
            await onUpdate(budget.id, data)
        } else {
            await onAdd(data)
        }
        onClose()
    }

    const availableCategories = categories.filter(c =>
        c.type === 'expense' || c.type === 'both'
    ).filter(c =>
        isEditing ? true : !existingCategoryIds.includes(c.id)
    )

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6 flex flex-col gap-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {isEditing ? 'Editar limite' : 'Novo limite'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Categoria</label>
                        <select
                            value={form.categoryId}
                            onChange={e => handleChange('categoryId', e.target.value)}
                            disabled={isEditing}
                            className={`${inputClass} disabled:opacity-50`}
                        >
                            <option value="">Selecione...</option>
                            {availableCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Limite mensal</label>
                        <NumericFormat
                            value={form.amount}
                            onValueChange={values => handleChange('amount', values.floatValue ?? '')}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            decimalScale={2}
                            fixedDecimalScale
                            placeholder="R$ 0,00"
                            className={inputClass}
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.repeat}
                            onChange={e => handleChange('repeat', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Repetir automaticamente todo mês</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-4 py-2"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-5 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                    >
                        {isEditing ? 'Salvar' : 'Criar'}
                    </button>
                </div>
            </div>
        </div>
    )
}