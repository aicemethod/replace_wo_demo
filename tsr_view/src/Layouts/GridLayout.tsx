import type { ReactNode } from 'react';
import { useGridLayout } from './useGridLayout';
import './GridLayout.css';

interface GridLayoutProps {
    columns?: 1 | 2 | 3;
    gap?: string;
    children: ReactNode;
}

export default function GridLayout({ columns = 1, gap = '1rem', children }: GridLayoutProps) {
    const { gridColumns } = useGridLayout({ columns, gap, children });

    return (
        <div
            className="gridlayout-container"
            data-columns={gridColumns}
            style={{ gap }}
        >
            {children}
        </div>
    );
}
