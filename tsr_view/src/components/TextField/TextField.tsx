import { useTextField } from './useTextField';
import './TextField.css';

interface TextFieldProps {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    error?: string;
    hasError?: boolean;
}

export default function TextField({
    label,
    value,
    onChange,
    placeholder = '',
    error,
    hasError = false
}: TextFieldProps) {
    const { currentValue, shouldShake, handleChange } = useTextField({
        value,
        onChange,
        hasError,
        error
    });

    const getInputClassName = () => {
        if (hasError && shouldShake) {
            return 'textfield-input textfield-input-error textfield-shake';
        }
        if (hasError) {
            return 'textfield-input textfield-input-error';
        }
        return 'textfield-input';
    };

    return (
        <div className="textfield-container">
            {label && (
                <div className="textfield-label">{label}</div>
            )}
            <input
                type="text"
                value={currentValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={getInputClassName()}
            />
            {hasError && error && (
                <div className="textfield-error">{error}</div>
            )}
        </div>
    );
}
