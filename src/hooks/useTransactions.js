import { useState, useEffect } from 'react'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useTransactions() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            orderBy('date', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))

            const toAutoConfirm = data.filter(t => {
                if (!t.autoConfirm || t.status !== 'pending') return false
                const date = t.date?.toDate?.() ?? new Date(t.date.seconds * 1000)
                const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                return dateOnly <= today
            })

            if (toAutoConfirm.length > 0) {
                toAutoConfirm.forEach(t => {
                    updateDoc(doc(db, 'users', user.uid, 'transactions', t.id), {
                        status: 'confirmed'
                    })
                })
            }

            setTransactions(data)
            setLoading(false)
        })

        return unsubscribe
    }, [user])

    async function addTransaction(data) {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            ...data,
            createdAt: new Date()
        })
    }

    async function updateTransaction(id, data) {
        await updateDoc(doc(db, 'users', user.uid, 'transactions', id), data)
    }

    async function deleteTransaction(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id))
    }

    async function confirmTransaction(id) {
        await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
            status: 'confirmed'
        })
    }

    async function cancelTransaction(id) {
        await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
            status: 'cancelled'
        })
    }

    return {
        transactions,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        confirmTransaction,
        cancelTransaction
    }
}