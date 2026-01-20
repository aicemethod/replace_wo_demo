import React, { useState, useRef, useEffect, useMemo } from "react";
import * as FaIcons from "react-icons/fa";
import { BaseModal } from "./BaseModal";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import type { Option } from "../../types";
import { ResourceSelectModal } from "./ResourceSelectModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import "../styles/modal/TimeEntryModal.css";
import { useTranslation } from "react-i18next";

/* =========================================================
   型定義
========================================================= */
export interface TimeEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (data: any) => void;
    selectedDateTime?: { start: Date; end: Date } | null;
    selectedEvent?: any | null;
    woOptions: Option[];
    maincategoryOptions: Option[];
    paymenttypeOptions: Option[];
    timecategoryOptions: Option[];
    timezoneOptions: Option[];
    isSubgrid?: boolean;
    selectedWO?: string;
    selectedIndirectTask?: { subcategoryName: string; taskName: string } | null;
}

/* =========================================================
   メインコンポーネント
========================================================= */
export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    onDuplicate,
    selectedDateTime,
    selectedEvent,
    woOptions,
    maincategoryOptions,
    paymenttypeOptions,
    timecategoryOptions,
    timezoneOptions,
    isSubgrid = false,
    selectedWO = "",
    selectedIndirectTask = null,
}) => {
    const { t } = useTranslation();

    /* -------------------------------
       🧭 状態管理
    ------------------------------- */
    const [mode, setMode] = useState<"create" | "edit" | "duplicate">("create");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [comment, setComment] = useState("");
    const [wo, setWo] = useState("");
    const [endUser, setEndUser] = useState("");
    const [timezone, setTimezone] = useState("235");
    const [timeCategory, setTimeCategory] = useState("");
    const [mainCategory, setMainCategory] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const [task, setTask] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [resource, setResource] = useState("");

    const [startDate, setStartDate] = useState("");
    const [startHour, setStartHour] = useState("");
    const [startMinute, setStartMinute] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endHour, setEndHour] = useState("");
    const [endMinute, setEndMinute] = useState("");

    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    /* -------------------------------
       🧩 リソースモーダル
    ------------------------------- */
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const openResourceModal = () => setIsResourceModalOpen(true);
    const closeResourceModal = () => setIsResourceModalOpen(false);

    const handleResourceSave = (selectedResources: { id: string; label: string }[]) => {
        setResource(selectedResources.map((r) => r.label).join("\n"));
        closeResourceModal();
    };

    /* -------------------------------
       ⏰ 選択肢（Select用）
    ------------------------------- */
    const filteredWoOptions = useMemo(
        () => woOptions.filter((opt) => opt.value !== "all"),
        [woOptions]
    );

    const hours = useMemo<Option[]>(
        () =>
            Array.from({ length: 24 }, (_, i) => ({
                value: String(i).padStart(2, "0"),
                label: `${String(i).padStart(2, "0")}${t("timeEntryModal.hourSuffix")}`,
            })),
        [t]
    );

    const minutes = useMemo<Option[]>(
        () =>
            Array.from({ length: 60 }, (_, i) => ({
                value: String(i).padStart(2, "0"),
                label: `${String(i).padStart(2, "0")}${t("timeEntryModal.minuteSuffix")}`,
            })),
        [t]
    );

    const endUserOptions: Option[] = [
        { value: "abc", label: t("timeEntryModal.sampleEndUser1") },
        { value: "xyz", label: t("timeEntryModal.sampleEndUser2") },
        { value: "sample", label: t("timeEntryModal.sampleEndUser3") },
    ];

    const taskOptions: Option[] = [
        { value: "doc", label: t("timeEntryModal.task_list.document") },
        { value: "code", label: t("timeEntryModal.task_list.coding") },
        { value: "test", label: t("timeEntryModal.task_list.test") },
    ];

    /* -------------------------------
       📅 日付フォーマット関数
    ------------------------------- */
    const formatLocalDate = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    /* -------------------------------
       🪄 初期化処理
    ------------------------------- */
    useEffect(() => {
        if (!isOpen) return;

        if (selectedEvent) {
            // 複製フラグをチェック
            setMode(selectedEvent.isDuplicate ? "duplicate" : "edit");
            const start = new Date(selectedEvent.start);
            const end = new Date(selectedEvent.end);

            setStartDate(formatLocalDate(start));
            setStartHour(String(start.getHours()).padStart(2, "0"));
            setStartMinute(String(start.getMinutes()).padStart(2, "0"));
            setEndDate(formatLocalDate(end));
            setEndHour(String(end.getHours()).padStart(2, "0"));
            setEndMinute(String(end.getMinutes()).padStart(2, "0"));

            setWo(selectedEvent.workOrder ?? "");
            setMainCategory(String(selectedEvent.maincategory ?? ""));
            setTimeCategory(String(selectedEvent.timecategory ?? ""));
            setPaymentType(String(selectedEvent.paymenttype ?? ""));
            setComment(selectedEvent.comment ?? "");
            setEndUser(selectedEvent.endUser ?? "");
            setTask(selectedEvent.task ?? "");
            setTimezone(String(selectedEvent.timezone ?? ""));
            setResource(selectedEvent.resource ?? "");
        } else if (selectedDateTime) {
            setMode("create");
            const { start, end } = selectedDateTime;

            setStartDate(formatLocalDate(start));
            setStartHour(String(start.getHours()).padStart(2, "0"));
            setStartMinute(String(start.getMinutes()).padStart(2, "0"));
            setEndDate(formatLocalDate(end));
            setEndHour(String(end.getHours()).padStart(2, "0"));
            setEndMinute(String(end.getMinutes()).padStart(2, "0"));

            // サブグリッドの場合、selectedWOを自動設定
            setWo(isSubgrid && selectedWO ? selectedWO : "");
            setEndUser("");
            setTimezone("235");
            
            // 間接タスクが選択されている場合の処理
            if (selectedIndirectTask) {
                // タイムカテゴリを「間接工数」にセット（値は931440002を想定、実際の値に合わせて調整）
                const indirectTimeCategory = timecategoryOptions.find(opt => 
                    opt.label.includes("間接") || opt.value === "931440002"
                );
                setTimeCategory(indirectTimeCategory?.value || "");
                setSubcategory(selectedIndirectTask.subcategoryName);
                setTask(selectedIndirectTask.taskName);
            } else {
                setTimeCategory("");
                setSubcategory("");
                setTask("");
            }
            
            setMainCategory("");
            setPaymentType("");
            setComment("");
            setResource("");
        }
    }, [isOpen, selectedEvent, selectedDateTime, isSubgrid, selectedWO, selectedIndirectTask, timecategoryOptions]);

    /* -------------------------------
       💾 保存処理
    ------------------------------- */
    const handleSave = () => {
        const start = new Date(`${startDate}T${startHour}:${startMinute}`);
        const end = new Date(`${endDate}T${endHour}:${endMinute}`);

        onSubmit({
            id: selectedEvent?.id || "",
            wo,
            start,
            end,
            endUser,
            timezone,
            resource,
            timeCategory,
            mainCategory,
            paymentType,
            task,
            comment,
        });
        onClose();
    };

    /* -------------------------------
       🗑 削除処理
    ------------------------------- */
    const handleDelete = () => {
        if (!selectedEvent?.id) return;
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete && selectedEvent?.id) {
            onDelete(selectedEvent.id);
            setIsDeleteModalOpen(false);
            onClose();
        }
    };

    /* -------------------------------
       📋 複製処理
    ------------------------------- */
    const handleDuplicate = () => {
        // 現在の値を取得
        const currentData = {
            wo,
            startDate,
            startHour,
            startMinute,
            endDate,
            endHour,
            endMinute,
            endUser,
            timezone,
            resource,
            timeCategory,
            mainCategory,
            paymentType,
            task,
            comment,
        };

        // 親コンポーネントに複製イベントを通知（モーダルは閉じない）
        if (onDuplicate) {
            onDuplicate(currentData);
        }
    };

    /* -------------------------------
       🎨 JSX
    ------------------------------- */
    return (
        <>
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title={
                    mode === "edit"
                        ? t("timeEntryModal.titleEdit")
                        : mode === "duplicate"
                            ? t("timeEntryModal.titleDuplicate") || "複製"
                            : t("timeEntryModal.titleCreate")
                }
                description={
                    mode === "edit"
                        ? t("timeEntryModal.descEdit")
                        : mode === "duplicate"
                            ? t("timeEntryModal.descDuplicate") || "複製されたタイムエントリを編集してください。"
                            : t("timeEntryModal.descCreate")
                }
                footerButtons={
                    mode === "edit"
                        ? [
                            <div key="edit-footer" className="timeentry-modal-footer">
                                <div className="timeentry-modal-footer-left">
                                    <Button
                                        key="delete"
                                        label={t("timeEntryModal.delete") || "削除"}
                                        color="secondary"
                                        onClick={handleDelete}
                                        className="timeentry-delete-button"
                                    />
                                </div>
                                <div className="timeentry-modal-footer-right">
                                    <Button
                                        key="cancel"
                                        label={t("timeEntryModal.cancel")}
                                        color="secondary"
                                        onClick={onClose}
                                        className="timeentry-cancel-button"
                                    />
                                    <Button
                                        key="duplicate"
                                        label={t("timeEntryModal.duplicate") || "複製"}
                                        color="secondary"
                                        onClick={handleDuplicate}
                                        className="timeentry-duplicate-button"
                                    />
                                    <Button
                                        key="save"
                                        label={t("timeEntryModal.update")}
                                        color="primary"
                                        onClick={handleSave}
                                        className="timeentry-save-button"
                                    />
                                </div>
                            </div>
                        ]
                        : [
                            <Button
                                key="cancel"
                                label={t("timeEntryModal.cancel")}
                                color="secondary"
                                onClick={onClose}
                                className="timeentry-cancel-button"
                            />,
                            <Button
                                key="save"
                                label={
                                    mode === "duplicate"
                                        ? t("timeEntryModal.update")
                                        : t("timeEntryModal.create")
                                }
                                color="primary"
                                onClick={handleSave}
                                className="timeentry-create-button"
                            />,
                        ]
                }
                size="large"
            >
                <div className="timeentry-modal-body">
                    {/* WO番号選択（サブグリッドの場合は非表示） */}
                    {!isSubgrid && (
                        <>
                            <label className="modal-label">{t("timeEntryModal.woNumber")}</label>
                            <Select
                                options={filteredWoOptions}
                                value={wo}
                                onChange={setWo}
                                placeholder={t("timeEntryModal.placeholders.selectWO")}
                            />
                        </>
                    )}

                    <div className="modal-grid">
                        <div>
                            <label className="modal-label">{t("timeEntryModal.startDate")}</label>
                            <div className="datetime-row">
                                <Input
                                    ref={startDateRef}
                                    type="date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    className="datetime-row-input"
                                    suffix={
                                        <FaIcons.FaRegCalendarAlt
                                            className="icon"
                                            onClick={() => startDateRef.current?.showPicker?.()}
                                        />
                                    }
                                />
                                <Select options={hours} value={startHour} onChange={setStartHour} />
                                <Select options={minutes} value={startMinute} onChange={setStartMinute} />
                            </div>

                            <label className="modal-label">{t("timeEntryModal.endDate")}</label>
                            <div className="datetime-row">
                                <Input
                                    ref={endDateRef}
                                    type="date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    className="datetime-row-input"
                                    suffix={
                                        <FaIcons.FaRegCalendarAlt
                                            className="icon"
                                            onClick={() => endDateRef.current?.showPicker?.()}
                                        />
                                    }
                                />
                                <Select options={hours} value={endHour} onChange={setEndHour} />
                                <Select options={minutes} value={endMinute} onChange={setEndMinute} />
                            </div>

                            <label className="modal-label">EndUser</label>
                            <Select
                                options={endUserOptions}
                                value={endUser}
                                onChange={setEndUser}
                                placeholder={t("timeEntryModal.placeholders.selectEndUser")}
                            />

                            <label className="modal-label">{t("timeEntryModal.location")}</label>
                            <Select
                                options={timezoneOptions}
                                value={timezone}
                                onChange={setTimezone}
                                placeholder={t("timeEntryModal.placeholders.selectLocation")}
                            />

                            <div className="resource-header">
                                <label className="modal-label">{t("timeEntryModal.resource")}</label>
                                <a href="#" className="resource-link" onClick={openResourceModal}>
                                    {t("timeEntryModal.selectResource")}
                                </a>
                            </div>

                            <Textarea
                                placeholder={t("timeEntryModal.resourcePlaceholder")}
                                value={resource}
                                onChange={setResource}
                                rows={4}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="modal-label">{t("timeEntryModal.timeCategory")}</label>
                            {selectedIndirectTask ? (
                                <Input 
                                    value={timecategoryOptions.find(opt => opt.value === timeCategory)?.label || ""} 
                                    disabled 
                                />
                            ) : (
                                <Select
                                    options={timecategoryOptions}
                                    value={timeCategory}
                                    onChange={setTimeCategory}
                                    placeholder={t("timeEntryModal.placeholders.selectTimeCategory")}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.mainCategory")}</label>
                            <Select
                                options={maincategoryOptions}
                                value={mainCategory}
                                onChange={setMainCategory}
                                placeholder={t("timeEntryModal.placeholders.selectMainCategory")}
                            />

                            <label className="modal-label">{t("timeEntryModal.paymentType")}</label>
                            <Select
                                options={paymenttypeOptions}
                                value={paymentType}
                                onChange={setPaymentType}
                                placeholder={t("timeEntryModal.placeholders.selectPaymentType")}
                            />

                            <label className="modal-label">{t("timeEntryModal.subCategory")}</label>
                            {selectedIndirectTask ? (
                                <Input value={subcategory} disabled />
                            ) : (
                                <Input value={t("timeEntryModal.auto")} disabled />
                            )}

                            <label className="modal-label">{t("timeEntryModal.task")}</label>
                            {selectedIndirectTask ? (
                                <Input value={task} disabled />
                            ) : (
                                <Select
                                    options={taskOptions}
                                    value={task}
                                    onChange={setTask}
                                    placeholder={t("timeEntryModal.placeholders.selectTask")}
                                />
                            )}

                            <Textarea
                                label={t("timeEntryModal.comment")}
                                value={comment}
                                onChange={setComment}
                                placeholder={t("timeEntryModal.placeholders.enterComment")}
                                rows={4}
                                showCount
                                maxLength={2000}
                            />
                        </div>
                    </div>
                </div>
            </BaseModal>

            {/* ✅ 削除確認モーダル */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            {/* ✅ リソース選択モーダル */}
            <ResourceSelectModal
                isOpen={isResourceModalOpen}
                onClose={closeResourceModal}
                onSave={handleResourceSave}
            />
        </>
    );
};
