import React, { useMemo } from "react";
import "../styles/components/Textarea.css";
import type { TextareaProps } from "../../types/components";

/**
 * 共通 Textarea コンポーネント
 * - ラベル／文字数カウンター付き
 * - disabled / readOnly 対応
 * - コンパクトなデザイン・再利用性重視
 */
export const Textarea: React.FC<TextareaProps> = ({
    label,
    value = "",
    onChange,
    placeholder = "",
    rows = 4,
    disabled = false,
    readOnly = false,
    showCount = false,
    maxLength,
    className = "",
    onClick,
}) => {
    /** 改行を除いた文字数を算出 */
    const charCount = useMemo(() => value.replace(/\n/g, "").length, [value]);

    /** 文字数オーバー判定 */
    const isOverLimit = maxLength !== undefined && charCount > maxLength;

    /** コンテナクラス結合 */
    const wrapperClass = ["textarea-wrapper", className].filter(Boolean).join(" ");
    const textareaClass = [
        "textarea-field",
        disabled && "disabled",
        readOnly && "readonly",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={wrapperClass}>
            {/* ヘッダー：ラベル + カウンター */}
            {(label || showCount) && (
                <div className="textarea-header">
                    {label && <label className="textarea-label">{label}</label>}
                    {showCount && (
                        <span
                            className={`textarea-count ${isOverLimit ? "over-limit" : ""}`}
                        >
                            {charCount}
                            {maxLength ? ` / ${maxLength}` : ""}
                        </span>
                    )}
                </div>
            )}

            {/* 入力エリア */}
            <div className="textarea-container">
                <textarea
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    onClick={onClick}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    readOnly={readOnly}
                    className={textareaClass}
                />
            </div>
        </div>
    );
};
