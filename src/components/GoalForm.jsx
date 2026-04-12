import { useState } from 'react'
import CategoryIcon from './CategoryIcon'
import { useAccounts } from '../hooks/useAccounts'
import { NumericFormat } from 'react-number-format'
import { useSpinner } from '../contexts/SpinnerContext'
import { useSettingsContext } from '../contexts/SettingsContext'

const GOAL_ICONS = [
    'Target', 'Home', 'Plane', 'Car', 'Smartphone', 'Laptop',
    'GraduationCap', 'Heart', 'Umbrella', 'PawPrint', 'DollarSign', 'Gamepad2',
]

const COLORS = ['#0de238', '#11e3d5', '#e53e07', '#8902e2', '#2a34ff', '#e4d019', '#e61476', '#c30000']

const CURRENCY_SYMBOLS = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£', ARS: '$' }

const CURRENCIES = [
    { value: 'BRL', label: 'R$ Real (BRL)' },
    { value: 'USD', label: 'US$ Dólar (USD)' },
    { value: 'EUR', label: '€ Euro (EUR)' },
    { value: 'GBP', label: '£ Libra (GBP)' },
    { value: 'ARS', label: '$ Peso (ARS)' },
]

export default function GoalForm({ goal, onClose, onAdd, onUpdate }) {
    const { accounts } = useAccounts()
    const { settings } = useSettingsContext()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'
    const isEditing = !!goal
    const { withSpinner } = useSpinner()

    const [form, setForm] = useState({
        name: goal?.name ?? '',
        targetAmount: goal?.targetAmount ?? '',
        currentAmount: goal?.currentAmount ?? 0,
        currency: goal?.currency ?? defaultCurrency,
        deadline: goal?.deadline
            ? (goal.deadline.toDate?.() ?? new Date(goal.deadline)).toISOString().split('T')[0]
            : '',
        accountId: goal?.accountId ?? '',
        color: goal?.color ?? '#0de238',
        icon: goal?.icon ?? 'Target',
    })

    const currencySymbol = CURRENCY_SYMBOLS[form.currency] ?? form.currency

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        await withSpinner(async () => {
            if (!form.name.trim() || !form.targetAmount) return

            const data = {
                name: form.name.trim(),
                targetAmount: parseFloat(form.targetAmount),
                currentAmount: parseFloat(form.currentAmount) || 0,
                currency: form.currency,
                deadline: form.deadline
                    ? (() => { const [y, m, d] = form.deadline.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0) })()
                    : null,
                accountId: form.accountId || null,
                color: form.color,
                icon: form.icon,
            }

            if (isEditing) {
                await onUpdate(goal.id, data)
            } else {
                await onAdd(data)
            }

            onClose()
        })
    }

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"
    const labelClass = "text-xs text-gray-500 dark:text-gray-400"

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {isEditing ? 'Editar cofrinho' : 'Novo cofrinho'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Ícone</label>
                        <div className="flex gap-2 flex-wrap">
                            {GOAL_ICONS.map(icon => (
                                <button
                                    key={icon}
                                    onClick={() => handleChange('icon', icon)}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${form.icon === icon
                                        ? 'bg-gray-900 dark:bg-gray-600 text-white ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <CategoryIcon name={icon} size={16} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Nome</label>
                        <input
                            type="text"
                            placeholder="Ex: Viagem para Europa, Novo iPhone..."
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Moeda</label>
                        <select
                            value={form.currency}
                            onChange={e => handleChange('currency', e.target.value)}
                            className={inputClass}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Valor alvo</label>
                            <NumericFormat
                                value={form.targetAmount}
                                onValueChange={values => handleChange('targetAmount', values.floatValue ?? '')}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix={`${currencySymbol} `}
                                decimalScale={2}
                                fixedDecimalScale
                                placeholder={`${currencySymbol} 0,00`}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Prazo (opcional)</label>
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={e => handleChange('deadline', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {!form.accountId && (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Valor guardado até agora</label>
                            <NumericFormat
                                value={form.currentAmount}
                                onValueChange={values => handleChange('currentAmount', values.floatValue ?? 0)}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix={`${currencySymbol} `}
                                decimalScale={2}
                                fixedDecimalScale
                                placeholder={`${currencySymbol} 0,00`}
                                className={inputClass}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Conta vinculada (opcional)</label>
                        <select
                            value={form.accountId}
                            onChange={e => handleChange('accountId', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Sem vínculo — aporte manual</option>
                            {accounts
                                .filter(a => a.type === 'savings' || a.type === 'investment' || a.type === 'wallet')
                                .map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                        </select>
                        {form.accountId && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                O progresso será calculado automaticamente pelo saldo da conta.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Cor</label>
                        <div className="flex gap-2 flex-wrap items-center">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleChange('color', color)}
                                    className="w-7 h-7 rounded-full transition"
                                    style={{
                                        backgroundColor: color,
                                        outline: form.color === color ? `2px solid ${color}` : 'none',
                                        outlineOffset: '2px',
                                    }}
                                />
                            ))}
                            <label
                                className="w-7 h-7 rounded-full cursor-pointer overflow-hidden relative"
                                style={{
                                    background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                                    outline: !COLORS.includes(form.color) ? `2px solid ${form.color}` : 'none',
                                    outlineOffset: '2px',
                                }}
                            >
                                <input
                                    type="color"
                                    value={form.color}
                                    onInput={e => handleChange('color', e.target.value)}
                                    onChange={e => handleChange('color', e.target.value)}
                                    className="absolute opacity-0 w-0 h-0"
                                />
                            </label>
                        </div>
                    </div>
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
                        {isEditing ? 'Salvar' : 'Criar cofrinho'}
                    </button>
                </div>
            </div>
        </div>
    )
}