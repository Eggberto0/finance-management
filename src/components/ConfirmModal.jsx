export default function ConfirmModal({ title, message, confirmLabel = 'Excluir', onConfirm, onClose, danger = true }) {
    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
                <div>
                    <h3 className="text-base font-medium text-gray-800 dark:text-gray-100">{title}</h3>
                    {message && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>}
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition px-4 py-2"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`text-sm px-5 py-2 rounded-xl transition text-white ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}