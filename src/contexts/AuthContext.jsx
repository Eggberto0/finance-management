import { auth, provider } from '../services/firebase'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    function login() {
        return signInWithPopup(auth, provider)
    }

    function logout() {
        return signOut(auth)
    }

    async function loginWithEmail(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    async function registerWithEmail(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loginWithEmail, registerWithEmail }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}