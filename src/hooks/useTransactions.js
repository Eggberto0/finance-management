import { db } from '../services/firebase'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useSpinner } from '../contexts/SpinnerContext'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy, getDocs, where, deleteField
} from 'firebase/firestore'

export function useTransactions() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { withSpinner } = useSpinner()
    const { addToast } = useToast()

    useEffect(() => {
        if (!user) return

        // Timeout de 10s — se não carregar, mostra vazio
        const timeout = setTimeout(() => {
            setLoading(false)
            setError('offline')
            addToast('Falha ao carregar lançamentos. Verifique sua conexão.')
        }, 10000)

        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            orderBy('date', 'desc')
        )

        let firstSnapshot = true

        const unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
            clearTimeout(timeout)

            const isFromCache = snapshot.metadata.fromCache
            const hasPendingWrites = snapshot.metadata.hasPendingWrites

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const data = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
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

            // Ignora o primeiro snapshot de cache — é o carregamento normal
            if (firstSnapshot && isFromCache) {
                firstSnapshot = false
                return
            }
            firstSnapshot = false

            if (isFromCache && !hasPendingWrites) {
                setError('offline')
                addToast('Sem conexão — exibindo dados em cache', 'error', 8000)
            } else {
                setError(null)
            }
        }, (err) => {
            clearTimeout(timeout)
            addToast('Falha ao carregar lançamentos')
            setError('offline')
            setLoading(false)
        })

        return () => {
            clearTimeout(timeout)
            unsubscribe()
        }
    }, [user])

    async function deleteInstallments(installmentId) {
        const q = query(
            collection(db, 'users', user.uid, 'transactions'),
            where('installmentId', '==', installmentId)
        )
        const snapshot = await getDocs(q)
        snapshot.docs.forEach(doc => deleteDoc(doc.ref))
    }

    async function addTransaction(data) {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            ...data,
            createdAt: new Date()
        })
    }

    async function updateTransaction(id, data) {
        const cleaned = Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, v === undefined ? deleteField() : v])
        )
        await updateDoc(doc(db, 'users', user.uid, 'transactions', id), cleaned)
    }

    async function deleteTransaction(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id))
    }

    async function confirmTransaction(id) {
        await withSpinner(async () => {
            await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
                status: 'confirmed',
                confirmedAt: new Date()
            })
        })
    }

    async function cancelTransaction(id) {
        await withSpinner(async () => {
            await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
                status: 'cancelled'
            })
        })
    }

    return {
        transactions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        confirmTransaction,
        cancelTransaction,
        deleteInstallments
    }
}