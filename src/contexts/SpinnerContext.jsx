import { useToast } from './ToastContext'
import Spinner from '../components/Spinner'
import { createContext, useContext, useState } from 'react'

const SpinnerContext = createContext({})

export function SpinnerProvider({ children }) {
    const [loading, setLoading] = useState(false)

    const { addToast } = useToast()

    async function withSpinner(fn) {
        setLoading(true)
        try {
            await fn()
        } catch (err) {
            addToast('Falha ao completar operação. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SpinnerContext.Provider value={{ withSpinner }}>
            {loading && <Spinner />}
            {children}
        </SpinnerContext.Provider>
    )
}

export function useSpinner() {
    return useContext(SpinnerContext)
}