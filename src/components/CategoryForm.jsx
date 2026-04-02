import { useState } from 'react'
import CategoryIcon from './CategoryIcon'
import { CATEGORY_TYPES, CATEGORY_ICONS, ACCOUNT_COLORS } from '../utils/constants'

export default function CategoryForm({ category, onClose, onAdd, onUpdate }) {
    const isEditing = !!category

    const [form, setForm] = useState({
        name: category?.name ?? '',
        type: category?.type ?? 'expense',
        color: category?.color ?? ACCOUNT_COLORS[0],
        icon: category?.icon ?? CATEGORY_ICONS[0],
    })

    function handleChange(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit() {
        if (!form.name.trim()) return
        const data = {
            name: form.name.trim(),
            type: form.type,
            color: form.color,
            icon: form.icon,
        }
        if (isEditing) {
            await onUpdate(category.id, data)
        } else {
            await onAdd(data)
        }
        onClose()
    }

    const inputClass = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-5">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {isEditing ? 'Editar categoria' : 'Nova categoria'}
                </h3>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Nome</label>
                        <input
                            type="text"
                            placeholder="Ex: Alimentação, Salário..."
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Tipo</label>
                        <select
                            value={form.type}
                            onChange={e => handleChange('type', e.target.value)}
                            className={inputClass}
                        >
                            {CATEGORY_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Ícone</label>
                        <div className="flex gap-2 flex-wrap">
                            {CATEGORY_ICONS.map(icon => (
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

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Cor</label>
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
                        {isEditing ? 'Salvar' : 'Criar categoria'}
                    </button>
                </div>
            </div>
        </div>
    )
}