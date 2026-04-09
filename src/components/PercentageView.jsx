import { calcAccountBalance } from '../utils/calcBalance'
import { useSettingsContext } from '../contexts/SettingsContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function pct(value, total) {
    if (!total) return 0
    return Math.round((value / total) * 100)
}

export default function PercentageView({
    totalIncome,
    totalExpense,
    expenseByCategory,
    prevTotalExpense,
    expenseByCategotyPrev,
    normalAccounts,
    totalBalance,
    transactions,
}) {
    const { settings } = useSettingsContext()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'

    function fmt(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: defaultCurrency }).format(value)
    }

    const balance = totalIncome - totalExpense
    const expenseRatio = pct(totalExpense, totalIncome)
    const savingsRatio = pct(balance, totalIncome)
    const expenseDiff = prevTotalExpense > 0
        ? Math.round(((totalExpense - prevTotalExpense) / prevTotalExpense) * 100)
        : null

    const categoryData = expenseByCategory.map(({ category, amount }) => ({
        name: category.name,
        value: amount,
        color: category.color,
        percentage: pct(amount, totalExpense),
        prevAmount: expenseByCategotyPrev[category.id] ?? 0,
    }))

    const accountData = normalAccounts
        .filter(a => a.type !== 'credit')
        .map(a => {
            const bal = calcAccountBalance(a, transactions)
            return {
                name: a.name,
                value: Math.max(bal, 0),
                color: a.color,
            }
        })
        .filter(a => a.value > 0)

    const positiveTotal = accountData.reduce((sum, a) => sum + a.value, 0)

    const accountDataWithPct = accountData.map(a => ({
        ...a,
        percentage: pct(a.value, positiveTotal)
    }))

    return (
        <div className="flex flex-col gap-6">

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Receitas x Despesas</p>
                    {expenseDiff !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${expenseDiff > 0
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            }`}>
                            {expenseDiff > 0 ? '▲' : '▼'} {Math.abs(expenseDiff)}% vs mês anterior
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-1 flex justify-center">
                        <ResponsiveContainer width={120} height={120}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Despesas', value: totalExpense },
                                        { name: 'Sobrou', value: Math.max(balance, 0) },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={35}
                                    outerRadius={55}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    <Cell fill="#EF4444" />
                                    <Cell fill="#10B981" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="col-span-2 flex flex-col gap-3">
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Receitas</p>
                            <p className="text-sm font-medium text-green-600">{fmt(totalIncome)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Despesas — {expenseRatio}% da renda</p>
                            <p className="text-sm font-medium text-red-500">{fmt(totalExpense)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Sobrou — {savingsRatio}% da renda</p>
                            <p className={`text-sm font-medium ${balance >= 0 ? 'text-gray-800 dark:text-gray-100' : 'text-red-500'}`}>
                                {fmt(balance)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Gastos por categoria</p>

                    {categoryData.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum gasto registrado.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <div className="flex justify-center">
                                <ResponsiveContainer width={120} height={120}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={35}
                                            outerRadius={55}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {categoryData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => fmt(value)}
                                            contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex flex-col gap-2">
                                {categoryData.map((cat, i) => {
                                    const diff = cat.prevAmount > 0
                                        ? Math.round(((cat.value - cat.prevAmount) / cat.prevAmount) * 100)
                                        : null
                                    return (
                                        <div key={i} className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{cat.percentage}%</span>
                                                {diff !== null && (
                                                    <span className={`text-xs ${diff > 0 ? 'text-red-400' : 'text-green-500'}`}>
                                                        {diff > 0 ? '▲' : '▼'}{Math.abs(diff)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Distribuição do patrimônio</p>

                    {accountDataWithPct.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma conta com saldo positivo.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <div className="flex justify-center">
                                <ResponsiveContainer width={120} height={120}>
                                    <PieChart>
                                        <Pie
                                            data={accountDataWithPct}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={35}
                                            outerRadius={55}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {accountDataWithPct.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => fmt(value)}
                                            contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex flex-col gap-2">
                                {accountDataWithPct.map((acc, i) => (
                                    <div key={i} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color }} />
                                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{acc.name}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{acc.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}