import { useState, useEffect } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { NumericFormat } from 'react-number-format'
import { useCategories } from '../hooks/useCategories'
import { calcInstallmentDates } from '../utils/creditCardDates'
import { useSettingsContext } from '../contexts/SettingsContext'
import { TRANSACTION_TYPES, TRANSACTION_STATUS, PAYMENT_METHODS } from '../utils/constants'

export default function TransactionForm({
    transaction,
    onClose,
    onAdd,
    onUpdate,
    cardMode = false,
    defaultAccountId = '',
    cardCurrency }) {
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const isEditing = !!transaction

    const CURRENCY_SYMBOLS = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£', ARS: '$' }

    const today = new Date().toISOString().split('T')[0]

    const [form, setForm] = useState({
        type: transaction?.type ?? 'expense',
        amount: transaction?.amount ?? '',
        description: transaction?.description ?? '',
        date: transaction?.date
            ? (transaction.date.toDate?.() ?? new Date(transaction.date)).toISOString().split('T')[0]
            : today,
        accountId: transaction?.accountId ?? defaultAccountId ?? accounts[0]?.id ?? '',
        transferToAccountId: transaction?.transferToAccountId ?? '',
        categoryId: transaction?.categoryId ?? '',
        tags: transaction?.tags?.join(', ') ?? '',
        status: transaction?.status ?? 'pending',
        autoConfirm: transaction?.autoConfirm ?? false,
        installments: transaction?.installmentTotal ?? 1,
        installmentAmount: transaction?.amount ?? '',  // valor por parcela
        paymentMethod: transaction?.paymentMethod ?? 'debit',
        confirmedAt: transaction?.confirmedAt
            ? (transaction.confirmedAt.toDate?.() ?? new Date(transaction.confirmedAt)).toISOString().split('T')[0]
            : '',
        isHistorical: transaction?.isHistorical ?? false,
        originalCurrency: transaction?.originalCurrency ?? '',
        originalAmount: transaction?.originalAmount ?? '',
    })

    const selectedAccount = accounts.find(a => a.id === form.accountId)
    const isCredit = selectedAccount?.type === 'credit'

    const { settings } = useSettingsContext()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'

    const activeCurrency = cardMode && cardCurrency
        ? cardCurrency
        : selectedAccount?.currency ?? defaultCurrency
    const currencySymbol = CURRENCY_SYMBOLS[activeCurrency] ?? activeCurrency

    useEffect(() => {
        if (isCredit) {
            setForm(prev => ({
                ...prev,
                paymentMethod: prev.installments > 1 ? 'credit_install' : 'credit_single',
                autoConfirm: true,
            }))
        }
    }, [form.accountId])

    useEffect(() => {
        if (cardMode) {
            setForm(prev => ({
                ...prev,
                paymentMethod: 'credit_single',
            }))
        }
    }, [cardMode])

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const installments = parseInt(form.installments) || 1
    const isInstallment = form.paymentMethod === 'credit_install' && installments > 1

    // Se parcelado: valor por parcela é form.installmentAmount, total é calculado
    // Se à vista: form.amount é o valor total
    const installmentAmount = parseFloat(form.installmentAmount) || 0
    const totalAmount = isInstallment ? installmentAmount * installments : (parseFloat(form.amount) || 0)

    async function handleSubmit() {
        if (isInstallment) {
            if (!form.installmentAmount || !form.accountId) return
        } else {
            if (!form.amount || !form.accountId) return
        }

        const [year, month, day] = form.date.split('-').map(Number)
        const date = new Date(year, month - 1, day, 12, 0, 0)
        const tags = (form.tags || '').split(',').map(t => t.trim()).filter(Boolean)

        const base = {
            type: form.type,
            amount: isInstallment ? installmentAmount : parseFloat(form.amount),
            description: form.description.trim(),
            date,
            accountId: form.accountId,
            categoryId: form.categoryId || null,
            tags,
            status: form.status,
            autoConfirm: form.autoConfirm,
            paymentMethod: form.paymentMethod,
            confirmedAt: form.status === 'confirmed'
                ? form.confirmedAt
                    ? (() => { const [y, m, d] = form.confirmedAt.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0) })()
                    : new Date()
                : null,
            isHistorical: form.isHistorical,
            ...(transaction?.purchaseDate && { purchaseDate: transaction.purchaseDate }),
            originalCurrency: form.originalCurrency || null,
            originalAmount: form.originalAmount ? parseFloat(form.originalAmount) : null,
        }

        if (isEditing) {
            const todayDate = new Date()
            todayDate.setHours(23, 59, 59, 999)
            const dateOnly = new Date(year, month - 1, day)
            const updatedStatus =
                base.status === 'confirmed' && dateOnly > todayDate ? 'pending' : base.status
            await onUpdate(transaction.id, { ...base, status: updatedStatus })
            onClose()
            return
        }

        if (form.type === 'transfer') {
            await onAdd({ ...base, transferToAccountId: form.transferToAccountId })
            onClose()
            return
        }

        if (isInstallment) {
            const installmentId = crypto.randomUUID()
            let installmentDates
            if (isCredit && selectedAccount?.closingDay && selectedAccount?.dueDay) {
                const purchaseDate = new Date(year, month - 1, day)
                installmentDates = calcInstallmentDates(
                    purchaseDate,
                    selectedAccount.closingDay,
                    selectedAccount.dueDay,
                    installments
                )
            }

            for (let i = 0; i < installments; i++) {
                const installmentDate = installmentDates
                    ? installmentDates[i]
                    : new Date(year, month - 1 + i, day, 12, 0, 0)

                await onAdd({
                    ...base,
                    amount: installmentAmount,
                    date: installmentDate,
                    purchaseDate: date,
                    installmentId,
                    installmentNumber: i + 1,
                    installmentTotal: installments,
                    description: `${base.description} (${i + 1}/${installments})`,
                })
            }
        } else {
            if (isCredit && selectedAccount?.closingDay && selectedAccount?.dueDay) {
                const purchaseDate = new Date(year, month - 1, day)
                const dueDates = calcInstallmentDates(
                    purchaseDate,
                    selectedAccount.closingDay,
                    selectedAccount.dueDay,
                    1
                )
                await onAdd({ ...base, date: dueDates[0], purchaseDate: date })
            } else {
                await onAdd(base)
            }
        }

        onClose()
    }

    const isTransfer = form.type === 'transfer'
    const filteredCategories = categories.filter(c =>
        c.type === form.type || c.type === 'both'
    )

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"
    const labelClass = "text-xs text-gray-500 dark:text-gray-400"

    const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: activeCurrency }).format(v)

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {isEditing ? 'Editar lançamento' : 'Novo lançamento'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        {TRANSACTION_TYPES
                            .filter(t => cardMode ? t.value !== 'transfer' : true)
                            .map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => handleChange('type', t.value)}
                                    className={`flex-1 py-2 rounded-xl text-sm transition ${form.type === t.value
                                        ? 'bg-gray-900 dark:bg-gray-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                    </div>

                    {/* Valor — muda conforme parcelado ou não */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>
                                {isInstallment ? 'Valor por parcela' : 'Valor'}
                            </label>
                            <NumericFormat
                                value={isInstallment ? form.installmentAmount : form.amount}
                                onValueChange={values => handleChange(
                                    isInstallment ? 'installmentAmount' : 'amount',
                                    values.floatValue ?? ''
                                )}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix={`${currencySymbol} `}
                                placeholder={`${currencySymbol} 0,00`}
                                decimalScale={2}
                                fixedDecimalScale
                                className={inputClass}
                            />
                            {isInstallment && installmentAmount > 0 && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Total: {fmt(totalAmount)}
                                    {isCredit && selectedAccount?.closingDay && selectedAccount?.dueDay && (() => {
                                        const [y, m, d] = form.date.split('-').map(Number)
                                        const dates = calcInstallmentDates(
                                            new Date(y, m - 1, d),
                                            selectedAccount.closingDay,
                                            selectedAccount.dueDay,
                                            installments
                                        )
                                        return ` · 1ª parcela em ${dates[0].toLocaleDateString('pt-BR')}`
                                    })()}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Data</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => handleChange('date', e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Descrição</label>
                        <input
                            type="text"
                            placeholder="Ex: Almoço, Salário..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Valor em moeda estrangeira (opcional)</label>
                        <div className="flex gap-2">
                            <select
                                value={form.originalCurrency}
                                onChange={e => handleChange('originalCurrency', e.target.value)}
                                className={`${inputClass} w-32 flex-shrink-0`}
                            >
                                <option value="">—</option>
                                {['BRL', 'USD', 'EUR', 'GBP', 'ARS']
                                    .filter(c => c !== activeCurrency)
                                    .map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                            </select>
                            {form.originalCurrency && (
                                <NumericFormat
                                    value={form.originalAmount}
                                    onValueChange={values => handleChange('originalAmount', values.floatValue ?? '')}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                    placeholder="0,00"
                                    className={`${inputClass} flex-1`}
                                />
                            )}
                        </div>
                    </div>

                    {!cardMode && (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Conta</label>
                            <select
                                value={form.accountId}
                                onChange={e => handleChange('accountId', e.target.value)}
                                className={inputClass}
                            >
                                <option value="">Selecione...</option>
                                {accounts
                                    .filter(a => a.type !== 'credit')
                                    .map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {!isTransfer && form.type === 'expense' && (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Meio de pagamento</label>
                            <select
                                value={form.paymentMethod}
                                onChange={e => handleChange('paymentMethod', e.target.value)}
                                className={inputClass}
                            >
                                {PAYMENT_METHODS
                                    .filter(p => cardMode
                                        ? p.value === 'credit_single' || p.value === 'credit_install'
                                        : p.value !== 'credit_single' && p.value !== 'credit_install'
                                    )
                                    .map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    {isTransfer && (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Conta destino</label>
                            <select
                                value={form.transferToAccountId}
                                onChange={e => handleChange('transferToAccountId', e.target.value)}
                                className={inputClass}
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
                                <label className={labelClass}>Categoria</label>
                                <select
                                    value={form.categoryId}
                                    onChange={e => handleChange('categoryId', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Sem categoria</option>
                                    {filteredCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Tags (separadas por vírgula)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: fixo, essencial..."
                                    value={form.tags}
                                    onChange={e => handleChange('tags', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            {!isEditing && form.paymentMethod === 'credit_install' && (
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>Parcelas</label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="72"
                                        value={form.installments}
                                        onChange={e => handleChange('installments', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Status</label>
                        <select
                            value={form.status}
                            onChange={e => handleChange('status', e.target.value)}
                            className={inputClass}
                        >
                            {TRANSACTION_STATUS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    {form.status === 'confirmed' && (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Data do pagamento (opcional)</label>
                            <input
                                type="date"
                                value={form.confirmedAt}
                                onChange={e => handleChange('confirmedAt', e.target.value)}
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Deixe em branco para usar a data de hoje.
                            </p>
                        </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.autoConfirm}
                            onChange={e => handleChange('autoConfirm', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Confirmar automaticamente na data</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.isHistorical}
                            onChange={e => handleChange('isHistorical', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Lançamento histórico (não altera o saldo)
                        </span>
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