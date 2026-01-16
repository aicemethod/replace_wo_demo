import React, { forwardRef } from "react";
import "../styles/components/Input.css";
import type { InputProps } from "../../types/components";

/**
 * 共通 Input コンポーネント
 * - forwardRef 対応（例：ref.current?.showPicker()）
 * - width / suffix / disabled / label 対応
 * - アプリ全体でのフォーム共通デザインに利用
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            value = "",
            onChange,
            placeholder = "",
            type = "text",
            disabled = false,
            className = "",
            width = "100%",
            suffix,
            min,
            max,
        },
        ref
    ) => {
        /** 入力変更時ハンドラ（null安全対応） */
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.value);
        };

        /** クラス構築 */
        const wrapperClass = ["input-wrapper", className].filter(Boolean).join(" ");
        const inputClass = ["input-field", disabled ? "disabled" : ""].filter(Boolean).join(" ");

        return (
            <div className={wrapperClass} style={{ width }}>
                {label && (
                    <label className="input-label">
                        {label}
                    </label>
                )}

                <div className="input-inner">
                    <input
                        ref={ref}
                        type={type}
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={inputClass}
                        min={min}
                        max={max}
                    />
                    {suffix && <span className="input-suffix">{suffix}</span>}
                </div>
            </div>
        );
    }
);

Input.displayName = "Input"; // forwardRefでのデバッグ名付与
