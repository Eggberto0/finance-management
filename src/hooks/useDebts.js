import { db } from '../services/firebase'
import { useState, useEffect } from 'react'
import {
    collection, addDoc, updateDoc, deleteDoc,
    doc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

export function useDebts() {
    const { user } = useAuth()
    const [debts, setDebts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const q = query(
            collection(db, 'users', user.uid, 'debts'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }))
            setDebts(data)
            setLoading(false)
        })

        return unsubscribe
    }, [user])

    async function addDebt(data) {
        await addDoc(collection(db, 'users', user.uid, 'debts'), {
            ...data,
            createdAt: new Date()
        })
    }

    async function updateDebt(id, data) {
        await updateDoc(doc(db, 'users', user.uid, 'debts', id), data)
    }

    async function deleteDebt(id) {
        await deleteDoc(doc(db, 'users', user.uid, 'debts', id))
    }

    async function addPayment(debtId, payment, newBalance) {
        const debt = debts.find(d => d.id === debtId)
        if (!debt) return

        const payments = [...(debt.payments ?? []), {
            ...payment,
            id: crypto.randomUUID(),
            date: new Date()
        }]

        // Atualiza saldo da dívida
        await updateDoc(doc(db, 'users', user.uid, 'debts', debtId), {
            currentBalance: newBalance,
            payments
        })

        // Se tiver conta vinculada, cria lançamento automático
        if (payment.accountId) {
            await addDoc(collection(db, 'users', user.uid, 'transactions'), {
                type: 'expense',
                amount: payment.amount,
                description: `Pagamento: ${debt.name}`,
                date: new Date(),
                accountId: payment.accountId,
                categoryId: null,
                tags: ['dívida'],
                status: 'confirmed',
                confirmedAt: new Date(),
                autoConfirm: false,
                isHistorical: false,
                debtId,
                createdAt: new Date()
            })
        }
    }

    return { debts, loading, addDebt, updateDebt, deleteDebt, addPayment }
}