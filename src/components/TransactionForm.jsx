import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { TRANSACTION_TYPES, TRANSACTION_STATUS, PAYMENT_METHODS } from '../utils/constants'

export default function TransactionForm({ transaction, onClose, onAdd, onUpdate }) {
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const isEditing = !!transaction

    const today = new Date().toISOString().split('T')[0]

    const [form, setForm] = useState({
        type: transaction?.type ?? 'expense',
        amount: transaction?.amount ?? '',
        description: transaction?.description ?? '',
        date: transaction?.date
            ? (transaction.date.toDate?.() ?? new Date(transaction.date)).toISOString().split('T')[0]
            : today,
        accountId: transaction?.accountId ?? accounts[0]?.id ?? '',
        transferToAccountId: transaction?.transferToAccountId ?? '',
        categoryId: transaction?.categoryId ?? '',
        tags: transaction?.tags?.join(', ') ?? '',
        status: transaction?.status ?? 'pending',
        autoConfirm: transaction?.autoConfirm ?? false,
        installments: transaction?.installmentTotal ?? 1,
        paymentMethod: transaction?.paymentMethod ?? 'debit',
    })

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        if (!form.amount || !form.accountId) return

        const [year, month, day] = form.date.split('-').map(Number)
        const date = new Date(year, month - 1, day, 12, 0, 0)

        console.log('form.date:', form.date)
        console.log('date criada:', new Date(year, month - 1, day, 12, 0, 0))

        const tags = form.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)

        const base = {
            type: form.type,
            amount: parseFloat(form.amount),
            description: form.description.trim(),
            date,
            accountId: form.accountId,
            categoryId: form.categoryId || null,
            tags,
            status: form.status,
            autoConfirm: form.autoConfirm,
            paymentMethod: form.paymentMethod,
        }

        if (isEditing) {
            await onUpdate(transaction.id, { ...base })
            onClose()
            return
        }

        if (form.type === 'transfer') {
            await onAdd({ ...base, transferToAccountId: form.transferToAccountId })
            onClose()
            return
        }

        const installments = parseInt(form.installments) || 1

        if (installments > 1) {
            const installmentId = crypto.randomUUID()
            for (let i = 0; i < installments; i++) {
                const installmentDate = new Date(date)
                installmentDate.setMonth(installmentDate.getMonth() + i)
                await onAdd({
                    ...base,
                    date: installmentDate,
                    installmentId,
                    installmentNumber: i + 1,
                    installmentTotal: installments,
                    description: `${base.description} (${i + 1}/${installments})`,
                })
            }
        } else {
            await onAdd(base)
        }

        onClose()
    }

    const isTransfer = form.type === 'transfer'
    const filteredCategories = categories.filter(c =>
        c.type === form.type || c.type === 'both'
    )

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-medium text-gray-800">
                    {isEditing ? 'Editar lançamento' : 'Novo lançamento'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        {TRANSACTION_TYPES.map(t => (
                            <button
                                key={t.value}
                                onClick={() => handleChange('type', t.value)}
                                className={`flex-1 py-2 rounded-xl text-sm transition ${form.type === t.value
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Valor</label>
                            <input
                                type="number"
                                placeholder="0,00"
                                value={form.amount}
                                onChange={e => handleChange('amount', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Data</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => handleChange('date', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Descrição</label>
                        <input
                            type="text"
                            placeholder="Ex: Almoço, Salário..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Conta</label>
                        <select
                            value={form.accountId}
                            onChange={e => handleChange('accountId', e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                        >
                            <option value="">Selecione...</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    {!isTransfer && form.type === 'expense' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Meio de pagamento</label>
                            <select
                                value={form.paymentMethod}
                                onChange={e => handleChange('paymentMethod', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                            >
                                {PAYMENT_METHODS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {isTransfer && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Conta destino</label>
                            <select
                                value={form.transferToAccountId}
                                onChange={e => handleChange('transferToAccountId', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                            >
                                <option value="">Selecione...</option>
                                {accounts
                                    .filter(a => a.id !== form.accountId)
                                    .map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {!isTransfer && (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">Categoria</label>
                                <select
                                    value={form.categoryId}
                                    onChange={e => handleChange('categoryId', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                                >
                                    <option value="">Sem categoria</option>
                                    {filteredCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">Tags (separadas por vírgula)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: fixo, essencial..."
                                    value={form.tags}
                                    onChange={e => handleChange('tags', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                                />
                            </div>

                            {!isEditing && (form.paymentMethod === 'credit_install') && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-gray-500">Parcelas</label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="72"
                                        value={form.installments}
                                        onChange={e => handleChange('installments', e.target.value)}
                                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Status</label>
                        <select
                            value={form.status}
                            onChange={e => handleChange('status', e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                        >
                            {TRANSACTION_STATUS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.autoConfirm}
                            onChange={e => handleChange('autoConfirm', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-600">Confirmar automaticamente na data</span>
                    </label>
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
                        {isEditing ? 'Salvar' : 'Criar'}
                    </button>
                </div>
            </div>
        </div>
    )
}