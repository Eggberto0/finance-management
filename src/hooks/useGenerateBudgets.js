import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBudgets } from './useBudgets'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'

export function useGenerateBudgets() {
    const { user } = useAuth()
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`
    const { budgets: previousBudgets, loading } = useBudgets(previousMonth)

    useEffect(() => {
        if (!user || loading || previousBudgets.length === 0) return

        const repeatBudgets = previousBudgets.filter(b => b.repeat)
        if (repeatBudgets.length === 0) return

        async function generate() {
            for (const budget of repeatBudgets) {
                const existing = await getDocs(
                    query(
                        collection(db, 'users', user.uid, 'budgets'),
                        where('categoryId', '==', budget.categoryId),
                        where('month', '==', currentMonth)
                    )
                )
                if (!existing.empty) continue
                await addDoc(collection(db, 'users', user.uid, 'budgets'), {
                    categoryId: budget.categoryId,
                    amount: budget.amount,
                    repeat: true,
                    month: currentMonth,
                    createdAt: new Date()
                })
            }
        }

        generate()
    }, [user, loading, previousBudgets])
}