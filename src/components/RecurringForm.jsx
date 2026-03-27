import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { NumericFormat } from 'react-number-format'
import { useCategories } from '../hooks/useCategories'
import {
    TRANSACTION_TYPES, DAY_RULE_TYPES,
    WEEKDAYS, BUSINESS_DAY_FALLBACK
} from '../utils/constants'

export default function RecurringForm({ rule, onClose, onAdd, onUpdate }) {
    const { accounts } = useAccounts()
    const { categories } = useCategories()
    const isEditing = !!rule

    const today = new Date().toISOString().split('T')[0]

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
    })

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
            }
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

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-medium text-gray-800">
                    {isEditing ? 'Editar recorrente' : 'Novo recorrente'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        {TRANSACTION_TYPES.filter(t => t.value !== 'transfer').map(t => (
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

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Descrição</label>
                        <input
                            type="text"
                            placeholder="Ex: Salário, Aluguel..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500">Valor base</label>
                        <NumericFormat
                            value={form.baseAmount}
                            onValueChange={values => handleChange('baseAmount', values.floatValue ?? '')}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            decimalScale={2}
                            fixedDecimalScale
                            placeholder="R$ 0,00"
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

                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                        <p className="text-xs font-medium text-gray-500">Regra de dia</p>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-gray-500">Tipo</label>
                            <select
                                value={form.dayRuleType}
                                onChange={e => handleChange('dayRuleType', e.target.value)}
                                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                            >
                                {DAY_RULE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {showDay && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">
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
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                                />
                            </div>
                        )}

                        {showWeekday && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">Dia da semana</label>
                                <select
                                    value={form.dayRuleWeekday}
                                    onChange={e => handleChange('dayRuleWeekday', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                                >
                                    {WEEKDAYS.map(w => (
                                        <option key={w.value} value={w.value}>{w.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {showFallback && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">Se cair em feriado ou fim de semana</label>
                                <select
                                    value={form.dayRuleFallback}
                                    onChange={e => handleChange('dayRuleFallback', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition bg-white"
                                >
                                    {BUSINESS_DAY_FALLBACK.map(f => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                        <p className="text-xs font-medium text-gray-500">Período</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">Início</label>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={e => handleChange('startDate', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500">Fim (opcional)</label>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={e => handleChange('endDate', e.target.value)}
                                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition"
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
                        <span className="text-sm text-gray-600">Confirmar automaticamente na data</span>
                    </label>

                    {isEditing && (
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={e => handleChange('active', e.target.checked)}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-gray-600">Regra ativa</span>
                        </label>
                    )}
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