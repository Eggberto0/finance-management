import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleLogin() {
        await login()
        navigate('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-10 rounded-2xl shadow-sm flex flex-col items-center gap-6">
                <h1 className="text-2xl font-medium text-gray-800">Financer</h1>
                <p className="text-gray-500 text-sm">Controle financeiro pessoal</p>
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-3 bg-white border border-gray-200 px-6 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                >
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
                    Entrar com Google
                </button>
            </div>
        </div>
    )
}