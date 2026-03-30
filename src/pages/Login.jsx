import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const { login, loginWithEmail, registerWithEmail } = useAuth()
    const navigate = useNavigate()
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    async function handleGoogle() {
        await login()
        navigate('/')
    }

    async function handleEmailSubmit() {
        if (!email || !password) return
        setError('')
        try {
            if (mode === 'login') {
                await loginWithEmail(email, password)
            } else {
                await registerWithEmail(email, password)
            }
            navigate('/')
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('E-mail ou senha incorretos.')
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este e-mail já está cadastrado.')
            } else if (err.code === 'auth/weak-password') {
                setError('A senha deve ter pelo menos 6 caracteres.')
            } else {
                setError('Ocorreu um erro. Tente novamente.')
            }
        }
    }

    const inputClass = "w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition"

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-sm flex flex-col items-center gap-6 w-full max-w-sm mx-4">
                <div className="text-center">
                    <h1 className="text-2xl font-medium text-gray-800 dark:text-gray-100">Financer</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Controle financeiro pessoal</p>
                </div>

                <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-full">
                    <button
                        onClick={() => { setMode('login'); setError('') }}
                        className={`flex-1 text-xs py-1.5 rounded-lg transition ${mode === 'login'
                                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => { setMode('register'); setError('') }}
                        className={`flex-1 text-xs py-1.5 rounded-lg transition ${mode === 'register'
                                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        Cadastrar
                    </button>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={inputClass}
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                        className={inputClass}
                    />

                    {error && (
                        <p className="text-xs text-red-500 text-center">{error}</p>
                    )}

                    <button
                        onClick={handleEmailSubmit}
                        className="w-full bg-gray-900 dark:bg-gray-700 text-white text-sm py-2.5 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                    >
                        {mode === 'login' ? 'Entrar' : 'Criar conta'}
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                    <span className="text-xs text-gray-400">ou</span>
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                </div>

                <button
                    onClick={handleGoogle}
                    className="flex items-center gap-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-6 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition w-full justify-center"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
                    Entrar com Google
                </button>
            </div>
        </div>
    )
}