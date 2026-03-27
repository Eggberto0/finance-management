import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { CATEGORY_TYPES } from '../utils/constants'
import CategoryForm from '../components/CategoryForm'
import Layout from '../components/Layout'

export default function Categories() {
    const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
                Carregando...
            </div>
        )
    }

    return (
        <Layout>
            <div className="w-full px-18 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-800">Categorias</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition"
                    >
                        Nova categoria
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">
                        Nenhuma categoria cadastrada ainda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {expenseCategories.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Despesas</p>
                                {expenseCategories.map(category => (
                                    <div
                                        key={category.id}
                                        className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                                style={{ backgroundColor: category.color + '22' }}
                                            >
                                                {category.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{category.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{getTypeLabel(category.type)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-xs text-gray-400 hover:text-gray-600 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="text-xs text-red-400 hover:text-red-600 transition"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {incomeCategories.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Receitas</p>
                                {incomeCategories.map(category => (
                                    <div
                                        key={category.id}
                                        className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                                style={{ backgroundColor: category.color + '22' }}
                                            >
                                                {category.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{category.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{getTypeLabel(category.type)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-xs text-gray-400 hover:text-gray-600 transition"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="text-xs text-red-400 hover:text-red-600 transition"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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