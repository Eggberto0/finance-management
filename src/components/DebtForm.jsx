import { useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { useAccounts } from '../hooks/useAccounts'
import { useSettingsContext } from '../contexts/SettingsContext'

const CURRENCY_SYMBOLS = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£', ARS: '$' }
const CURRENCIES = [
    { value: 'BRL', label: 'R$ Real (BRL)' },
    { value: 'USD', label: 'US$ Dólar (USD)' },
    { value: 'EUR', label: '€ Euro (EUR)' },
    { value: 'GBP', label: '£ Libra (GBP)' },
    { value: 'ARS', label: '$ Peso (ARS)' },
]
const CATEGORIES = [
    { value: 'loan', label: 'Empréstimo' },
    { value: 'financing', label: 'Financiamento' },
    { value: 'personal', label: 'Dívida pessoal' },
    { value: 'other', label: 'Outro' },
]
const INTEREST_TYPES = [
    { value: 'fixed', label: 'Valor fixo' },
    { value: 'simple', label: 'Juros simples' },
    { value: 'compound', label: 'Juros compostos' },
]
const FREQUENCIES = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
]

export default function DebtForm({ debt, onClose, onAdd, onUpdate }) {
    const { settings } = useSettingsContext()
    const { accounts } = useAccounts()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'
    const isEditing = !!debt

    const [form, setForm] = useState({
        name: debt?.name ?? '',
        creditor: debt?.creditor ?? '',
        totalAmount: debt?.totalAmount ?? '',
        currency: debt?.currency ?? defaultCurrency,
        category: debt?.category ?? 'loan',
        notes: debt?.notes ?? '',
        linkedAccountId: debt?.linkedAccountId ?? '',
        dueDate: debt?.dueDate
            ? (debt.dueDate.toDate?.() ?? new Date(debt.dueDate)).toISOString().split('T')[0]
            : '',
        interestEnabled: debt?.interestRule?.enabled ?? false,
        interestType: debt?.interestRule?.type ?? 'compound',
        interestRate: debt?.interestRule?.rate ?? '',
        interestFrequency: debt?.interestRule?.frequency ?? 'monthly',
    })

    const currencySymbol = CURRENCY_SYMBOLS[form.currency] ?? form.currency

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.totalAmount || !form.creditor.trim()) return

        const data = {
            name: form.name.trim(),
            creditor: form.creditor.trim(),
            totalAmount: parseFloat(form.totalAmount),
            currentBalance: isEditing ? debt.currentBalance : parseFloat(form.totalAmount),
            currency: form.currency,
            category: form.category,
            notes: form.notes.trim(),
            linkedAccountId: form.linkedAccountId || null,
            dueDate: form.dueDate
                ? (() => { const [y, m, d] = form.dueDate.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0) })()
                : null,
            payments: debt?.payments ?? [],
            interestRule: {
                enabled: form.interestEnabled,
                type: form.interestType,
                rate: parseFloat(form.interestRate) || 0,
                frequency: form.interestFrequency,
                lastApplied: debt?.interestRule?.lastApplied ?? null,
            }
        }

        if (isEditing) {
            await onUpdate(debt.id, data)
        } else {
            await onAdd(data)
        }
        onClose()
    }

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"
    const labelClass = "text-xs text-gray-500 dark:text-gray-400"

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {isEditing ? 'Editar dívida' : 'Nova dívida'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Nome da dívida</label>
                        <input type="text" placeholder="Ex: Empréstimo banco, Dívida com João..." value={form.name} onChange={e => handleChange('name', e.target.value)} className={inputClass} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Credor</label>
                        <input type="text" placeholder="Ex: João Silva, Banco X..." value={form.creditor} onChange={e => handleChange('creditor', e.target.value)} className={inputClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Categoria</label>
                            <select value={form.category} onChange={e => handleChange('category', e.target.value)} className={inputClass}>
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Moeda</label>
                            <select value={form.currency} onChange={e => handleChange('currency', e.target.value)} className={inputClass}>
                                {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Valor total</label>
                            <NumericFormat
                                value={form.totalAmount}
                                onValueChange={values => handleChange('totalAmount', values.floatValue ?? '')}
                                thousandSeparator="." decimalSeparator="," prefix={`${currencySymbol} `}
                                decimalScale={2} fixedDecimalScale placeholder={`${currencySymbol} 0,00`}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Vencimento (opcional)</label>
                            <input type="date" value={form.dueDate} onChange={e => handleChange('dueDate', e.target.value)} className={inputClass} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Conta vinculada padrão (opcional)</label>
                        <select value={form.linkedAccountId} onChange={e => handleChange('linkedAccountId', e.target.value)} className={inputClass}>
                            <option value="">Sem vínculo — só registro</option>
                            {accounts.filter(a => a.type !== 'credit').map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Pré-selecionada ao registrar pagamentos, mas pode ser alterada.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Observações (opcional)</label>
                        <input type="text" placeholder="Ex: Parcela mensal, acordado em..." value={form.notes} onChange={e => handleChange('notes', e.target.value)} className={inputClass} />
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.interestEnabled} onChange={e => handleChange('interestEnabled', e.target.checked)} className="w-4 h-4 rounded" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Aplicar juros</span>
                        </label>

                        {form.interestEnabled && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Tipo de juros</label>
                                        <select value={form.interestType} onChange={e => handleChange('interestType', e.target.value)} className={inputClass}>
                                            {INTEREST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className={labelClass}>Frequência</label>
                                        <select value={form.interestFrequency} onChange={e => handleChange('interestFrequency', e.target.value)} className={inputClass}>
                                            {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>
                                        {form.interestType === 'fixed' ? `Valor fixo (${currencySymbol})` : 'Taxa (%)'}
                                    </label>
                                    <NumericFormat
                                        value={form.interestRate}
                                        onValueChange={values => handleChange('interestRate', values.floatValue ?? '')}
                                        thousandSeparator="." decimalSeparator=","
                                        suffix={form.interestType === 'fixed' ? '' : '%'}
                                        prefix={form.interestType === 'fixed' ? `${currencySymbol} ` : ''}
                                        decimalScale={2} fixedDecimalScale
                                        placeholder={form.interestType === 'fixed' ? `${currencySymbol} 0,00` : '0,00%'}
                                        className={inputClass}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {form.interestType === 'fixed' && `Adiciona ${currencySymbol} ${form.interestRate || 0} ao saldo a cada período.`}
                                    {form.interestType === 'simple' && `Adiciona ${form.interestRate || 0}% do valor original ao saldo a cada período.`}
                                    {form.interestType === 'compound' && `Adiciona ${form.interestRate || 0}% do saldo atual a cada período (juros sobre juros).`}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                    <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-4 py-2">Cancelar</button>
                    <button onClick={handleSubmit} className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-5 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition">
                        {isEditing ? 'Salvar' : 'Criar dívida'}
                    </button>
                </div>
            </div>
        </div>
    )
}