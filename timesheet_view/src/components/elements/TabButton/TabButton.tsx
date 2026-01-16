import './TabButton.css';

type TabButtonOption = {
  value: string;
  label: string;
};

type TabButtonProps = {
  options: TabButtonOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

// 汎用タブボタンコンポーネント
function TabButton({ options, value, onChange, className = '' }: TabButtonProps) {
  return (
    <div className={`tab-button-group ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`tab-button-item ${value === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default TabButton;
export type { TabButtonOption };

