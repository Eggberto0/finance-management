import { useState } from 'react'
import Layout from '../components/Layout'
import { useAccounts } from '../hooks/useAccounts'
import AccountForm from '../components/AccountForm'
import { calcAccountBalance } from '../utils/calcBalance'
import { useTransactions } from '../hooks/useTransactions'
import { ACCOUNT_TYPES, CURRENCIES } from '../utils/constants'

function AccountCard({ account, transactions, onEdit, onDelete, getTypeLabel, getCurrencyLabel }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: account.color }}
                />
                <div>
                    <p className="text-sm font-medium text-gray-800">{account.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {getTypeLabel(account.type)} · {getCurrencyLabel(account.currency)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <p className={`text-sm font-medium ${account.type === 'credit' ? 'text-gray-700' :
                    calcAccountBalance(account, transactions) < 0 ? 'text-red-500' : 'text-gray-700'
                    }`}>
                    {account.type === 'credit'
                        ? `Limite disponível: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcAccountBalance(account, transactions))}`
                        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: account.currency }).format(calcAccountBalance(account, transactions))
                    }
                </p>
                <button
                    onClick={() => onEdit(account)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition"
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(account.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition"
                >
                    Excluir
                </button>
            </div>
        </div>
    )
}

export default function Accounts() {
    const { accounts, loading, addAccount, updateAccount, deleteAccount } = useAccounts()
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const { transactions } = useTransactions()

    function handleEdit(account) {
        setEditing(account)
        setShowForm(true)
    }

    function handleClose() {
        setEditing(null)
        setShowForm(false)
    }

    function getTypeLabel(value) {
        return ACCOUNT_TYPES.find(t => t.value === value)?.label ?? value
    }

    function getCurrencyLabel(value) {
        return CURRENCIES.find(c => c.value === value)?.label ?? value
    }

    const normalAccounts = accounts.filter(a => a.type !== 'benefit')
    const benefitAccounts = accounts.filter(a => a.type === 'benefit')

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
                    <h2 className="text-lg font-medium text-gray-800">Contas</h2>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-700 transition"
                    >
                        Nova conta
                    </button>
                </div>

                {accounts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">
                        Nenhuma conta cadastrada ainda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {normalAccounts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Contas</p>
                                {normalAccounts.map(account => (
                                    <AccountCard
                                        key={account.id}
                                        account={account}
                                        transactions={transactions}
                                        onEdit={handleEdit}
                                        onDelete={deleteAccount}
                                        getTypeLabel={getTypeLabel}
                                        getCurrencyLabel={getCurrencyLabel}
                                    />
                                ))}
                            </div>
                        )}

                        {benefitAccounts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Benefícios</p>
                                {benefitAccounts.map(account => (
                                    <AccountCard
                                        key={account.id}
                                        account={account}
                                        transactions={transactions}
                                        onEdit={handleEdit}
                                        onDelete={deleteAccount}
                                        getTypeLabel={getTypeLabel}
                                        getCurrencyLabel={getCurrencyLabel}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {showForm && (
                    <AccountForm
                        account={editing}
                        onClose={handleClose}
                        onAdd={addAccount}
                        onUpdate={updateAccount}
                    />
                )}
            </div>
        </Layout>
    )
}