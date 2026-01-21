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
import { getWorkOrderProtoFields, logWorkOrderFormFields } from "../../utils/xrmUtils";

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
    endUserOptions: Option[];
    deviceSnOptions: Option[];
    subcategoryOptions: Option[];
    paymentMainCategoryOptions: Option[];
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
    endUserOptions,
    deviceSnOptions,
    subcategoryOptions,
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
    const [workStatus, setWorkStatus] = useState("");
    const [resource, setResource] = useState("");
    const [wisdomBu, setWisdomBu] = useState("");
    const [sapBu, setSapBu] = useState("");
    const [deviceSn, setDeviceSn] = useState("");
    const [paymentMainCategory, setPaymentMainCategory] = useState("");

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

    const taskOptions: Option[] = [
        { value: "doc", label: t("timeEntryModal.task_list.document") },
        { value: "code", label: t("timeEntryModal.task_list.coding") },
        { value: "test", label: t("timeEntryModal.task_list.test") },
    ];

    const workStatusOptions: Option[] = [
        { value: "1", label: "進行中" },
        { value: "2", label: "完了" },
        { value: "3", label: "保留" },
        { value: "4", label: "キャンセル" },
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

        // proto_workorder フォームのフィールド値を取得してログ出力
        logWorkOrderFormFields();

        if (selectedEvent) {
            // 複製フラグをチェック
            const isDuplicate = selectedEvent.isDuplicate;
            setMode(isDuplicate ? "duplicate" : "edit");
            const start = new Date(selectedEvent.start);
            const end = new Date(selectedEvent.end);

            setStartDate(formatLocalDate(start));
            setStartHour(String(start.getHours()).padStart(2, "0"));
            setStartMinute(String(start.getMinutes()).padStart(2, "0"));
            setEndDate(formatLocalDate(end));
            setEndHour(String(end.getHours()).padStart(2, "0"));
            setEndMinute(String(end.getMinutes()).padStart(2, "0"));

            // proto_workorder フォームから値を取得（編集時は補完的に、複製時は上書き）
            const protoFields = getWorkOrderProtoFields();

            // WO番号
            setWo(selectedEvent.workOrder ?? "");

            // メインカテゴリ（selectedEventの値がない場合、または複製時はproto_workorderの値を使用）
            if (isDuplicate && protoFields?.proto_maincategory !== undefined && protoFields.proto_maincategory !== null) {
                setMainCategory(String(protoFields.proto_maincategory));
            } else {
                setMainCategory(String(selectedEvent.maincategory ?? protoFields?.proto_maincategory ?? ""));
            }

            // タイムカテゴリ
            setTimeCategory(String(selectedEvent.timecategory ?? ""));

            // PaymentType（selectedEventの値がない場合、または複製時はproto_workorderの値を使用）
            if (isDuplicate && protoFields?.proto_paymenttype !== undefined && protoFields.proto_paymenttype !== null) {
                setPaymentType(String(protoFields.proto_paymenttype));
            } else {
                setPaymentType(String(selectedEvent.paymenttype ?? protoFields?.proto_paymenttype ?? ""));
            }

            setComment(selectedEvent.comment ?? "");

            // EndUser（selectedEventの値がない場合、または複製時はproto_workorderの値を使用）
            if (isDuplicate && protoFields?.proto_enduser) {
                const endUserName = protoFields.proto_enduser.name || "";
                if (endUserName) {
                    const endUserOption = endUserOptions.find(opt => opt.label === endUserName || opt.value === endUserName);
                    setEndUser(endUserOption?.value || endUserName);
                } else {
                    setEndUser("");
                }
            } else {
                if (selectedEvent.endUser) {
                    setEndUser(selectedEvent.endUser);
                } else if (protoFields?.proto_enduser) {
                    const endUserName = protoFields.proto_enduser.name || "";
                    if (endUserName) {
                        const endUserOption = endUserOptions.find(opt => opt.label === endUserName || opt.value === endUserName);
                        setEndUser(endUserOption?.value || endUserName);
                    } else {
                        setEndUser("");
                    }
                } else {
                    setEndUser("");
                }
            }

            // DeviceSn（selectedEventの値がない場合、または複製時はproto_workorderの値を使用）
            if (isDuplicate && protoFields?.proto_devicesearch) {
                const deviceSnName = protoFields.proto_devicesearch.name || "";
                if (deviceSnName) {
                    const deviceSnOption = deviceSnOptions.find(opt => opt.label === deviceSnName || opt.value === deviceSnName);
                    setDeviceSn(deviceSnOption?.value || deviceSnName);
                } else {
                    setDeviceSn("");
                }
            } else {
                if (selectedEvent.deviceSn) {
                    setDeviceSn(selectedEvent.deviceSn);
                } else if (protoFields?.proto_devicesearch) {
                    const deviceSnName = protoFields.proto_devicesearch.name || "";
                    if (deviceSnName) {
                        const deviceSnOption = deviceSnOptions.find(opt => opt.label === deviceSnName || opt.value === deviceSnName);
                        setDeviceSn(deviceSnOption?.value || deviceSnName);
                    } else {
                        setDeviceSn("");
                    }
                } else {
                    setDeviceSn("");
                }
            }

            // サブカテゴリ（selectedEventの値がない場合、または複製時はproto_workorderの値を使用）
            if (isDuplicate && protoFields?.proto_subcategory) {
                const subcategoryId = protoFields.proto_subcategory.id || "";
                const subcategoryName = protoFields.proto_subcategory.name || "";
                if (subcategoryId || subcategoryName) {
                    let subcategoryOption = subcategoryId
                        ? subcategoryOptions.find(opt => opt.value === subcategoryId)
                        : null;
                    if (!subcategoryOption && subcategoryName) {
                        subcategoryOption = subcategoryOptions.find(opt => opt.label === subcategoryName);
                    }
                    if (subcategoryOption) {
                        setSubcategory(subcategoryOption.value);
                    } else if (subcategoryId) {
                        setSubcategory(subcategoryId);
                    } else {
                        setSubcategory("");
                    }
                } else {
                    setSubcategory("");
                }
            } else {
                // 編集時：selectedEventの値を優先し、値がない場合はproto_workorderの値を使用
                if (selectedEvent.subcategory) {
                    const foundById = subcategoryOptions.find(opt => opt.value === selectedEvent.subcategory);
                    if (foundById) {
                        setSubcategory(selectedEvent.subcategory);
                    } else if (selectedEvent.subcategoryName) {
                        const foundByName = subcategoryOptions.find(opt => opt.label === selectedEvent.subcategoryName);
                        setSubcategory(foundByName?.value || selectedEvent.subcategory);
                    } else {
                        setSubcategory(selectedEvent.subcategory);
                    }
                } else if (selectedEvent.subcategoryName) {
                    const found = subcategoryOptions.find(opt => opt.label === selectedEvent.subcategoryName);
                    setSubcategory(found?.value || "");
                } else if (protoFields?.proto_subcategory) {
                    // selectedEventに値がない場合、proto_workorderの値を使用
                    const subcategoryId = protoFields.proto_subcategory.id || "";
                    const subcategoryName = protoFields.proto_subcategory.name || "";
                    if (subcategoryId || subcategoryName) {
                        let subcategoryOption = subcategoryId
                            ? subcategoryOptions.find(opt => opt.value === subcategoryId)
                            : null;
                        if (!subcategoryOption && subcategoryName) {
                            subcategoryOption = subcategoryOptions.find(opt => opt.label === subcategoryName);
                        }
                        if (subcategoryOption) {
                            setSubcategory(subcategoryOption.value);
                        } else if (subcategoryId) {
                            setSubcategory(subcategoryId);
                        } else {
                            setSubcategory("");
                        }
                    } else {
                        setSubcategory("");
                    }
                } else {
                    setSubcategory("");
                }
            }

            setTask(selectedEvent.task ?? "");
            setWorkStatus(String(selectedEvent.workStatus ?? ""));
            setTimezone(String(selectedEvent.timezone ?? ""));
            setResource(selectedEvent.resource ?? "");
            setWisdomBu(selectedEvent.wisdomBu ?? "");
            setSapBu(selectedEvent.sapBu ?? "");
            setPaymentMainCategory(selectedEvent.paymentMainCategory ?? "");
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
            setTimezone("235");

            // 現在開いている proto_workorder から値を取得して反映
            const protoFields = getWorkOrderProtoFields();
            if (protoFields) {
                // proto_enduser -> EndUser (nameからIDを検索)
                const endUserName = protoFields.proto_enduser?.name || "";
                console.log("proto_workorderから取得したEndUser:", endUserName);
                if (endUserName) {
                    const endUserOption = endUserOptions.find(opt => opt.label === endUserName || opt.value === endUserName);
                    setEndUser(endUserOption?.value || endUserName);
                } else {
                    setEndUser("");
                }

                // proto_devicesearch -> 装置S/N (nameからIDを検索)
                const deviceSnName = protoFields.proto_devicesearch?.name || "";
                console.log("proto_workorderから取得した装置SN:", deviceSnName);
                if (deviceSnName) {
                    const deviceSnOption = deviceSnOptions.find(opt => opt.label === deviceSnName || opt.value === deviceSnName);
                    setDeviceSn(deviceSnOption?.value || deviceSnName);
                } else {
                    setDeviceSn("");
                }

                // proto_paymenttype -> PaymentType
                setPaymentType(protoFields.proto_paymenttype !== undefined && protoFields.proto_paymenttype !== null ? String(protoFields.proto_paymenttype) : "");

                // proto_maincategory -> メインカテゴリ
                setMainCategory(protoFields.proto_maincategory !== undefined && protoFields.proto_maincategory !== null ? String(protoFields.proto_maincategory) : "");

                // proto_subcategory -> サブカテゴリ (IDまたはnameから検索)
                const subcategoryId = protoFields.proto_subcategory?.id || "";
                const subcategoryName = protoFields.proto_subcategory?.name || "";
                console.log("proto_workorderから取得したサブカテゴリ ID:", subcategoryId, "Name:", subcategoryName);

                if (subcategoryId || subcategoryName) {
                    // まずIDで検索、見つからない場合はnameで検索
                    let subcategoryOption = subcategoryId
                        ? subcategoryOptions.find(opt => opt.value === subcategoryId)
                        : null;

                    if (!subcategoryOption && subcategoryName) {
                        subcategoryOption = subcategoryOptions.find(opt => opt.label === subcategoryName);
                    }

                    if (subcategoryOption) {
                        setSubcategory(subcategoryOption.value);
                    } else if (subcategoryId) {
                        // IDが見つからない場合でも、IDをそのまま使用
                        setSubcategory(subcategoryId);
                    } else {
                        setSubcategory("");
                    }
                } else {
                    setSubcategory("");
                }
            } else {
                // 取得できない場合は空で初期化
                setEndUser("");
                setDeviceSn("");
                setPaymentType("");
                setMainCategory("");
                setSubcategory("");
            }

            // 間接タスクが選択されている場合の処理
            if (selectedIndirectTask) {
                // タイムカテゴリを「間接工数」にセット（値は931440002を想定、実際の値に合わせて調整）
                const indirectTimeCategory = timecategoryOptions.find(opt =>
                    opt.label.includes("間接") || opt.value === "931440002"
                );
                setTimeCategory(indirectTimeCategory?.value || "");
                // 間接タスク選択時はサブカテゴリ・タスクを間接タスクで上書き
                // subcategoryName（ラベル）からIDを検索
                const indirectSubcategoryOption = subcategoryOptions.find(opt =>
                    opt.label === selectedIndirectTask.subcategoryName || opt.value === selectedIndirectTask.subcategoryName
                );
                setSubcategory(indirectSubcategoryOption?.value || selectedIndirectTask.subcategoryName);
                setTask(selectedIndirectTask.taskName);
            } else {
                // selectedIndirectTaskがない場合、protoFieldsから取得した値は保持する
                // （サブカテゴリは既に上で設定されているため、ここでは空にしない）
                setTimeCategory("");
                setTask("");
            }

            setWorkStatus("");
            setComment("");
            setResource("");
            setWisdomBu("");
            setSapBu("");
            setPaymentMainCategory("");
        }
    }, [isOpen, selectedEvent, selectedDateTime, isSubgrid, selectedWO, selectedIndirectTask, timecategoryOptions, subcategoryOptions, endUserOptions, deviceSnOptions]);

    /* -------------------------------
       💾 保存処理
    ------------------------------- */
    const handleSave = () => {
        const start = new Date(`${startDate}T${startHour}:${startMinute}`);
        const end = new Date(`${endDate}T${endHour}:${endMinute}`);

        // nameの場合はoptionsからIDを取得
        const getEndUserId = () => {
            if (!endUser) return "";
            const found = endUserOptions.find(opt => opt.value === endUser || opt.label === endUser);
            return found?.value || endUser;
        };

        const getDeviceSnId = () => {
            if (!deviceSn) return "";
            const found = deviceSnOptions.find(opt => opt.value === deviceSn || opt.label === deviceSn);
            return found?.value || deviceSn;
        };

        const getSubcategoryId = () => {
            if (!subcategory) return "";
            const found = subcategoryOptions.find(opt => opt.value === subcategory || opt.label === subcategory);
            return found?.value || subcategory;
        };

        onSubmit({
            id: selectedEvent?.id || "",
            wo,
            start,
            end,
            endUser: getEndUserId(),
            timezone,
            resource,
            wisdomBu,
            sapBu,
            timeCategory,
            mainCategory,
            paymentType,
            deviceSn: getDeviceSnId(),
            paymentMainCategory,
            subcategory: getSubcategoryId(),
            task,
            workStatus,
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
            wisdomBu,
            sapBu,
            timeCategory,
            mainCategory,
            paymentType,
            deviceSn,
            paymentMainCategory,
            task,
            workStatus,
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
                                value={wo || ""}
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
                            {endUser ? (
                                <div className="readonly-text">
                                    {endUserOptions.find(opt => opt.value === endUser || opt.label === endUser)?.label || endUser}
                                </div>
                            ) : (
                                <Select
                                    options={endUserOptions}
                                    value={endUser || ""}
                                    onChange={setEndUser}
                                    placeholder={t("timeEntryModal.placeholders.selectEndUser")}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.location")}</label>
                            <Select
                                options={timezoneOptions}
                                value={timezone || ""}
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

                            <label className="modal-label">WISDOM BU</label>
                            <Select
                                options={[]}
                                value={wisdomBu || ""}
                                onChange={setWisdomBu}
                                placeholder="WISDOM BU を選択"
                            />

                            <label className="modal-label">SAP BU</label>
                            <Select
                                options={[]}
                                value={sapBu || ""}
                                onChange={setSapBu}
                                placeholder="SAP BU を選択"
                            />
                        </div>

                        <div>
                            <label className="modal-label">{t("timeEntryModal.timeCategory")}</label>
                            {selectedIndirectTask ? (
                                <div className="readonly-text">
                                    {timecategoryOptions.find(opt => opt.value === timeCategory)?.label || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={timecategoryOptions}
                                    value={timeCategory || ""}
                                    onChange={setTimeCategory}
                                    placeholder={t("timeEntryModal.placeholders.selectTimeCategory")}
                                />
                            )}

                            <label className="modal-label">装置S/N</label>
                            {deviceSn ? (
                                <div className="readonly-text">
                                    {deviceSnOptions.find(opt => opt.value === deviceSn || opt.label === deviceSn)?.label || deviceSn}
                                </div>
                            ) : (
                                <Select
                                    options={deviceSnOptions}
                                    value={deviceSn || ""}
                                    onChange={setDeviceSn}
                                    placeholder="装置S/N を選択"
                                />
                            )}

                            {/* <label className="modal-label">{t("timeEntryModal.mainCategory")}</label>
                            {mainCategory ? (
                                <div className="readonly-text">
                                    {mainCategory}
                                </div>
                            ) : (
                                <Select
                                    options={maincategoryOptions}
                                    value={mainCategory || ""}
                                    onChange={setMainCategory}
                                    placeholder={t("timeEntryModal.placeholders.selectMainCategory")}
                                />
                            )} */}

                            <label className="modal-label">{t("timeEntryModal.mainCategory")}</label>
                            <Select
                                // options={paymentMainCategoryOptions}
                                options={[]}
                                value={paymentMainCategory || ""}
                                onChange={setPaymentMainCategory}
                                placeholder="カテゴリを選択"
                            />

                            <label className="modal-label">{t("timeEntryModal.paymentType")}</label>
                            {paymentType ? (
                                <div className="readonly-text">
                                    {paymenttypeOptions.find(opt => opt.value === paymentType)?.label || paymentType}
                                </div>
                            ) : (
                                <Select
                                    options={paymenttypeOptions}
                                    value={paymentType || ""}
                                    onChange={setPaymentType}
                                    placeholder={t("timeEntryModal.placeholders.selectPaymentType")}
                                />
                            )}

                            <label className="modal-label">メインカテゴリ</label>
                            {mainCategory ? (
                                <div className="readonly-text">
                                    {maincategoryOptions.find(opt => opt.value === mainCategory)?.label || mainCategory}
                                </div>
                            ) : (
                                <Select
                                    options={maincategoryOptions}
                                    value={mainCategory || ""}
                                    onChange={setMainCategory}
                                    placeholder={"メインカテゴリを選択"}
                                />
                            )}

                            {/* <label className="modal-label">メインカテゴリ</label>
                            <Select
                                options={paymentMainCategoryOptions}
                                value={paymentMainCategory || ""}
                                onChange={setPaymentMainCategory}
                                placeholder="メインカテゴリを選択"
                            /> */}

                            <label className="modal-label">{t("timeEntryModal.subCategory")}</label>
                            {subcategory ? (
                                <div className="readonly-text">
                                    {subcategoryOptions.find(opt => opt.value === subcategory || opt.label === subcategory)?.label || subcategory}
                                </div>
                            ) : (
                                <Select
                                    options={subcategoryOptions}
                                    value={subcategory ?? ""}
                                    onChange={setSubcategory}
                                    placeholder={t("favoriteTask.selectSubCategory") || "サブカテゴリを選択"}
                                />
                            )}

                            <label className="modal-label">作業ステータス</label>
                            <Select
                                options={workStatusOptions}
                                value={workStatus || ""}
                                onChange={setWorkStatus}
                                placeholder="作業ステータスを選択"
                            />

                            <label className="modal-label">{t("timeEntryModal.task")}</label>
                            {selectedIndirectTask ? (
                                <div className="readonly-text">
                                    {task || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={taskOptions}
                                    value={task || ""}
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

            {/*  削除確認モーダル */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            {/*  リソース選択モーダル */}
            <ResourceSelectModal
                isOpen={isResourceModalOpen}
                onClose={closeResourceModal}
                onSave={handleResourceSave}
            />
        </>
    );
};
