export function calcInstallmentDates(purchaseDate, closingDay, dueDay, installments) {
    const purchase = new Date(purchaseDate)
    const purchaseDay = purchase.getDate()
    const purchaseMonth = purchase.getMonth()
    const purchaseYear = purchase.getFullYear()

    // A compra perdeu o fechamento deste mês se o dia da compra >= fechamento
    const missedClosing = purchaseDay >= closingDay

    // Mês do próximo fechamento
    const closingMonth = missedClosing ? purchaseMonth + 1 : purchaseMonth

    // Se fechamento < vencimento: vence no mesmo mês do fechamento
    // Se fechamento > vencimento: vence no mês seguinte ao fechamento
    const firstDueMonth = dueDay > closingDay ? closingMonth : closingMonth + 1

    const dates = []

    for (let i = 0; i < installments; i++) {
        const targetMonth = firstDueMonth + i
        const lastDayOfMonth = new Date(purchaseYear, targetMonth + 1, 0).getDate()
        const day = Math.min(dueDay, lastDayOfMonth)
        dates.push(new Date(purchaseYear, targetMonth, day, 12, 0, 0))
    }

    return dates
}