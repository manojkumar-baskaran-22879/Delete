export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
                <p className="font-mono text-sm tracking-widest text-brand-primary animate-pulse uppercase">
                    Loading
                </p>
            </div>
        </div>
    );
}
