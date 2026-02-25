import { useEffect, useMemo, useRef, useState } from "react";
import * as FaIcons from "react-icons/fa";
import { BaseModal } from "./BaseModal";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import "../styles/modal/DayCopyModal.css";
import { useTranslation } from "react-i18next";

export type DayCopyModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onExecute?: (targetDate: string) => void;
    sourceDate: Date | null;
    sourceEntryCount: number;
};

export const DayCopyModal: React.FC<DayCopyModalProps> = ({
    isOpen,
    onClose,
    onExecute,
    sourceDate,
    sourceEntryCount,
}) => {
    const { i18n, t } = useTranslation();
    const [targetDate, setTargetDate] = useState("");
    const endDateRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setTargetDate("");
    }, [isOpen, sourceDate]);

    const sourceDateLabel = useMemo(() => {
        if (!sourceDate) return "";
        const locale = i18n.language.startsWith("ja") ? "ja-JP" : "en-US";
        const parts = new Intl.DateTimeFormat(locale, {
            month: "2-digit",
            day: "2-digit",
            weekday: "short",
        }).formatToParts(sourceDate);
        const month = parts.find((p) => p.type === "month")?.value ?? "";
        const day = parts.find((p) => p.type === "day")?.value ?? "";
        const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
        return i18n.language.startsWith("ja")
            ? `${month}/${day}（${weekday}）`
            : `${month}/${day} (${weekday})`;
    }, [sourceDate, i18n.language]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={t("dayCopyModal.title")}
            className="day-copy-modal"
            footerButtons={[
                <Button key="cancel" label={t("dayCopyModal.cancel")} color="secondary" onClick={onClose} />,
                <Button
                    key="execute"
                    label={t("dayCopyModal.execute")}
                    color="primary"
                    disabled={!targetDate}
                    onClick={() => onExecute?.(targetDate)}
                />,
            ]}
        >
            <div className="copy-section">
                <div className="copy-section-label">{t("dayCopyModal.source")}</div>
                <div className="copy-source-card">
                    <FaIcons.FaRegCalendarAlt className="copy-source-icon" />
                    <span className="copy-source-date">{sourceDateLabel}</span>
                    <span className="copy-source-separator">｜</span>
                    <span className="copy-source-count">{sourceEntryCount}{t("dayCopyModal.entries")}</span>
                </div>
            </div>

            <div className="copy-arrow">
                <FaIcons.FaArrowDown />
            </div>

            <div className="copy-section">
                <div className="copy-section-label">
                    {t("dayCopyModal.target")}
                    <span className="copy-required">*</span>
                </div>
                <Input
                    ref={endDateRef}
                    type="date"
                    value={targetDate}
                    onChange={setTargetDate}
                    className="datetime-row-input"
                    suffix={
                        <FaIcons.FaRegCalendarAlt
                            className="icon"
                            onClick={() => endDateRef.current?.showPicker?.()}
                        />
                    }
                />
            </div>

            <div className="copy-warning">
                <FaIcons.FaExclamationTriangle className="copy-warning-icon" />
                <div>
                    <div className="copy-warning-title">{t("dayCopyModal.overwriteTitle")}</div>
                    <div className="copy-warning-text">
                        {t("dayCopyModal.overwriteText")}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};
