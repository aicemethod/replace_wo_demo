import React, { useState, useRef, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import "../styles/components/Select.css";
import type { SelectProps } from "../../types/components";

/**
 * 共通Selectコンポーネント
 * - カスタムドロップダウン
 * - 外部クリックで閉じる
 * - disabled / placeholder 対応
 */
export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "選択してください",
    disabled = false,
    className = "",
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    /** 外部クリックで閉じる */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /** 現在のラベルを取得 */
    const selectedLabel = options.find((opt) => opt.value === value)?.label;

    /** 値選択時の処理 */
    const handleSelect = (val: string) => {
        onChange?.(val);
        setOpen(false);
    };

    /** クラス結合 */
    const wrapperClass = [
        "select-wrapper",
        open && "open",
        disabled && "disabled",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const textClass = ["select-text", !selectedLabel && "placeholder"]
        .filter(Boolean)
        .join(" ");

    return (
        <div ref={wrapperRef} className={wrapperClass}>
            {/* 表示部分 */}
            <div
                className="select-display"
                onClick={() => !disabled && setOpen((prev) => !prev)}
                role="button"
                aria-expanded={open}
                aria-haspopup="listbox"
                tabIndex={disabled ? -1 : 0}
            >
                <span className={textClass}>
                    {selectedLabel || placeholder}
                </span>
                <span className="select-icon">
                    <FaIcons.FaChevronDown />
                </span>
            </div>

            {/* ドロップダウンリスト */}
            {open && (
                <div className="select-option-list" role="listbox">
                    {options.length > 0 ? (
                        options.map((opt) => (
                            <div
                                key={opt.value}
                                className={`select-option ${opt.value === value ? "selected" : ""
                                    }`}
                                role="option"
                                aria-selected={opt.value === value}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))
                    ) : (
                        <div className="select-option empty">データがありません</div>
                    )}
                </div>
            )}
        </div>
    );
};
