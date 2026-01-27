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
    const { i18n } = useTranslation();
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
        return `${month}/${day}（${weekday}）`;
    }, [sourceDate, i18n.language]);

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="1日コピーの実行"
            className="day-copy-modal"
            footerButtons={[
                <Button key="cancel" label="キャンセル" color="secondary" onClick={onClose} />,
                <Button
                    key="execute"
                    label="実行"
                    color="primary"
                    disabled={!targetDate}
                    onClick={() => onExecute?.(targetDate)}
                />,
            ]}
        >
            <div className="copy-section">
                <div className="copy-section-label">コピー元（Source）</div>
                <div className="copy-source-card">
                    <FaIcons.FaRegCalendarAlt className="copy-source-icon" />
                    <span className="copy-source-date">{sourceDateLabel}</span>
                    <span className="copy-source-separator">｜</span>
                    <span className="copy-source-count">{sourceEntryCount}エントリ</span>
                </div>
            </div>

            <div className="copy-arrow">
                <FaIcons.FaArrowDown />
            </div>

            <div className="copy-section">
                <div className="copy-section-label">
                    コピー先（Target）
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
                    <div className="copy-warning-title">上書き注意</div>
                    <div className="copy-warning-text">
                        指定した日付にすでにエントリが存在する場合、それらはすべて削除され、上書きされます。
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};
