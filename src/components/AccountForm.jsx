import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { NumericFormat } from 'react-number-format'
import { useSettingsContext } from '../contexts/SettingsContext'
import { ACCOUNT_TYPES, CURRENCIES, ACCOUNT_COLORS } from '../utils/constants'

export default function AccountForm({ account, onClose, onAdd, onUpdate, excludeTypes = [] }) {
    const { settings } = useSettingsContext()
    const { accounts } = useAccounts()
    const isEditing = !!account
    const availableTypes = ACCOUNT_TYPES.filter(t => !excludeTypes.includes(t.value))

    const [form, setForm] = useState({
        name: account?.name ?? '',
        type: account?.type ?? availableTypes[0]?.value ?? 'checking',
        currency: account?.currency ?? settings.defaultCurrency ?? 'BRL',
        initialBalance: account?.initialBalance ?? '',
        creditLimit: account?.creditLimit ?? '',
        closingDay: account?.closingDay ?? '',
        dueDay: account?.dueDay ?? '',
        linkedAccountId: account?.linkedAccountId ?? '',
        color: account?.color ?? ACCOUNT_COLORS[0],
    })

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    function getCurrencySymbol(currency) {
        const symbols = {
            BRL: 'R$',
            USD: '$',
            EUR: '€',
            GBP: '£',
            ARS: '$',
        }
        return symbols[currency] ?? currency
    }

    async function handleSubmit() {
        if (!form.name.trim()) return

        const data = {
            name: form.name.trim(),
            type: form.type,
            currency: form.currency,
            color: form.color,
            ...(form.type === 'credit' && {
                creditLimit: parseFloat(form.creditLimit) || 0,
                closingDay: parseInt(form.closingDay) || 1,
                dueDay: parseInt(form.dueDay) || 1,
                linkedAccountId: form.linkedAccountId || null,
            }),
            ...(form.type !== 'credit' && {
                initialBalance: parseFloat(form.initialBalance) || 0
            })
        }

        if (isEditing) {
            await onUpdate(account.id, data)
        } else {
            await onAdd(data)
        }

        onClose()
    }

    const isCredit = form.type === 'credit'

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"
    const labelClass = "text-xs text-gray-500 dark:text-gray-400"

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {isEditing ? 'Editar conta' : 'Nova conta'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Nome</label>
                        <input
                            type="text"
                            placeholder="Ex: Nubank, Poupança..."
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Tipo</label>
                            <select
                                value={form.type}
                                onChange={e => handleChange('type', e.target.value)}
                                className={inputClass}
                            >
                                {availableTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
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
                    </div>

                    {!isCredit && (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Saldo inicial</label>
                            <NumericFormat
                                value={form.initialBalance}
                                onValueChange={values => handleChange('initialBalance', values.floatValue ?? '')}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix={`${getCurrencySymbol(form.currency)} `}
                                placeholder={`${getCurrencySymbol(form.currency)} 0,00`}
                                decimalScale={2}
                                fixedDecimalScale
                                className={inputClass}
                            />
                        </div>
                    )}

                    {isCredit && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Limite do cartão</label>
                                <NumericFormat
                                    value={form.creditLimit}
                                    onValueChange={values => handleChange('creditLimit', values.floatValue ?? '')}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix={`${getCurrencySymbol(form.currency)} `}
                                    placeholder={`${getCurrencySymbol(form.currency)} 0,00`}
                                    decimalScale={2}
                                    fixedDecimalScale
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>Dia de fechamento</label>
                                    <input
                                        type="number"
                                        min="1" max="31"
                                        placeholder="Ex: 23"
                                        value={form.closingDay}
                                        onChange={e => handleChange('closingDay', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>Dia de vencimento</label>
                                    <input
                                        type="number"
                                        min="1" max="31"
                                        placeholder="Ex: 10"
                                        value={form.dueDay}
                                        onChange={e => handleChange('dueDay', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>Conta corrente vinculada</label>
                                    <select
                                        value={form.linkedAccountId}
                                        onChange={e => handleChange('linkedAccountId', e.target.value)}
                                        className={inputClass}
                                    >
                                        <option value="">Nenhuma</option>
                                        {accounts
                                            .filter(a => a.type === 'checking' || a.type === 'savings')
                                            .map(a => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Cor</label>
                        <div className="flex gap-2 flex-wrap items-center">
                            {ACCOUNT_COLORS.map(color => (
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
                                    outline: !ACCOUNT_COLORS.includes(form.color) ? `2px solid ${form.color}` : 'none',
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
                        {isEditing ? 'Salvar' : 'Criar conta'}
                    </button>
                </div>
            </div>
        </div>
    )
}