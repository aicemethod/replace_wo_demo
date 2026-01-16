import React from "react";
import { BaseModal } from "./BaseModal";
import { Button } from "../components/Button";
import { useTranslation } from "react-i18next";
import "../styles/modal/ConfirmDeleteModal.css";

/* =========================================================
   型定義
========================================================= */
export interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

/* =========================================================
   コンポーネント本体
========================================================= */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}) => {
    const { t } = useTranslation();

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title || t("confirmDeleteModal.title") || "削除"}
            size="small"
            footerButtons={[
                <Button
                    key="cancel"
                    label={t("timeEntryModal.cancel")}
                    color="secondary"
                    onClick={onClose}
                />,
                <Button
                    key="confirm"
                    label={t("timeEntryModal.delete")}
                    onClick={onConfirm}
                    className="delete-button"
                />,
            ]}
        >
            <div className="confirm-delete-body">
                <p>{message || t("timeEntryModal.confirmDelete") || "選択した情報を削除します。"}</p>
                <p>{t("timeEntryModal.deleteWarning") || "削除したデータは復元ができません。"}</p>
                <p>{t("timeEntryModal.deleteConfirm") || "よろしいですか？"}</p>
            </div>
        </BaseModal>
    );
};
