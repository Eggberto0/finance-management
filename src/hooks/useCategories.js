import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

export function useCategories() {
    const { user } = useAuth()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'categories'),
            orderBy('createdAt', 'asc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setCategories(data)
            setLoading(false)
        })

        return unsubscribe
    }, [user])

    async function addCategory(data) {
        await addDoc(collection(db, 'users', user.uid, 'categories'), {
            ...data,
            createdAt: new Date()
        })
    }

    async function updateCategory(id, data) {
        await updateDoc(doc(db, 'users', user.uid, 'categories', id), data)
    }

    async function deleteCategory(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'categories', id))
    }

    return { categories, loading, addCategory, updateCategory, deleteCategory }
}