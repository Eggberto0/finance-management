import { useMemo } from 'react'
import { useGoals } from './useGoals'
import { useBudgets } from './useBudgets'
import { useAccounts } from './useAccounts'
import { useCategories } from './useCategories'
import { useTransactions } from './useTransactions'
import { useExchangeRates } from './useExchangeRates'
import { calcAccountBalance } from '../utils/calcBalance'
import { useSettingsContext } from '../contexts/SettingsContext'
import { buildInvoicePreview } from '../utils/creditCardInvoice'

export function useDashboard(selectedMonth, period = 'month') {
    const { accounts } = useAccounts()
    const { transactions } = useTransactions()
    const { categories } = useCategories()
    const [year, month] = selectedMonth.split('-').map(Number)
    const { convert, rates, lastUpdated } = useExchangeRates()
    const { budgets } = useBudgets(`${year}-${String(month).padStart(2, '0')}`)
    const { settings } = useSettingsContext()
    const defaultCurrency = settings.defaultCurrency ?? 'BRL'

    const periodMonths = period === 'quarter' ? 3 : period === 'half' ? 6 : period === 'year' ? 12 : 1

    const periodStart = useMemo(() => {
        return new Date(year, month - periodMonths, 1)
    }, [year, month, periodMonths])

    const periodEnd = useMemo(() => {
        return new Date(year, month, 0, 23, 59, 59)
    }, [year, month])

    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    const prevMonthTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
            return (
                date.getFullYear() === prevYear &&
                date.getMonth() + 1 === prevMonth &&
                t.status !== 'cancelled'
            )
        })
    }, [transactions, prevYear, prevMonth])

    const prevConfirmed = useMemo(() =>
        prevMonthTransactions.filter(t => t.status === 'confirmed'),
        [prevMonthTransactions]
    )

    const prevTotalExpense = useMemo(() =>
        prevConfirmed
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        [prevConfirmed]
    )

    const expenseByCategotyPrev = useMemo(() => {
        const map = {}
        prevConfirmed
            .filter(t => t.type === 'expense' && t.categoryId)
            .forEach(t => {
                map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
            })
        return map
    }, [prevConfirmed])

    // Transações do período selecionado
    const periodTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
            return date >= periodStart && date <= periodEnd && t.status !== 'cancelled'
        })
    }, [transactions, periodStart, periodEnd])

    const confirmedPeriod = useMemo(() =>
        periodTransactions.filter(t => t.status === 'confirmed'),
        [periodTransactions]
    )

    const { goals } = useGoals()

    const goalsSummary = useMemo(() => {
        return goals.map(goal => {
            const account = goal.accountId
                ? accounts.find(a => a.id === goal.accountId)
                : null
            const current = account
                ? calcAccountBalance(account, transactions)
                : (goal.currentAmount ?? 0)
            const percentage = Math.min((current / goal.targetAmount) * 100, 100)
            return { ...goal, current, percentage, isComplete: current >= goal.targetAmount }
        })
    }, [goals, accounts, transactions])

    const invoicePreview = useMemo(() =>
        buildInvoicePreview(accounts, transactions, 3),
        [accounts, transactions]
    )

    const totalIncome = useMemo(() =>
        confirmedPeriod
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
        [confirmedPeriod]
    )

    const totalExpense = useMemo(() =>
        confirmedPeriod
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        [confirmedPeriod]
    )

    const normalAccounts = useMemo(() =>
        accounts.filter(a => a.type !== 'benefit'),
        [accounts]
    )

    const benefitAccounts = useMemo(() =>
        accounts.filter(a => a.type === 'benefit'),
        [accounts]
    )

    const totalBalance = useMemo(() =>
        normalAccounts
            .filter(a => a.type !== 'credit')
            .reduce((sum, a) => {
                const balance = calcAccountBalance(a, transactions)
                return sum + balance
            }, 0),
        [normalAccounts, transactions]
    )

    const expenseByCategory = useMemo(() => {
        const map = {}
        confirmedPeriod
            .filter(t => t.type === 'expense' && t.categoryId)
            .forEach(t => {
                map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
            })
        return Object.entries(map)
            .map(([categoryId, amount]) => ({
                categoryId,
                amount,
                category: categories.find(c => c.id === categoryId)
            }))
            .filter(e => e.category)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
    }, [confirmedPeriod, categories])

    const budgetAlerts = useMemo(() => {
        return budgets
            .map(budget => {
                const spent = confirmedPeriod
                    .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                const category = categories.find(c => c.id === budget.categoryId)
                const percentage = (spent / budget.amount) * 100
                return { ...budget, spent, category, percentage, isOver: spent > budget.amount }
            })
            .filter(b => b.percentage >= 80)
            .sort((a, b) => b.percentage - a.percentage)
    }, [budgets, confirmedPeriod, categories])

    const upcomingTransactions = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const limit = new Date(today)
        limit.setDate(limit.getDate() + 30)

        return transactions
            .filter(t => {
                if (t.status !== 'pending') return false
                const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
                return date >= today && date <= limit
            })
            .sort((a, b) => {
                const da = a.date?.toDate?.() ?? new Date(a.date?.seconds * 1000)
                const db = b.date?.toDate?.() ?? new Date(b.date?.seconds * 1000)
                return da - db
            })
            .slice(0, 5)
    }, [transactions])

    const creditCardAlerts = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return accounts
            .filter(a => a.type === 'credit')
            .map(a => {
                const dueDate = new Date(today.getFullYear(), today.getMonth(), a.dueDay)
                if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1)
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

                const dueYear = dueDate.getFullYear()
                const dueMonth = dueDate.getMonth() + 1
                const invoiceTotal = transactions
                    .filter(t => {
                        if (t.accountId !== a.id) return false
                        if (t.type !== 'expense') return false
                        if (t.status === 'cancelled') return false
                        const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
                        return date.getFullYear() === dueYear && date.getMonth() + 1 === dueMonth
                    })
                    .reduce((sum, t) => sum + t.amount, 0)

                return { account: a, invoiceTotal, dueDate, daysUntilDue }
            })
            .filter(a => a.daysUntilDue <= 15 && a.invoiceTotal > 0)
    }, [accounts, transactions])

    const overdueTransactions = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        return transactions
            .filter(t => {
                if (t.status !== 'pending') return false
                if (t.autoConfirm) return false
                const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
                date.setHours(0, 0, 0, 0)
                return date < today
            })
            .sort((a, b) => {
                const da = a.date?.toDate?.() ?? new Date(a.date?.seconds * 1000)
                const db = b.date?.toDate?.() ?? new Date(b.date?.seconds * 1000)
                return da - db
            })
    }, [transactions])

    return {
        normalAccounts,
        benefitAccounts,
        transactions,
        totalBalance,
        totalIncome,
        totalExpense,
        expenseByCategory,
        upcomingTransactions,
        creditCardAlerts,
        budgetAlerts,
        overdueTransactions,
        invoicePreview,
        lastUpdated,
        goalsSummary,
        prevTotalExpense,
        expenseByCategotyPrev,
    }
}