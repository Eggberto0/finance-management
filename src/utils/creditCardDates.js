export function calcInstallmentDates(purchaseDate, closingDay, dueDay, installments) {
    const purchase = new Date(purchaseDate)
    const purchaseDay = purchase.getDate()
    const purchaseMonth = purchase.getMonth()
    const purchaseYear = purchase.getFullYear()

    const firstDueMonth = purchaseDay > closingDay
        ? purchaseMonth + 2
        : purchaseMonth + 1

    const dates = []

    for (let i = 0; i < installments; i++) {
        const dueDate = new Date(purchaseYear, firstDueMonth + i - 1, dueDay, 12, 0, 0)

        if (dueDay > new Date(purchaseYear, firstDueMonth + i, 0).getDate()) {
            dueDate.setDate(new Date(purchaseYear, firstDueMonth + i, 0).getDate())
        }

        dates.push(dueDate)
    }

    return dates
}