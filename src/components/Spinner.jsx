export default function Spinner() {
    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-[100]">
            <div className="animate-spin">
                <svg width="48" height="48" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M8 3v10" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M5 5l6 6" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
                    <path d="M11 5l-6 6" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.6" />
                </svg>
            </div>
        </div>
    )
}