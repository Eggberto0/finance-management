import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useOnboarding() {
    const { user } = useAuth()
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        async function check() {
            const ref = doc(db, 'users', user.uid, 'settings', 'onboarding')
            const snap = await getDoc(ref)
            if (!snap.exists() || !snap.data().completed) {
                setShowOnboarding(true)
            }
            setLoading(false)
        }

        check()
    }, [user])

    async function completeOnboarding() {
        if (!user) return
        const ref = doc(db, 'users', user.uid, 'settings', 'onboarding')
        await setDoc(ref, { completed: true })
        setShowOnboarding(false)
    }

    return { showOnboarding, loading, completeOnboarding }
}