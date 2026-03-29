import { useState } from 'react'
import ConfirmModal from './ConfirmModal'

export default function DeleteTransactionModal({ transaction, onClose, onDelete, onDeleteAll }) {
    const [step, setStep] = useState('choose')
    const [deleteType, setDeleteType] = useState(null)

    const hasInstallments = !!transaction.installmentId

    function handleChoose(type) {
        setDeleteType(type)
        setStep('confirm')
    }

    function handleConfirm() {
        if (deleteType === 'all') {
            onDeleteAll(transaction.installmentId)
        } else {
            onDelete(transaction.id)
        }
        onClose()
    }

    if (step === 'confirm') {
        return (
            <ConfirmModal
                title={deleteType === 'all' ? 'Excluir todas as parcelas?' : 'Excluir lançamento?'}
                message={
                    deleteType === 'all'
                        ? `Todas as ${transaction.installmentTotal} parcelas de "${transaction.description?.split(' (')[0]}" serão excluídas.`
                        : `"${transaction.description}" será excluído permanentemente.`
                }
                onConfirm={handleConfirm}
                onClose={() => setStep('choose')}
            />
        )
    }

    if (!hasInstallments) {
        return (
            <ConfirmModal
                title="Excluir lançamento?"
                message={`"${transaction.description}" será excluído permanentemente.`}
                onConfirm={() => { onDelete(transaction.id); onClose() }}
                onClose={onClose}
            />
        )
    }

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">O que deseja excluir?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    "{transaction.description?.split(' (')[0]}" é uma compra parcelada ({transaction.installmentNumber}/{transaction.installmentTotal}).
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => handleChoose('single')}
                        className="text-sm text-left border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <p className="font-medium text-gray-800 dark:text-gray-100">Excluir só esta parcela</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Parcela {transaction.installmentNumber} de {transaction.installmentTotal}</p>
                    </button>
                    <button
                        onClick={() => handleChoose('all')}
                        className="text-sm text-left border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                        <p className="font-medium text-red-600 dark:text-red-400">Excluir todas as parcelas</p>
                        <p className="text-xs text-red-400 dark:text-red-500 mt-0.5">Remove todas as {transaction.installmentTotal} parcelas desta compra</p>
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition text-center"
                >
                    Cancelar
                </button>
            </div>
        </div>
    )
}