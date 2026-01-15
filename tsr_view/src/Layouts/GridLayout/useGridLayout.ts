import type { ReactNode } from 'react';

interface UseGridLayoutProps {
    columns?: 1 | 2 | 3;
    gap?: string;
    children: ReactNode;
}

export function useGridLayout({ columns = 1, gap = '1rem', children }: UseGridLayoutProps) {
    const gridColumns = columns;

    return {
        gridColumns,
        gap,
        children
    };
}
