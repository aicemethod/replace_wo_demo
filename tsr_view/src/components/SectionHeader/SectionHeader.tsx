import { useSectionHeader } from './useSectionHeader';
import './SectionHeader.css';

interface SectionHeaderProps {
    title: string;
    options?: string[];
    onOptionSelect?: (option: string) => void;
}

export default function SectionHeader({ title, options = [], onOptionSelect }: SectionHeaderProps) {
    const { isOpen, toggleOpen, handleOptionSelect } = useSectionHeader({ onOptionSelect });

    return (
        <div className="sectionheader-container">
            <span className="sectionheader-title">{title}</span>
            {options.length > 0 && (
                <div className="sectionheader-menu-wrapper">
                    <button
                        className="sectionheader-toggle-button"
                        onClick={toggleOpen}
                    />
                    <div className={`sectionheader-dropdown ${isOpen ? 'sectionheader-dropdown-open' : ''}`}>
                        {options.map((option, index) => (
                            <button
                                key={index}
                                className="sectionheader-option"
                                onClick={() => handleOptionSelect(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
