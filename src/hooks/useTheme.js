import { useState, useEffect } from 'react'

const ACCENT_COLORS = {
    green: { light: '#2d6a4f', dark: '#00a13b', lightBg: '#d8edd6', darkBg: '#003f19' },
    blue: { light: '#1e40af', dark: '#076be6', lightBg: '#dbeafe', darkBg: '#1e3a5f' },
    purple: { light: '#6d28d9', dark: '#831ade', lightBg: '#ede9fe', darkBg: '#340657' },
    orange: { light: '#c2410c', dark: '#fb923c', lightBg: '#ffedd5', darkBg: '#431407' },
    pink: { light: '#f30b6c', dark: '#f472b6', lightBg: '#fce7f3', darkBg: '#500724' },
}

export function useTheme() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'dark')
    const [accent, setAccent] = useState(() => localStorage.getItem('accent') ?? 'green')

    useEffect(() => {
        const root = document.documentElement
        const colors = ACCENT_COLORS[accent] ?? ACCENT_COLORS.green

        if (theme === 'dark') {
            root.classList.add('dark')
            root.style.setProperty('--accent', colors.dark)
            root.style.setProperty('--accent-light', colors.darkBg)
            root.style.setProperty('--accent-text', '#052e16')
        } else {
            root.classList.remove('dark')
            root.style.setProperty('--accent', colors.light)
            root.style.setProperty('--accent-light', colors.lightBg)
            root.style.setProperty('--accent-text', '#fff')
        }

        localStorage.setItem('theme', theme)
        localStorage.setItem('accent', accent)
    }, [theme, accent])

    function toggleTheme() {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    function changeAccent(color) {
        setAccent(color)
    }

    return { theme, toggleTheme, accent, changeAccent, ACCENT_COLORS }
}