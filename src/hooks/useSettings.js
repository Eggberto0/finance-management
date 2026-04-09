import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useSettings() {
    const { user } = useAuth()
    const [settings, setSettings] = useState({
        defaultCurrency: 'BRL',
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        async function load() {
            const ref = doc(db, 'users', user.uid, 'settings', 'preferences')
            const snap = await getDoc(ref)
            if (snap.exists()) {
                setSettings(prev => ({ ...prev, ...snap.data() }))
            }
            setLoading(false)
        }
        load()
    }, [user])

    async function updateSettings(data) {
        if (!user) return
        const ref = doc(db, 'users', user.uid, 'settings', 'preferences')
        const updated = { ...settings, ...data }
        await setDoc(ref, updated, { merge: true })
        setSettings(updated)
    }

    return { settings, loading, updateSettings }
}