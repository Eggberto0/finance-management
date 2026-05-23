import { useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { useAccounts } from '../hooks/useAccounts'

const CURRENCY_SYMBOLS = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£', ARS: '$' }

export default function DebtPaymentModal({ debt, onClose, onAdd }) {
    const { accounts } = useAccounts()
    const currencySymbol = CURRENCY_SYMBOLS[debt.currency] ?? debt.currency
    const [amount, setAmount] = useState('')
    const [notes, setNotes] = useState('')
    const [accountId, setAccountId] = useState(debt.linkedAccountId ?? '')

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 transition"

    async function handleSubmit() {
        if (!amount) return
        const value = parseFloat(amount)
        const newBalance = Math.max(debt.currentBalance - value, 0)
        await onAdd(debt.id, {
            amount: value,
            notes: notes.trim(),
            accountId: accountId || null,
        }, newBalance)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6 flex flex-col gap-5">
                <div>
                    <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">Registrar pagamento</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{debt.name}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Saldo devedor</span>
                    <span className="text-sm font-medium text-red-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: debt.currency }).format(debt.currentBalance)}
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Valor pago</label>
                        <NumericFormat
                            value={amount}
                            onValueChange={values => setAmount(values.floatValue ?? '')}
                            thousandSeparator="." decimalSeparator=","
                            prefix={`${currencySymbol} `} decimalScale={2} fixedDecimalScale
                            placeholder={`${currencySymbol} 0,00`} autoFocus
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Débitar de qual conta? (opcional)</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className={inputClass}>
                            <option value="">Só registrar — sem débito em conta</option>
                            {accounts.filter(a => a.type !== 'credit').map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        {accountId && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">Um lançamento de despesa será criado automaticamente.</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Observação (opcional)</label>
                        <input type="text" placeholder="Ex: Parcela de abril..." value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-4 py-2">Cancelar</button>
                    <button onClick={handleSubmit} className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-5 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition">Registrar</button>
                </div>
            </div>
        </div>
    )
}