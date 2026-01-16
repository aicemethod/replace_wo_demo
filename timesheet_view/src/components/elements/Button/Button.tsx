import type { ReactNode, CSSProperties } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'static';
type ButtonColor = 'primary' | 'secondary';

type ButtonProps = {
  variant?: ButtonVariant;
  color?: ButtonColor;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  'aria-label'?: string;
  style?: CSSProperties;
};

// 汎用ボタンコンポーネント
function Button({
  variant = 'primary',
  color,
  onClick,
  children,
  className = '',
  type = 'button',
  disabled = false,
  'aria-label': ariaLabel,
  style,
}: ButtonProps) {
  // staticバリアントの場合、colorプロップに基づいてクラスを追加
  const colorClass = variant === 'static' && color ? `button-static-${color}` : '';
  const finalClassName = `button button-${variant} ${colorClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={finalClassName}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </button>
  );
}

export default Button;

