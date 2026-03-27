import { useEffect } from 'react'
import { useRecurring } from './useRecurring'
import { useAuth } from '../contexts/AuthContext'
import { generateInstancesForMonth } from '../utils/generateInstances'

export function useGenerateInstances() {
    const { user } = useAuth()
    const { rules, loading } = useRecurring()

    useEffect(() => {
        if (!user || loading || rules.length === 0) return

        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        generateInstancesForMonth(user.uid, rules, year, month)
    }, [user, loading, rules])
}