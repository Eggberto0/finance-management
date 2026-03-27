import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

export function useRecurring() {
    const { user } = useAuth()
    const [rules, setRules] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'recurringRules'),
            orderBy('createdAt', 'asc')
        )

        const unsubscribe = onSnapshot(q, snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setRules(data)
            setLoading(false)
        })

        return unsubscribe
    }, [user])

    async function addRule(data) {
        await addDoc(collection(db, 'users', user.uid, 'recurringRules'), {
            ...data,
            createdAt: new Date()
        })
    }

    async function updateRule(id, data) {
        await updateDoc(doc(db, 'users', user.uid, 'recurringRules', id), data)
    }

    async function deleteRule(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'recurringRules', id))
    }

    return { rules, loading, addRule, updateRule, deleteRule }
}