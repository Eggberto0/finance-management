import { useState, useEffect } from 'react'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useAccounts() {
    const { user } = useAuth()
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'accounts'),
            orderBy('createdAt', 'asc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setAccounts(data)
            setLoading(false)
        })

        return unsubscribe
    }, [user])

    async function addAccount(data) {
        await addDoc(collection(db, 'users', user.uid, 'accounts'), {
            ...data,
            createdAt: new Date()
        })
    }

    async function updateAccount(id, data) {
        await updateDoc(doc(db, 'users', user.uid, 'accounts', id), data)
    }

    async function deleteAccount(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'accounts', id))
    }

    return { accounts, loading, addAccount, updateAccount, deleteAccount }
}