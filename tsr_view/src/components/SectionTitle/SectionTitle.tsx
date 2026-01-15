import { useSectionTitle } from './useSectionTitle';
import './SectionTitle.css';

interface SectionTitleProps {
  title: string;
}

export default function SectionTitle({ title }: SectionTitleProps) {
  const { title: displayTitle } = useSectionTitle({ title });

  return (
    <div className="sectiontitle-container">
      <span className="sectiontitle-text">{displayTitle}</span>
      <div className="sectiontitle-border"></div>
    </div>
  );
}
