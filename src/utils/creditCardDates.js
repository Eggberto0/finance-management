export function calcInstallmentDates(purchaseDate, closingDay, dueDay, installments) {
    const purchase = new Date(purchaseDate)
    const purchaseDay = purchase.getDate()
    const purchaseMonth = purchase.getMonth()
    const purchaseYear = purchase.getFullYear()

    // Se comprou antes ou no dia do fechamento, a fatura já fechou (ou fecha) esse mês
    // Se comprou depois do fechamento, vai para a próxima fatura
    const missedClosing = purchaseDay > closingDay

    // Se fechamento < vencimento: vencimento é no mesmo mês do fechamento
    // Se fechamento > vencimento: vencimento é no mês seguinte ao fechamento
    const dueSameMonthAsClosing = dueDay > closingDay

    // Mês base do fechamento
    const closingMonth = missedClosing ? purchaseMonth + 1 : purchaseMonth

    // Mês do primeiro vencimento
    const firstDueMonth = dueSameMonthAsClosing ? closingMonth : closingMonth + 1

    const dates = []

    for (let i = 0; i < installments; i++) {
        const targetMonth = firstDueMonth + i
        const lastDayOfMonth = new Date(purchaseYear, targetMonth + 1, 0).getDate()
        const day = Math.min(dueDay, lastDayOfMonth)
        dates.push(new Date(purchaseYear, targetMonth, day, 12, 0, 0))
    }

    return dates
}