import React from "react";
import "../styles/components/Button.css";
import type { ButtonProps } from "../../types/components";

/**
 * 共通ボタンコンポーネント
 * - primary / secondary の色指定
 * - disabled 状態
 * - アイコン付きボタン対応
 */
export const Button: React.FC<ButtonProps> = ({
    label,
    onClick,
    type = "button",
    color = "primary",
    disabled = false,
    icon,
    className = "",
}) => {
    /** クラス名を整理して構築 */
    const classNames = [
        "btn",
        `btn-${color}`,
        disabled ? "btn-disabled" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classNames}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled} // ← ネイティブ属性も適用（アクセシビリティ対応）
        >
            {icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-label">{label}</span>
        </button>
    );
};
