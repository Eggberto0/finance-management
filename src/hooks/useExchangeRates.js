import { useState, useEffect } from 'react'

const CACHE_KEY = 'exchange_rates'
const CACHE_DURATION = 60 * 60 * 1000

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'ARS']

export function useExchangeRates() {
    const [rates, setRates] = useState({})
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)

    useEffect(() => {
        async function fetchRates() {
            try {
                const cached = localStorage.getItem(CACHE_KEY)
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached)
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setRates(data)
                        setLastUpdated(new Date(timestamp))
                        setLoading(false)
                        return
                    }
                }

                const pairs = SUPPORTED_CURRENCIES.map(c => `${c}-BRL`).join(',')
                const response = await fetch(`https://economia.awesomeapi.com.br/last/${pairs}`)
                const json = await response.json()

                const data = {}
                for (const key of Object.keys(json)) {
                    const currency = key.replace('BRL', '')
                    data[currency] = parseFloat(json[key].bid)
                }

                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }))

                setRates(data)
                setLastUpdated(new Date())
            } catch (error) {
                console.error('Erro ao buscar cotações:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRates()
        const interval = setInterval(fetchRates, CACHE_DURATION)
        return () => clearInterval(interval)
    }, [])

    function convertToBRL(amount, currency) {
        if (currency === 'BRL') return amount
        const rate = rates[currency]
        if (!rate) return null
        return amount * rate
    }

    function formatRate(currency) {
        const rate = rates[currency]
        if (!rate) return '—'
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(rate)
    }

    return { rates, loading, lastUpdated, convertToBRL, formatRate }
}