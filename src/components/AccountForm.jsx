import { useState } from 'react'
import { ACCOUNT_TYPES, CURRENCIES, ACCOUNT_COLORS } from '../utils/constants'

export default function AccountForm({ account, onClose, onAdd, onUpdate }) {
    const isEditing = !!account

    const [form, setForm] = useState({
        name: account?.name ?? '',
        type: account?.type ?? 'checking',
        currency: account?.currency ?? 'BRL',
        initialBalance: account?.initialBalance ?? '',
        creditLimit: account?.creditLimit ?? '',
        closingDay: account?.closingDay ?? '',
        dueDay: account?.dueDay ?? '',
        color: account?.color ?? ACCOUNT_COLORS[0],
    })

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        if (!form.name.trim()) return

        const data = {
            name: form.name.trim(),
            type: form.type,
            currency: form.currency,
            color: form.color,
            ...(form.type !== 'credit' && {
                initialBalance: parseFloat(form.initialBalance) || 0
            }),
            ...(form.type === 'credit' && {
                creditLimit: parseFloat(form.creditLimit) || 0,
                closingDay: parseInt(form.closingDay) || 1,
                dueDay: parseInt(form.dueDay) || 1,
            }),
        }

        if (isEditing) {
            await onUpdate(account.id, data)
        } else {
            await onAdd(data)
        }

        onClose()
    }

    const isCredit = form.type === 'credit'

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5">
                <h3 className="text-base font-medium text-gray-800">
                    {isEditing ? 'Editar conta' : 'Nova conta'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Nome</label>
                        <input
                            type="text"
                            placeholder="Ex: Nubank, Poupança..."
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Tipo</label>
                            <select
                                value={form.type}
                                onChange={e => handleChange('type', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                            >
                                {ACCOUNT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Moeda</label>
                            <select
                                value={form.currency}
                                onChange={e => handleChange('currency', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                            >
                                {CURRENCIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!isCredit && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Saldo inicial</label>
                            <input
                                type="number"
                                placeholder="0,00"
                                value={form.initialBalance}
                                onChange={e => handleChange('initialBalance', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                            />
                        </div>
                    )}

                    {isCredit && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">Limite do cartão</label>
                                <input
                                    type="number"
                                    placeholder="0,00"
                                    value={form.creditLimit}
                                    onChange={e => handleChange('creditLimit', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-gray-500">Dia de fechamento</label>
                                    <input
                                        type="number"
                                        min="1" max="31"
                                        placeholder="Ex: 23"
                                        value={form.closingDay}
                                        onChange={e => handleChange('closingDay', e.target.value)}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-gray-500">Dia de vencimento</label>
                                    <input
                                        type="number"
                                        min="1" max="31"
                                        placeholder="Ex: 10"
                                        value={form.dueDay}
                                        onChange={e => handleChange('dueDay', e.target.value)}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Cor</label>
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

                            <label className="w-7 h-7 rounded-full cursor-pointer overflow-hidden relative"
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
                        className="text-sm text-gray-400 hover:text-gray-600 transition px-4 py-2"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-gray-900 text-white text-sm px-5 py-2 rounded-xl hover:bg-gray-700 transition"
                    >
                        {isEditing ? 'Salvar' : 'Criar conta'}
                    </button>
                </div>
            </div>
        </div>
    )
}