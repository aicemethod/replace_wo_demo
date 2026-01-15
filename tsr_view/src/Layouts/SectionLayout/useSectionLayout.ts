import type { ReactNode } from 'react';

interface UseSectionLayoutProps {
    gap?: string;
    children: ReactNode;
}

export function useSectionLayout({ gap = '1rem', children }: UseSectionLayoutProps) {
    return {
        gap,
        children
    };
}
