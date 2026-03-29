import { useState, useEffect } from 'react'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, where
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useBudgets(month) {
    const { user } = useAuth()
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'budgets'),
            where('month', '==', month)
        )

        const unsubscribe = onSnapshot(q, snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setBudgets(data)
            setLoading(false)
        })

        return unsubscribe
    }, [user, month])

    async function addBudget(data) {
        await addDoc(collection(db, 'users', user.uid, 'budgets'), {
            ...data,
            month,
            createdAt: new Date()
        })
    }

    async function updateBudget(id, data) {
        await updateDoc(doc(db, 'users', user.uid, 'budgets', id), data)
    }

    async function deleteBudget(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'budgets', id))
    }

    async function copyFromPreviousMonth(previousBudgets) {
        for (const budget of previousBudgets) {
            await addDoc(collection(db, 'users', user.uid, 'budgets'), {
                categoryId: budget.categoryId,
                amount: budget.amount,
                repeat: budget.repeat,
                month,
                createdAt: new Date()
            })
        }
    }

    return { budgets, loading, addBudget, updateBudget, deleteBudget, copyFromPreviousMonth }
}