import React, { useEffect, useState, useCallback } from "react";
import "../styles/modal/BaseModal.css";

/* ======================================================
   BaseModalProps
====================================================== */
interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    footerButtons?: React.ReactNode | React.ReactNode[];
    size?: "small" | "medium" | "large";
    className?: string;
}

/* ======================================================
   BaseModal Component
====================================================== */
export const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    footerButtons,
    size = "medium",
    className = "",
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    /* ======================================================
       モーダル開閉アニメーション制御
    ======================================================= */
    useEffect(() => {
        let fadeTimeout: ReturnType<typeof setTimeout>;

        if (isOpen) {
            setIsMounted(true);
            fadeTimeout = setTimeout(() => setIsVisible(true), 50);
        } else {
            setIsVisible(false);
            fadeTimeout = setTimeout(() => setIsMounted(false), 300); // フェードアウト後にアンマウント
        }

        return () => clearTimeout(fadeTimeout);
    }, [isOpen]);

    /* ======================================================
       背景スクロール制御
    ======================================================= */
    useEffect(() => {
        if (isOpen) {
            // モーダルが開いている時は背景スクロールを無効化
            document.body.style.overflow = 'hidden';
        } else {
            // モーダルが閉じている時は背景スクロールを有効化
            document.body.style.overflow = 'unset';
        }

        // クリーンアップ: コンポーネントがアンマウントされる時もスクロールを復元
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    /* ======================================================
       背景クリックで閉じる
    ======================================================= */
    const handleOverlayClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) onClose();
        },
        [onClose]
    );

    /* ======================================================
       ESCキーでも閉じる（任意）
    ======================================================= */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    /* ======================================================
       非表示時はDOMごと削除
    ======================================================= */
    if (!isMounted) return null;

    /* ======================================================
       JSX
    ======================================================= */
    return (
        <div
            className={`modal-overlay ${isVisible ? "fade-in" : "fade-out"}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`modal-content ${size} ${isVisible ? "fade-in" : "fade-out"
                    } ${className}`.trim()}
            >
                {/* ---------- ヘッダー ---------- */}
                {title && (
                    <div className="modal-header">
                        <h3 className="modal-title">{title}</h3>
                    </div>
                )}

                {/* ---------- コンテンツ ---------- */}
                <div className="modal-body">
                    {description && (
                        <p className="modal-description">{description}</p>
                    )}
                    {children}
                </div>

                {/* ---------- フッター ---------- */}
                {footerButtons && (
                    <div className="modal-footer">
                        {Array.isArray(footerButtons)
                            ? footerButtons.map((btn, i) => <React.Fragment key={i}>{btn}</React.Fragment>)
                            : footerButtons}
                    </div>
                )}
            </div>
        </div>
    );
};
