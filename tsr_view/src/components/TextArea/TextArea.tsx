import { useTextArea } from './useTextArea';
import './TextArea.css';

interface TextAreaProps {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
}

export default function TextArea({
    label,
    value,
    onChange,
    placeholder = '',
    maxLength
}: TextAreaProps) {
    const { currentValue, currentLength, handleChange } = useTextArea({
        value,
        onChange,
        maxLength
    });

    return (
        <div className="textarea-container">
            <div className="textarea-header">
                {label && (
                    <div className="textarea-label">{label}</div>
                )}
                {maxLength && (
                    <div className="textarea-counter">
                        {currentLength} / {maxLength}
                    </div>
                )}
            </div>
            <textarea
                value={currentValue}
                onChange={handleChange}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={4}
                className="textarea-input"
            />
        </div>
    );
}
