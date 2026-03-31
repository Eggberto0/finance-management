export function calcAccountBalance(account, transactions) {
    if (!account || !transactions) return 0

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const confirmed = transactions.filter(t => {
        if (t.status !== 'confirmed') return false
        if (t.isHistorical) return false

        let date
        if (t.date?.toDate) {
            date = t.date.toDate()
        } else if (t.date?.seconds) {
            date = new Date(t.date.seconds * 1000)
        } else {
            date = new Date(t.date)
        }

        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        return dateOnly <= todayOnly
    })


    if (account.type === 'credit') {
        const spent = transactions
            .filter(t =>
                t.accountId === account.id &&
                t.type === 'expense' &&
                t.status !== 'cancelled'
            )
            .reduce((sum, t) => sum + t.amount, 0)

        return (account.creditLimit ?? 0) - spent
    }

    const base = account.initialBalance ?? 0

    const income = confirmed
        .filter(t => t.accountId === account.id && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

    const expense = confirmed
        .filter(t => t.accountId === account.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    const transferOut = confirmed
        .filter(t => t.accountId === account.id && t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0)

    const transferIn = confirmed
        .filter(t => t.transferToAccountId === account.id && t.type === 'transfer')
        .reduce((sum, t) => sum + t.amount, 0)

    return base + income - expense - transferOut + transferIn
}