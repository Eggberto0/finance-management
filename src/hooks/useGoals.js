import { useState, useEffect } from 'react'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useGoals() {
    const { user } = useAuth()
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'goals'),
            orderBy('createdAt', 'asc')
        )

        const unsubscribe = onSnapshot(q, snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setGoals(data)
            setLoading(false)
        })

        return unsubscribe
    }, [user])

    async function addGoal(data) {
        await addDoc(collection(db, 'users', user.uid, 'goals'), {
            ...data,
            createdAt: new Date()
        })
    }

    async function updateGoal(id, data) {
        await updateDoc(doc(db, 'users', user.uid, 'goals', id), data)
    }

    async function deleteGoal(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'goals', id))
    }

    async function addContribution(id, amount) {
        const goal = goals.find(g => g.id === id)
        if (!goal) return
        const newAmount = (goal.currentAmount ?? 0) + amount
        await updateDoc(doc(db, 'users', user.uid, 'goals', id), {
            currentAmount: newAmount
        })
    }

    return { goals, loading, addGoal, updateGoal, deleteGoal, addContribution }
}