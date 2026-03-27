import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { useGenerateInstances } from '../hooks/useGenerateInstances'

export default function Dashboard() {
  useGenerateInstances()
    const { user } = useAuth()

    return (
        <Layout>
            <div className="w-full px-18 py-8">
                <p className="text-gray-500">Bem-vindo, {user.displayName.split(' ')[0]}!</p>
            </div>
        </Layout>
    )
}