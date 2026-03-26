import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function Dashboard() {
    const { user } = useAuth()

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-6 py-8">
                <p className="text-gray-500">Bem-vindo, {user.displayName.split(' ')[0]}!</p>
            </div>
        </Layout>
    )
}