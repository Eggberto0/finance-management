import { useState } from 'react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { useAccounts } from '../hooks/useAccounts'
import AccountForm from '../components/AccountForm'
import ConfirmModal from '../components/ConfirmModal'
import { calcAccountBalance } from '../utils/calcBalance'
import { useTransactions } from '../hooks/useTransactions'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { ACCOUNT_TYPES, CURRENCIES } from '../utils/constants'

function AccountCard({ account, transactions, onEdit, onDelete, getTypeLabel, getCurrencyLabel, convertToBRL }) {
    const [confirming, setConfirming] = useState(false)
    const balance = calcAccountBalance(account, transactions)
    const balanceBRL = account.currency !== 'BRL' && account.type !== 'credit'
        ? convertToBRL(balance, account.currency)
        : null

    return (
        <>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: account.color }}
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{account.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {getTypeLabel(account.type)} · {getCurrencyLabel(account.currency)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                        <p className={`text-sm font-medium ${account.type === 'credit' ? 'text-gray-700 dark:text-gray-300' :
                                balance < 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {account.type === 'credit'
                                ? `Limite: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: account.currency }).format(balance)}`
                                : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: account.currency }).format(balance)
                            }
                        </p>
                        {balanceBRL !== null && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                ≈ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanceBRL)}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => onEdit(account)}
                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                        Editar
                    </button>
                    <button
                        onClick={() => setConfirming(true)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                        Excluir
                    </button>
                </div>
            </div>

            {confirming && (
                <ConfirmModal
                    title="Excluir conta?"
                    message={`"${account.name}" será excluída permanentemente.`}
                    onConfirm={() => { onDelete(account.id); setConfirming(false) }}
                    onClose={() => setConfirming(false)}
                />
            )}
        </>
    )
}

export default function Accounts() {
    const { accounts, loading, addAccount, updateAccount, deleteAccount } = useAccounts()
    const { convertToBRL, loading: ratesLoading } = useExchangeRates()
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

    const normalAccounts = accounts.filter(a => a.type !== 'benefit' && a.type !== 'credit')
    const benefitAccounts = accounts.filter(a => a.type === 'benefit')

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
                    <h2 className="text-lg font-medium text-gray-800 dark:text-gray-100">Contas</h2>
                    <Button onClick={() => setShowForm(true)}>Nova conta</Button>
                </div>

                {accounts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-sm">
                        Nenhuma conta cadastrada ainda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {normalAccounts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Contas</p>
                                {normalAccounts.map(account => (
                                    <AccountCard
                                        key={account.id}
                                        account={account}
                                        transactions={transactions}
                                        onEdit={handleEdit}
                                        onDelete={deleteAccount}
                                        getTypeLabel={getTypeLabel}
                                        getCurrencyLabel={getCurrencyLabel}
                                        convertToBRL={convertToBRL}
                                    />
                                ))}
                            </div>
                        )}

                        {benefitAccounts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Benefícios</p>
                                {benefitAccounts.map(account => (
                                    <AccountCard
                                        key={account.id}
                                        account={account}
                                        transactions={transactions}
                                        onEdit={handleEdit}
                                        onDelete={deleteAccount}
                                        getTypeLabel={getTypeLabel}
                                        getCurrencyLabel={getCurrencyLabel}
                                        convertToBRL={convertToBRL}
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
                        excludeTypes={['credit']}
                    />
                )}
            </div>
        </Layout>
    )
}