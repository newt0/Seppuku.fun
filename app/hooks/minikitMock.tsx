import { ReactNode } from "react";

export function useMiniKit() {
    return {
        isFrameReady: true,
        setFrameReady: () => { },
    };
}

export function SafeArea({ children }: { children: ReactNode }) {
    return <div style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>{children}</div>;
}
