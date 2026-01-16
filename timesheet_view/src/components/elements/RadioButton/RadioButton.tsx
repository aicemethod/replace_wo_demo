import './RadioButton.css';

type RadioButtonOption = {
  value: string;
  label: string;
};

type RadioButtonProps = {
  name: string;
  options: RadioButtonOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

// 汎用ラジオボタンコンポーネント
function RadioButton({ name, options, value, onChange, className = '' }: RadioButtonProps) {
  return (
    <div className={`radio-button-group ${className}`}>
      {options.map((option) => {
        const id = `radio-${name}-${option.value}`;
        return (
          <label key={option.value} className="radio-button-option" htmlFor={id}>
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="radio-button-input"
            />
            <span className="radio-button-label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default RadioButton;
export type { RadioButtonOption };

