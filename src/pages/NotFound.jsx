import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center flex flex-col items-center gap-4">
                <p className="text-6xl font-medium text-gray-200 dark:text-gray-700">404</p>
                <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100">Página não encontrada</h1>
                <p className="text-sm text-gray-400 dark:text-gray-500">A página que você tentou acessar não existe.</p>
                <Link
                    to="/"
                    className="mt-2 bg-gray-900 dark:bg-gray-700 text-white text-sm px-5 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                >
                    Voltar para o dashboard
                </Link>
            </div>
        </div>
    )
}