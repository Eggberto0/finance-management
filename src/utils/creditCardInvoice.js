export function buildInvoicePreview(accounts, transactions, monthsAhead = 3) {
    const creditCards = accounts.filter(a => a.type === 'credit')
    const now = new Date()
    const result = []

    for (const card of creditCards) {
        const months = []

        for (let i = 0; i <= monthsAhead; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
            const year = date.getFullYear()
            const month = date.getMonth() + 1
            const monthKey = `${year}-${String(month).padStart(2, '0')}`

            const invoiceTransactions = transactions.filter(t => {
                if (t.accountId !== card.id) return false
                if (t.type !== 'expense') return false
                if (t.status === 'cancelled') return false
                const tDate = t.date?.toDate?.() ?? new Date(t.date?.seconds * 1000)
                const tYear = tDate.getFullYear()
                const tMonth = tDate.getMonth() + 1
                return tYear === year && tMonth === month
            })

            const total = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0)

            months.push({
                monthKey,
                year,
                month,
                total,
                transactions: invoiceTransactions,
                label: new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
                    month: 'long', year: 'numeric'
                })
            })
        }

        result.push({ card, months })
    }

    return result
}