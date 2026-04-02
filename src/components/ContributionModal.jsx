import { useState } from 'react'
import { NumericFormat } from 'react-number-format'

export default function ContributionModal({ goal, onClose, onAdd }) {
    const [amount, setAmount] = useState('')

    async function handleSubmit() {
        if (!amount) return
        await onAdd(goal.id, parseFloat(amount))
        onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6 flex flex-col gap-5">
                <div>
                    <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                        Adicionar ao cofrinho
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1"><CategoryIcon name={goal.icon} size={16} /> {goal.name}</p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Valor</label>
                    <NumericFormat
                        value={amount}
                        onValueChange={values => setAmount(values.floatValue ?? '')}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        placeholder="R$ 0,00"
                        autoFocus
                        className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 transition"
                    />
                </div>

                <div className="flex justify-end gap-3">
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
                        Adicionar
                    </button>
                </div>
            </div>
        </div>
    )
}