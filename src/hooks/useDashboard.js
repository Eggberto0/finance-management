import { useMemo } from 'react'
import { useBudgets } from './useBudgets'
import { useAccounts } from './useAccounts'
import { useCategories } from './useCategories'
import { useTransactions } from './useTransactions'
import { useExchangeRates } from './useExchangeRates'
import { calcAccountBalance } from '../utils/calcBalance'
import { buildInvoicePreview } from '../utils/creditCardInvoice'

export function useDashboard(selectedMonth) {
    const { accounts } = useAccounts()
    const { transactions } = useTransactions()
    const { categories } = useCategories()
    const [year, month] = selectedMonth.split('-').map(Number)
    const { convertToBRL, rates, lastUpdated } = useExchangeRates()
    const { budgets } = useBudgets(`${year}-${String(month).padStart(2, '0')}`)

    const monthTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
            return (
                date.getFullYear() === year &&
                date.getMonth() + 1 === month &&
                t.status !== 'cancelled'
            )
        })
    }, [transactions, year, month])

    const invoicePreview = useMemo(() =>
        buildInvoicePreview(accounts, transactions, 3),
        [accounts, transactions]
    )

    const confirmedMonth = useMemo(() =>
        monthTransactions.filter(t => t.status === 'confirmed'),
        [monthTransactions]
    )

    const totalIncome = useMemo(() =>
        confirmedMonth
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
        [confirmedMonth]
    )

    const totalExpense = useMemo(() =>
        confirmedMonth
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
        [confirmedMonth]
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
                if (a.currency === 'BRL') return sum + balance
                const converted = convertToBRL(balance, a.currency)
                return sum + (converted ?? balance)
            }, 0),
        [normalAccounts, transactions, rates]
    )

    const expenseByCategory = useMemo(() => {
        const map = {}
        confirmedMonth
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
    }, [confirmedMonth, categories])

    const budgetAlerts = useMemo(() => {
        return budgets
            .map(budget => {
                const spent = confirmedMonth
                    .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                const category = categories.find(c => c.id === budget.categoryId)
                const percentage = (spent / budget.amount) * 100
                return { ...budget, spent, category, percentage, isOver: spent > budget.amount }
            })
            .filter(b => b.percentage >= 80)
            .sort((a, b) => b.percentage - a.percentage)
    }, [budgets, confirmedMonth, categories])

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
        const limit = new Date(today)
        limit.setDate(limit.getDate() + 15)

        return accounts
            .filter(a => a.type === 'credit')
            .map(a => {
                const balance = calcAccountBalance(a, transactions)
                const dueDate = new Date(today.getFullYear(), today.getMonth(), a.dueDay)
                if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1)
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
                return { account: a, balance, dueDate, daysUntilDue }
            })
            .filter(a => a.daysUntilDue <= 15)
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
    }
}