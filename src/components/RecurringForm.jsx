import { useState, useEffect } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { NumericFormat } from 'react-number-format'
import { useCategories } from '../hooks/useCategories'
import { useSettingsContext } from '../contexts/SettingsContext'
import {
    TRANSACTION_TYPES, DAY_RULE_TYPES,
    WEEKDAYS, BUSINESS_DAY_FALLBACK
} from '../utils/constants'

export default function RecurringForm({ rule, onClose, onAdd, onUpdate }) {
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const isEditing = !!rule

    const today = new Date().toISOString().split('T')[0]

    const { settings } = useSettingsContext()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'

    const [form, setForm] = useState({
        type: rule?.type ?? 'expense',
        baseAmount: rule?.baseAmount ?? '',
        description: rule?.description ?? '',
        accountId: rule?.accountId ?? accounts[0]?.id ?? '',
        categoryId: rule?.categoryId ?? '',
        tags: rule?.tags?.join(', ') ?? '',
        autoConfirm: rule?.autoConfirm ?? false,
        active: rule?.active ?? true,
        startDate: rule?.startDate
            ? (rule.startDate.toDate?.() ?? new Date(rule.startDate)).toISOString().split('T')[0]
            : today,
        endDate: rule?.endDate
            ? (rule.endDate.toDate?.() ?? new Date(rule.endDate)).toISOString().split('T')[0]
            : '',
        dayRuleType: rule?.dayRule?.type ?? 'fixed',
        dayRuleDay: rule?.dayRule?.day ?? 1,
        dayRuleWeekday: rule?.dayRule?.weekday ?? 1,
        dayRuleFallback: rule?.dayRule?.fallback ?? 'before',
        currency: rule?.currency ?? defaultCurrency,
    })

    const selectedAccount = accounts.find(a => a.id === form.accountId)
    const CURRENCY_SYMBOLS = { BRL: 'R$', USD: 'US$', EUR: '€', GBP: '£', ARS: '$' }
    const currencySymbol = CURRENCY_SYMBOLS[form.currency] ?? 'R$'

    useEffect(() => {
        if (!rule) {
            const account = accounts.find(a => a.id === form.accountId)
            if (account) handleChange('currency', account.currency ?? 'BRL')
        }
    }, [form.accountId])

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        if (!form.baseAmount || !form.accountId || !form.description.trim()) return

        const [sy, sm, sd] = form.startDate.split('-').map(Number)

        const data = {
            type: form.type,
            baseAmount: parseFloat(form.baseAmount),
            description: form.description.trim(),
            accountId: form.accountId,
            categoryId: form.categoryId || null,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            autoConfirm: form.autoConfirm,
            active: form.active,
            startDate: new Date(sy, sm - 1, sd, 12, 0, 0),
            endDate: form.endDate
                ? (() => { const [y, m, d] = form.endDate.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0) })()
                : null,
            dayRule: {
                type: form.dayRuleType,
                day: parseInt(form.dayRuleDay),
                weekday: parseInt(form.dayRuleWeekday),
                fallback: form.dayRuleFallback,
            },
            currency: form.currency,
        }

        if (isEditing) {
            await onUpdate(rule.id, data)
        } else {
            await onAdd(data)
        }

        onClose()
    }

    const filteredCategories = categories.filter(c =>
        c.type === form.type || c.type === 'both'
    )

    const showDay = form.dayRuleType === 'fixed' ||
        form.dayRuleType === 'nthBusinessDay' ||
        form.dayRuleType === 'nthWeekday'

    const showWeekday = form.dayRuleType === 'nthWeekday'
    const showFallback = form.dayRuleType === 'fixed'

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"
    const labelClass = "text-xs text-gray-500 dark:text-gray-400"

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {isEditing ? 'Editar recorrente' : 'Novo recorrente'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        {TRANSACTION_TYPES.filter(t => t.value !== 'transfer').map(t => (
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

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Descrição</label>
                        <input
                            type="text"
                            placeholder="Ex: Salário, Aluguel..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Valor base</label>
                        <NumericFormat
                            value={form.baseAmount}
                            onValueChange={values => handleChange('baseAmount', values.floatValue ?? '')}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix={`${currencySymbol} `}
                            placeholder={`${currencySymbol} 0,00`}
                            decimalScale={2}
                            fixedDecimalScale
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
                            <option value="BRL">R$ Real (BRL)</option>
                            <option value="USD">US$ Dólar (USD)</option>
                            <option value="EUR">€ Euro (EUR)</option>
                            <option value="GBP">£ Libra (GBP)</option>
                            <option value="ARS">$ Peso (ARS)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Conta</label>
                        <select
                            value={form.accountId}
                            onChange={e => handleChange('accountId', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Selecione...</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

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

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Regra de dia</p>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Tipo</label>
                            <select
                                value={form.dayRuleType}
                                onChange={e => handleChange('dayRuleType', e.target.value)}
                                className={inputClass}
                            >
                                {DAY_RULE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {showDay && (
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>
                                    {form.dayRuleType === 'fixed' ? 'Dia do mês' :
                                        form.dayRuleType === 'nthBusinessDay' ? 'Qual dia útil?' :
                                            'Qual ocorrência?'}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={form.dayRuleType === 'fixed' ? 31 : 5}
                                    value={form.dayRuleDay}
                                    onChange={e => handleChange('dayRuleDay', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        )}

                        {showWeekday && (
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Dia da semana</label>
                                <select
                                    value={form.dayRuleWeekday}
                                    onChange={e => handleChange('dayRuleWeekday', e.target.value)}
                                    className={inputClass}
                                >
                                    {WEEKDAYS.map(w => (
                                        <option key={w.value} value={w.value}>{w.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {showFallback && (
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Se cair em feriado ou fim de semana</label>
                                <select
                                    value={form.dayRuleFallback}
                                    onChange={e => handleChange('dayRuleFallback', e.target.value)}
                                    className={inputClass}
                                >
                                    {BUSINESS_DAY_FALLBACK.map(f => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex flex-col gap-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Período</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Início</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={e => handleChange('startDate', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>Fim (opcional)</label>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={e => handleChange('endDate', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.autoConfirm}
                            onChange={e => handleChange('autoConfirm', e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Confirmar automaticamente na data</span>
                    </label>

                    {isEditing && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={e => handleChange('active', e.target.checked)}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Regra ativa</span>
                        </label>
                    )}
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