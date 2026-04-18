export function SkeletonBlock({ className = '' }) {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
    )
}

export function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <SkeletonBlock className="w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                    <SkeletonBlock className="h-4 w-3/4" />
                    <SkeletonBlock className="h-3 w-1/2" />
                </div>
                <SkeletonBlock className="h-4 w-16 flex-shrink-0" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                <SkeletonBlock className="h-8 flex-1" />
                <SkeletonBlock className="h-8 flex-1" />
            </div>
        </div>
    )
}

export function SkeletonList({ count = 4 }) {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    )
}

export function SkeletonDashboard() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl px-5 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                        <SkeletonBlock className="h-3 w-1/2" />
                        <SkeletonBlock className="h-7 w-3/4" />
                        <SkeletonBlock className="h-3 w-1/3" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-5 flex flex-col gap-3">
                        <SkeletonBlock className="h-4 w-1/3" />
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                                <SkeletonBlock className="h-3 w-1/2" />
                                <SkeletonBlock className="h-3 w-1/4" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}