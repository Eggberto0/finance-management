import { createContext, useContext } from 'react'
import { useSettings } from '../hooks/useSettings'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
    const { settings, loading, updateSettings } = useSettings()
    return (
        <SettingsContext.Provider value={{ settings, loading, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettingsContext() {
    return useContext(SettingsContext)
}