import { useState } from 'react'

const steps = [
    {
        title: 'Bem-vindo ao Financer 👋',
        content: (
            <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Você está acessando a versão <span className="font-medium text-gray-800 dark:text-gray-100">beta fechada</span> do Financer — um sistema de controle financeiro pessoal feito para dar visibilidade real ao seu dinheiro.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Durante a beta, o acesso é <span className="font-medium text-gray-800 dark:text-gray-100">completamente gratuito</span>. Nenhuma cobrança será feita nesta fase.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Este tutorial pode ser acessado novamente a qualquer momento pelas <span className="font-medium text-gray-800 dark:text-gray-100">configurações</span>.
                </p>
            </div>
        )
    },
    {
        title: 'O que você pode fazer',
        content: (
            <div className="flex flex-col gap-2">
                {[
                    { emoji: '🏦', label: 'Contas e carteiras', desc: 'Gerencie contas, cartões e moedas estrangeiras' },
                    { emoji: '💳', label: 'Cartões de crédito', desc: 'Acompanhe faturas e marque como pagas com um clique' },
                    { emoji: '📋', label: 'Lançamentos', desc: 'Registre receitas, despesas e transferências' },
                    { emoji: '🔁', label: 'Recorrentes', desc: 'Automatize salários, aluguéis e contas fixas' },
                    { emoji: '🎯', label: 'Cofrinhos e orçamento', desc: 'Defina metas e limites por categoria' },
                    { emoji: '📊', label: 'Dashboard', desc: 'Visão geral do seu financeiro em tempo real' },
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 py-1.5">
                        <span className="text-lg w-7 flex-shrink-0">{item.emoji}</span>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.label}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        title: 'Como começar',
        content: (
            <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Siga estes passos para configurar o Financer do jeito certo:
                </p>
                {[
                    { step: '1', title: 'Crie suas contas', desc: 'Adicione suas contas bancárias com o saldo atual de cada uma.' },
                    { step: '2', title: 'Adicione categorias', desc: 'Crie categorias para organizar seus gastos e receitas.' },
                    { step: '3', title: 'Configure recorrentes', desc: 'Cadastre salário, aluguel e outras entradas e saídas fixas.' },
                    { step: '4', title: 'Lance suas transações', desc: 'Registre o que entra e sai para ter o controle completo.' },
                ].map(item => (
                    <div key={item.step} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {item.step}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.title}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        title: 'Tudo pronto!',
        content: (
            <div className="flex flex-col gap-3 items-center text-center">
                <span className="text-5xl">🚀</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    O Financer está pronto para te ajudar a ter controle total do seu dinheiro.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Qualquer dúvida ou sugestão, estamos abertos ao seu feedback — ele é essencial para melhorar o app durante a beta.
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    Bom controle financeiro! 💰
                </p>
            </div>
        )
    }
]

export default function OnboardingModal({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0)
    const step = steps[currentStep]
    const isLast = currentStep === steps.length - 1

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md flex flex-col gap-6 p-7">

                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all ${i === currentStep
                                        ? 'w-6 bg-gray-900 dark:bg-gray-100'
                                        : i < currentStep
                                            ? 'w-3 bg-gray-400 dark:bg-gray-500'
                                            : 'w-3 bg-gray-200 dark:bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                    {!isLast && (
                        <button
                            onClick={onComplete}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                        >
                            Pular
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-base font-medium text-gray-800 dark:text-gray-100">{step.title}</h2>
                    {step.content}
                </div>

                <div className="flex justify-between items-center pt-1">
                    {currentStep > 0 ? (
                        <button
                            onClick={() => setCurrentStep(s => s - 1)}
                            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                        >
                            ← Voltar
                        </button>
                    ) : <div />}

                    <button
                        onClick={() => isLast ? onComplete() : setCurrentStep(s => s + 1)}
                        className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-5 py-2 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition"
                    >
                        {isLast ? 'Começar' : 'Continuar →'}
                    </button>
                </div>
            </div>
        </div>
    )
}