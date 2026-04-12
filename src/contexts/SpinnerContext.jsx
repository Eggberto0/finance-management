import { createContext, useContext, useState } from 'react'
import Spinner from '../components/Spinner'

const SpinnerContext = createContext({})

export function SpinnerProvider({ children }) {
    const [loading, setLoading] = useState(false)

    async function withSpinner(fn) {
        setLoading(true)
        try {
            await fn()
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