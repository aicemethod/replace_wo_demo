import './Checkbox.css';

type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  id?: string;
  className?: string;
};

// 汎用チェックボックスコンポーネント
function Checkbox({
  checked,
  onChange,
  id,
  className = '',
}: CheckboxProps) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <input
      id={checkboxId}
      type="checkbox"
      className={`checkbox-input ${className}`}
      checked={checked}
      onChange={onChange}
    />
  );
}

export default Checkbox;

