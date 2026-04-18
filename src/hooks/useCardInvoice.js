import { useAccounts } from './useAccounts'
import { useTransactions } from './useTransactions'
import { useSpinner } from '../contexts/SpinnerContext'

export function useCardInvoice(cardId, month) {
    const { transactions, addTransaction, updateTransaction } = useTransactions()
    const { accounts } = useAccounts()
    const { withSpinner } = useSpinner()

    const [year, m] = month.split('-').map(Number)

    const card = accounts.find(a => a.id === cardId)

    const invoiceTransactions = transactions.filter(t => {
        if (t.accountId !== cardId) return false
        if (t.type !== 'expense') return false
        if (t.status === 'cancelled') return false
        const date = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
        return date.getFullYear() === year && date.getMonth() + 1 === m
    })

    const total = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0)
    const isPaid = invoiceTransactions.length > 0 && invoiceTransactions.every(t => t.status === 'confirmed')

    async function payInvoice() {
        await withSpinner(async () => {
            if (!card?.linkedAccountId) return

            for (const t of invoiceTransactions) {
                await updateTransaction(t.id, { status: 'confirmed', confirmedAt: new Date() })
            }

            await addTransaction({
                type: 'expense',
                amount: total,
                description: `Fatura ${card.name} — ${new Date(year, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
                date: new Date(year, m - 1, card.dueDay ?? 1, 12, 0, 0),
                accountId: card.linkedAccountId,
                categoryId: null,
                tags: ['fatura', 'cartão'],
                status: 'confirmed',
                confirmedAt: new Date(),
                autoConfirm: false,
            })
        })
    }

    return { card, invoiceTransactions, total, isPaid, payInvoice }
}