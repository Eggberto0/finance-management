import * as Icons from 'lucide-react'

export default function CategoryIcon({ name, size = 18, color, className }) {
    const Icon = Icons[name]
    if (!Icon) return null
    return <Icon size={size} color={color} className={className} />
}