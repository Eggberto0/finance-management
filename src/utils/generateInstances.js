import { db } from '../services/firebase'
import { calcRuleDate } from './businessDays'
import { calcInstallmentDates } from './creditCardDates'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export async function generateInstancesForMonth(userId, rules, year, month, accounts = []) {
    for (const rule of rules) {
        if (!rule.active) continue

        const startDate = rule.startDate?.toDate?.() ?? new Date(rule.startDate)
        const ruleStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
        const currentMonth = new Date(year, month - 1, 1)

        if (currentMonth < ruleStart) continue

        if (rule.endDate) {
            const endDate = rule.endDate?.toDate?.() ?? new Date(rule.endDate)
            const ruleEnd = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
            if (currentMonth > ruleEnd) continue
        }

        const existing = await getDocs(
            query(
                collection(db, 'users', userId, 'transactions'),
                where('recurringId', '==', rule.id),
                where('recurringMonth', '==', `${year}-${String(month).padStart(2, '0')}`)
            )
        )

        if (!existing.empty) continue

        let date = calcRuleDate(rule, year, month)
        if (!date) continue

        const account = accounts.find(a => a.id === rule.accountId)
        if (account?.type === 'credit' && account?.closingDay && account?.dueDay) {
            const dates = calcInstallmentDates(date, account.closingDay, account.dueDay, 1)
            date = dates[0]
        }

        const today = new Date()
        today.setHours(23, 59, 59, 999)
        const status = rule.autoConfirm && date <= today ? 'confirmed' : 'pending'

        await addDoc(collection(db, 'users', userId, 'transactions'), {
            type: rule.type,
            amount: rule.baseAmount,
            description: rule.description,
            accountId: rule.accountId,
            categoryId: rule.categoryId ?? null,
            tags: rule.tags ?? [],
            date,
            status,
            autoConfirm: rule.autoConfirm,
            recurringId: rule.id,
            recurringMonth: `${year}-${String(month).padStart(2, '0')}`,
            isRecurringInstance: true,
            createdAt: new Date()
        })
    }
}