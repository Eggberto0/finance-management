import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { CATEGORY_TYPES } from '../utils/constants'
import CategoryIcon from '../components/CategoryIcon'
import CategoryForm from '../components/CategoryForm'
import ConfirmModal from '../components/ConfirmModal'
import { useCategories } from '../hooks/useCategories'

export default function Categories() {
    const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [confirming, setConfirming] = useState(null)

    function handleEdit(category) {
        setEditing(category)
        setShowForm(true)
    }

    function handleClose() {
        setEditing(null)
        setShowForm(false)
    }

    function getTypeLabel(value) {
        return CATEGORY_TYPES.find(t => t.value === value)?.label ?? value
    }

    const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both')
    const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both')

    function CategoryCard({ category }) {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 md:px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color + '22' }}
                    >
                        <CategoryIcon name={category.icon} size={16} color={category.color} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{category.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{getTypeLabel(category.type)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={() => handleEdit(category)}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => setConfirming(category)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Carregando...
            </div>
        )
    }

    return (
        <Layout>
            <div className="w-full px-4 md:px-18 py-6 md:py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Categorias</h2>
                    <Button onClick={() => setShowForm(true)}>Nova categoria</Button>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhuma categoria cadastrada ainda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {expenseCategories.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Despesas</p>
                                {expenseCategories.map(category => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                        )}

                        {incomeCategories.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Receitas</p>
                                {incomeCategories.map(category => (
                                    <CategoryCard key={category.id} category={category} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {confirming && (
                    <ConfirmModal
                        title="Excluir categoria?"
                        message={`"${confirming.name}" será excluída permanentemente.`}
                        onConfirm={() => { deleteCategory(confirming.id); setConfirming(null) }}
                        onClose={() => setConfirming(null)}
                    />
                )}

                {showForm && (
                    <CategoryForm
                        category={editing}
                        onClose={handleClose}
                        onAdd={addCategory}
                        onUpdate={updateCategory}
                    />
                )}
            </div>
        </Layout>
    )
}