import type { ReactNode } from 'react';
import { useSectionLayout } from './useSectionLayout';
import './SectionLayout.css';

interface SectionLayoutProps {
    gap?: string;
    children: ReactNode;
}

export default function SectionLayout({ gap = '1rem', children }: SectionLayoutProps) {
    const { gap: gapValue } = useSectionLayout({ gap, children });

    return (
        <div
            className="sectionlayout-container"
            style={{ gap: gapValue }}
        >
            {children}
        </div>
    );
}
