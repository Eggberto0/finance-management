import { useState } from 'react'

function fmt(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function InvoicePreview({ invoicePreview }) {
    const [expandedKey, setExpandedKey] = useState(null)

    if (!invoicePreview || invoicePreview.length === 0) return null

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Prévia de faturas</p>

            <div className="flex flex-col gap-6">
                {invoicePreview.map(({ card, months }) => (
                    <div key={card.id} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color }} />
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {card.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {months.map(({ monthKey, label, total, transactions }) => {
                                const key = `${card.id}-${monthKey}`
                                const isExpanded = expandedKey === key

                                return (
                                    <div key={monthKey} className="flex flex-col gap-1">
                                        <button
                                            onClick={() => setExpandedKey(isExpanded ? null : key)}
                                            className={`w-full text-left rounded-xl px-3 py-2.5 border transition ${total > 0
                                                    ? 'border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-1">{label}</p>
                                            <p className={`text-sm font-medium ${total > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
                                                }`}>
                                                {total > 0 ? fmt(total) : 'Sem gastos'}
                                            </p>
                                            {transactions.length > 0 && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {transactions.length} {transactions.length === 1 ? 'lançamento' : 'lançamentos'}
                                                    {' '}{isExpanded ? '▲' : '▼'}
                                                </p>
                                            )}
                                        </button>

                                        {isExpanded && transactions.length > 0 && (
                                            <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                                {transactions.map(t => (
                                                    <div
                                                        key={t.id}
                                                        className="flex items-center justify-between px-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
                                                    >
                                                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                                                            {t.description || '—'}
                                                        </p>
                                                        <p className="text-xs font-medium text-red-500 flex-shrink-0 ml-2">
                                                            {fmt(t.amount)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}