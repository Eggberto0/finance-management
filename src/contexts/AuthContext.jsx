import { auth, provider } from '../services/firebase'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth'

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

    async function deleteAccount() {
        if (!user) return
        await deleteUser(user)
    }

    function logout() {
        return signOut(auth)
    }

    async function loginWithEmail(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    async function registerWithEmail(email, password, name) {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(result.user, { displayName: name })
        await result.user.reload()
        return result
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loginWithEmail, registerWithEmail, deleteAccount }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}