import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { getWorkOrderProtoFields, getXrm, logWorkOrderFormFields } from "../../utils/xrmUtils";
import {
    BILLABLE_TYPE_OPTIONS,
    CONCESSION_TYPE_OPTIONS,
    PAYMENT_TO_OPTIONS,
    PAYMENT_TYPE_TREE,
    PAYMENT_TYPE_OPTIONS,
    detectPatternFromWoType,
    getChildKeys,
    getNodeByValue,
} from "../../constants/timeEntryChoices";

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
    woTypeOptions: Option[];
    woSoOptions: Option[];
    isSubgrid?: boolean;
    selectedWO?: string;
    selectedIndirectTask?: { subcategoryName: string; taskName: string } | null;
    selectedResourcesText?: string;
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
    // paymenttypeOptions,
    timecategoryOptions,
    timezoneOptions,
    endUserOptions,
    deviceSnOptions,
    subcategoryOptions,
    woTypeOptions,
    woSoOptions,
    isSubgrid = false,
    selectedWO = "",
    selectedIndirectTask = null,
    selectedResourcesText = "",
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
    const [billableType, setBillableType] = useState("");
    const [paymentToBe, setPaymentToBe] = useState("");
    const [paymentTo, setPaymentTo] = useState("");
    const [concessionType, setConcessionType] = useState("");
    const [task, setTask] = useState("");
    const [subcategory, setSubcategory] = useState("");
    const [workStatus, setWorkStatus] = useState("");
    const [resource, setResource] = useState("");
    const [wisdomBu, setWisdomBu] = useState("");
    const [sapBu, setSapBu] = useState("");
    const [woSo, setWoSo] = useState("");
    const [deviceSn, setDeviceSn] = useState("");
    const [woType, setWoType] = useState("");
    const [regionLabel, setRegionLabel] = useState("");

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

    const woTypeLabel = useMemo(
        () =>
            (selectedEvent as any)?.woTypeName ||
            woTypeOptions.find((opt) => opt.value === woType || opt.label === woType)?.label ||
            "",
        [selectedEvent, woType, woTypeOptions]
    );

    const paymentTree = useMemo(() => {
        const pattern = detectPatternFromWoType(woTypeLabel);
        return pattern ? PAYMENT_TYPE_TREE[pattern] ?? null : null;
    }, [woTypeLabel]);

    const billableTypeOptions = useMemo(
        () => BILLABLE_TYPE_OPTIONS.filter((opt) => getChildKeys(paymentTree).includes(opt.value)),
        [paymentTree]
    );

    const paymentToBeNode = useMemo(
        () => getNodeByValue(paymentTree, billableType),
        [paymentTree, billableType]
    );

    const paymentToBeOptions = useMemo(
        () => PAYMENT_TYPE_OPTIONS.filter((opt) => getChildKeys(paymentToBeNode).includes(opt.value)),
        [paymentToBeNode]
    );

    const paymentToNode = useMemo(
        () => getNodeByValue(paymentToBeNode, paymentToBe),
        [paymentToBeNode, paymentToBe]
    );

    const paymentToOptions = useMemo(
        () => PAYMENT_TO_OPTIONS.filter((opt) => getChildKeys(paymentToNode).includes(opt.value)),
        [paymentToNode]
    );

    const concessionNode = useMemo(
        () => getNodeByValue(paymentToNode, paymentTo),
        [paymentToNode, paymentTo]
    );

    const concessionTypeOptions = useMemo(
        () => CONCESSION_TYPE_OPTIONS.filter((opt) => getChildKeys(concessionNode).includes(opt.value)),
        [concessionNode]
    );

    const isBillableTypeDisabled = billableTypeOptions.length === 0;
    const isPaymentToBeDisabled = !billableType || paymentToBeOptions.length === 0;
    const isPaymentToDisabled = !paymentToBe || paymentToOptions.length === 0;
    const isConcessionTypeDisabled = !paymentTo || concessionTypeOptions.length === 0;

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
        { value: "1", label: t("timeEntryModal.workStatusOptions.inProgress") },
        { value: "2", label: t("timeEntryModal.workStatusOptions.completed") },
        { value: "3", label: t("timeEntryModal.workStatusOptions.onHold") },
        { value: "4", label: t("timeEntryModal.workStatusOptions.cancelled") },
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

    const directTimeCategoryValue = useMemo(
        () =>
            timecategoryOptions.find((opt) =>
                opt.label.includes("直接") || opt.label.toLowerCase().includes("direct")
            )?.value || "",
        [timecategoryOptions]
    );
    const resourceLines = useMemo(
        () => (resource || "").split("\n").map((line) => line.trim()).filter(Boolean),
        [resource]
    );
    const isSelfResourceLine = (line: string) => {
        const lower = line.toLowerCase();
        return line.includes(t("resource.selfTag")) || lower.includes("(self)") || line.includes("(自分)");
    };
    const shouldShowWoSo = useMemo(
        () => ["EU", "CN", "KR"].includes(regionLabel.toUpperCase()),
        [regionLabel]
    );
    const initialWoValueRef = useRef<string | null>(null);

    const applyFallbackFields = useCallback(() => {
        const protoFields = getWorkOrderProtoFields();
        if (protoFields) {
            setRegionLabel(protoFields.proto_region?.name || "");
            const endUserName = (protoFields as any).proto_enduser?.name || protoFields.proto_wo_fab?.name || "";
            if (endUserName) {
                const endUserOption = endUserOptions.find((opt) => opt.label === endUserName || opt.value === endUserName);
                setEndUser(endUserOption?.value || endUserName);
            } else {
                setEndUser("");
            }

            const deviceSnName = protoFields.proto_devicesearch?.name || "";
            if (deviceSnName) {
                const deviceSnOption = deviceSnOptions.find((opt) => opt.label === deviceSnName || opt.value === deviceSnName);
                setDeviceSn(deviceSnOption?.value || deviceSnName);
            } else {
                setDeviceSn("");
            }

            const woTypeName = protoFields.proto_wotype?.name || "";
            const woTypeId = protoFields.proto_wotype?.id || "";
            if (woTypeId || woTypeName) {
                const woTypeOption = woTypeOptions.find(
                    (opt) => opt.value === woTypeId || opt.label === woTypeName || opt.value === woTypeName
                );
                setWoType(woTypeOption?.value || woTypeId || woTypeName);
            } else {
                setWoType("");
            }

            setBillableType(protoFields.proto_billabletype != null ? String(protoFields.proto_billabletype) : "");
            setPaymentToBe(protoFields.proto_payment_tobe != null ? String(protoFields.proto_payment_tobe) : "");
            setPaymentTo(protoFields.proto_paymentto_tobe != null ? String(protoFields.proto_paymentto_tobe) : "");
            setConcessionType(protoFields.proto_concession_tobe != null ? String(protoFields.proto_concession_tobe) : "");
            setMainCategory(protoFields.proto_maincategory != null ? String(protoFields.proto_maincategory) : "");
            setSubcategory(protoFields.proto_subcategory?.id || "");
            const woSoId = protoFields.proto_wo_soassociation?.id || "";
            const woSoName = protoFields.proto_wo_soassociation?.name || "";
            if (woSoId || woSoName) {
                const woSoOption = woSoOptions.find((opt) => opt.value === woSoId || opt.label === woSoName);
                setWoSo(woSoOption?.value || woSoId || "");
            } else {
                setWoSo("");
            }
        } else {
            setRegionLabel("");
            setEndUser("");
            setDeviceSn("");
            setBillableType("");
            setPaymentToBe("");
            setPaymentTo("");
            setConcessionType("");
            setWoSo("");
            setMainCategory("");
            setSubcategory("");
            setWoType("");
        }
    }, [endUserOptions, deviceSnOptions, woTypeOptions, woSoOptions]);

    /* -------------------------------
       🪄 初期化処理
    ------------------------------- */
    useEffect(() => {
        if (!isOpen) return;

        // proto_workorder フォームのフィールド値を取得してログ出力
        logWorkOrderFormFields();

        let isCancelled = false;

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
            setBillableType(String((selectedEvent as any).billabletype ?? ""));
            setPaymentToBe(String((selectedEvent as any).paymenttobe ?? ""));
            setPaymentTo(String((selectedEvent as any).paymentto ?? ""));
            setConcessionType(String((selectedEvent as any).concessiontype ?? ""));
            setComment(selectedEvent.comment ?? "");
            // EndUser（IDまたはnameから検索）
            if (selectedEvent.endUser) {
                const foundById = endUserOptions.find(opt => opt.value === selectedEvent.endUser);
                if (foundById) {
                    setEndUser(selectedEvent.endUser);
                } else if ((selectedEvent as any).endUserName) {
                    const foundByName = endUserOptions.find(opt => opt.label === (selectedEvent as any).endUserName);
                    setEndUser(foundByName?.value || selectedEvent.endUser);
                } else {
                    setEndUser(selectedEvent.endUser);
                }
            } else if ((selectedEvent as any).endUserName) {
                const found = endUserOptions.find(opt => opt.label === (selectedEvent as any).endUserName);
                setEndUser(found?.value || "");
            } else {
                setEndUser("");
            }

            // DeviceSn（IDまたはnameから検索）
            if (selectedEvent.deviceSn) {
                const foundById = deviceSnOptions.find(opt => opt.value === selectedEvent.deviceSn);
                if (foundById) {
                    setDeviceSn(selectedEvent.deviceSn);
                } else if ((selectedEvent as any).deviceSnName) {
                    const foundByName = deviceSnOptions.find(opt => opt.label === (selectedEvent as any).deviceSnName);
                    setDeviceSn(foundByName?.value || selectedEvent.deviceSn);
                } else {
                    setDeviceSn(selectedEvent.deviceSn);
                }
            } else if ((selectedEvent as any).deviceSnName) {
                const found = deviceSnOptions.find(opt => opt.label === (selectedEvent as any).deviceSnName);
                setDeviceSn(found?.value || "");
            } else {
                setDeviceSn("");
            }

            // サブカテゴリはIDとして取得（subcategoryNameがある場合はIDを探す）
            if (selectedEvent.subcategory) {
                // IDがsubcategoryOptionsに存在するか確認
                const foundById = subcategoryOptions.find(opt => opt.value === selectedEvent.subcategory);
                if (foundById) {
                    setSubcategory(selectedEvent.subcategory);
                } else if (selectedEvent.subcategoryName) {
                    // IDが見つからない場合、subcategoryNameからIDを探す
                    const foundByName = subcategoryOptions.find(opt => opt.label === selectedEvent.subcategoryName);
                    setSubcategory(foundByName?.value || selectedEvent.subcategory);
                } else {
                    setSubcategory(selectedEvent.subcategory);
                }
            } else if (selectedEvent.subcategoryName) {
                // subcategoryNameからIDを探す
                const found = subcategoryOptions.find(opt => opt.label === selectedEvent.subcategoryName);
                setSubcategory(found?.value || "");
            } else {
                setSubcategory("");
            }
            setTask(selectedEvent.task ?? "");
            setWorkStatus(String(selectedEvent.workStatus ?? ""));
            setTimezone(String(selectedEvent.timezone ?? ""));
            setResource(selectedEvent.resource ?? "");
            setWisdomBu(selectedEvent.wisdomBu ?? "");
            setSapBu(selectedEvent.sapBu ?? "");
            setWoSo((selectedEvent as any).woSo ?? "");
            setWoType((selectedEvent as any).woType ?? "");
            setRegionLabel("");
        } else if (selectedDateTime) {
            setMode("create");
            const { start, end } = selectedDateTime;

            setStartDate(formatLocalDate(start));
            setStartHour(String(start.getHours()).padStart(2, "0"));
            setStartMinute(String(start.getMinutes()).padStart(2, "0"));
            setEndDate(formatLocalDate(end));
            setEndHour(String(end.getHours()).padStart(2, "0"));
            setEndMinute(String(end.getMinutes()).padStart(2, "0"));

            // 選択中WOを初期セット
            const initialWoValue = selectedWO && selectedWO !== "all" ? selectedWO : "";
            initialWoValueRef.current = initialWoValue;
            setWo(initialWoValue);
            setTimezone("235");
            setTimeCategory(directTimeCategoryValue);

            const loadSelectedWorkOrder = async () => {
                if (!selectedWO || selectedWO === "all") {
                    applyFallbackFields();
                    return;
                }

                const xrm = getXrm();
                if (!xrm?.WebApi) {
                    applyFallbackFields();
                    return;
                }

                try {
                    const record = await xrm.WebApi.retrieveRecord(
                        "proto_workorder",
                        selectedWO,
                        "?$select=proto_wonumber,proto_startdatetime,proto_enddatetime,proto_billabletype,proto_payment_tobe,proto_paymentto_tobe,proto_concession_tobe,proto_maincategory,_proto_enduser_value,_proto_devicesearch_value,_proto_wotype_value,_proto_subcategory_value,_proto_region_value,_proto_wo_soassociation_value"
                    );

                    if (isCancelled) return;

                    setWo(selectedWO);
                    setRegionLabel(record["_proto_region_value@OData.Community.Display.V1.FormattedValue"] || "");

                    setEndUser(record._proto_enduser_value?.replace(/[{}]/g, "") || "");
                    setDeviceSn(record._proto_devicesearch_value?.replace(/[{}]/g, "") || "");
                    setWoType(record._proto_wotype_value?.replace(/[{}]/g, "") || "");
                    setBillableType(record.proto_billabletype != null ? String(record.proto_billabletype) : "");
                    setPaymentToBe(record.proto_payment_tobe != null ? String(record.proto_payment_tobe) : "");
                    setPaymentTo(record.proto_paymentto_tobe != null ? String(record.proto_paymentto_tobe) : "");
                    setConcessionType(record.proto_concession_tobe != null ? String(record.proto_concession_tobe) : "");
                    setMainCategory(record.proto_maincategory != null ? String(record.proto_maincategory) : "");
                    setSubcategory(record._proto_subcategory_value?.replace(/[{}]/g, "") || "");
                    setWoSo(record._proto_wo_soassociation_value?.replace(/[{}]/g, "") || "");
                } catch (error) {
                    console.error("selectedWO から proto_workorder の取得に失敗:", error);
                    if (!isCancelled) {
                        applyFallbackFields();
                    }
                }
            };

            loadSelectedWorkOrder();

            // 間接タスクが選択されている場合の処理
            if (selectedIndirectTask) {
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
                setTimeCategory(directTimeCategoryValue);
                setTask("");
            }

            setWorkStatus("");
            setComment("");
            setResource("");
            setWisdomBu("");
            setSapBu("");
        }
        return () => {
            isCancelled = true;
        };
    }, [isOpen, selectedEvent, selectedDateTime, isSubgrid, selectedWO, selectedIndirectTask, timecategoryOptions, subcategoryOptions, endUserOptions, deviceSnOptions, woTypeOptions, woSoOptions, directTimeCategoryValue]);

    useEffect(() => {
        if (!isOpen) return;
        if (selectedEvent) return;
        if (mode !== "create") return;
        if (initialWoValueRef.current === wo) {
            initialWoValueRef.current = null;
            return;
        }

        let isCancelled = false;
        const loadWorkOrderFromSelection = async () => {
            if (!wo) {
                applyFallbackFields();
                return;
            }

            const xrm = getXrm();
            if (!xrm?.WebApi) {
                applyFallbackFields();
                return;
            }

            try {
                const record = await xrm.WebApi.retrieveRecord(
                    "proto_workorder",
                    wo,
                    "?$select=proto_billabletype,proto_payment_tobe,proto_paymentto_tobe,proto_concession_tobe,proto_maincategory,_proto_enduser_value,_proto_devicesearch_value,_proto_wotype_value,_proto_subcategory_value,_proto_region_value,_proto_wo_soassociation_value"
                );

                if (isCancelled) return;

                setRegionLabel(record["_proto_region_value@OData.Community.Display.V1.FormattedValue"] || "");
                setEndUser(record._proto_enduser_value?.replace(/[{}]/g, "") || "");
                setDeviceSn(record._proto_devicesearch_value?.replace(/[{}]/g, "") || "");
                setWoType(record._proto_wotype_value?.replace(/[{}]/g, "") || "");
                setBillableType(record.proto_billabletype != null ? String(record.proto_billabletype) : "");
                setPaymentToBe(record.proto_payment_tobe != null ? String(record.proto_payment_tobe) : "");
                setPaymentTo(record.proto_paymentto_tobe != null ? String(record.proto_paymentto_tobe) : "");
                setConcessionType(record.proto_concession_tobe != null ? String(record.proto_concession_tobe) : "");
                setMainCategory(record.proto_maincategory != null ? String(record.proto_maincategory) : "");
                setSubcategory(record._proto_subcategory_value?.replace(/[{}]/g, "") || "");
                setWoSo(record._proto_wo_soassociation_value?.replace(/[{}]/g, "") || "");
            } catch (error) {
                console.error("WO選択時の proto_workorder 取得に失敗:", error);
                if (!isCancelled) applyFallbackFields();
            }
        };

        loadWorkOrderFromSelection();
        return () => {
            isCancelled = true;
        };
    }, [isOpen, selectedEvent, mode, wo, applyFallbackFields]);

    useEffect(() => {
        if (!isOpen) return;
        if (selectedEvent) return;
        setResource(selectedResourcesText);
    }, [isOpen, selectedEvent, selectedResourcesText]);

    useEffect(() => {
        if (billableType && !billableTypeOptions.some((opt) => opt.value === billableType)) {
            setBillableType("");
            setPaymentToBe("");
            setPaymentTo("");
            setConcessionType("");
        }
    }, [billableType, billableTypeOptions]);

    useEffect(() => {
        if (paymentToBe && !paymentToBeOptions.some((opt) => opt.value === paymentToBe)) {
            setPaymentToBe("");
            setPaymentTo("");
            setConcessionType("");
        }
    }, [paymentToBe, paymentToBeOptions]);

    useEffect(() => {
        if (paymentTo && !paymentToOptions.some((opt) => opt.value === paymentTo)) {
            setPaymentTo("");
            setConcessionType("");
        }
    }, [paymentTo, paymentToOptions]);

    useEffect(() => {
        if (concessionType && !concessionTypeOptions.some((opt) => opt.value === concessionType)) {
            setConcessionType("");
        }
    }, [concessionType, concessionTypeOptions]);

    useEffect(() => {
        if (!shouldShowWoSo && woSo) {
            setWoSo("");
        }
    }, [shouldShowWoSo, woSo]);

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

        const getWoTypeId = () => {
            if (!woType) return "";
            const found = woTypeOptions.find(opt => opt.value === woType || opt.label === woType);
            return found?.value || woType;
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
            woSo,
            woSoName: woSoOptions.find((opt) => opt.value === woSo || opt.label === woSo)?.label || null,
            timeCategory,
            mainCategory,
            paymentType,
            billableType,
            paymentToBe,
            paymentTo,
            concessionType,
            deviceSn: getDeviceSnId(),
            woType: getWoTypeId(),
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
            woSo,
            timeCategory,
            mainCategory,
            paymentType,
            billableType,
            paymentToBe,
            paymentTo,
            concessionType,
            deviceSn,
            deviceSnName: deviceSnOptions.find(opt => opt.value === deviceSn || opt.label === deviceSn)?.label || null,
            subcategory,
            subcategoryName: subcategoryOptions.find(opt => opt.value === subcategory || opt.label === subcategory)?.label || null,
            woType,
            woTypeName: woTypeOptions.find(opt => opt.value === woType || opt.label === woType)?.label || null,
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
                            {mode === "duplicate" ? (
                                <div className="readonly-text">
                                    {filteredWoOptions.find(opt => opt.value === wo)?.label || wo || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={filteredWoOptions}
                                    value={wo || ""}
                                    onChange={setWo}
                                    placeholder={t("timeEntryModal.placeholders.selectWO")}
                                />
                            )}
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

                            <label className="modal-label">{t("timeEntryModal.endUser")}</label>
                            {mode === "duplicate" || endUser ? (
                                <div className="readonly-text">
                                    {(selectedEvent as any)?.endUserName || endUserOptions.find(opt => opt.value === endUser || opt.label === endUser)?.label || endUser || "-"}
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
                            {mode === "duplicate" ? (
                                <div className="readonly-text">
                                    {timezoneOptions.find(opt => opt.value === timezone)?.label || timezone || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={timezoneOptions}
                                    value={timezone || ""}
                                    onChange={setTimezone}
                                    placeholder={t("timeEntryModal.placeholders.selectLocation")}
                                />
                            )}

                            <div className="resource-header">
                                <label className="modal-label">{t("timeEntryModal.resource")}</label>
                                <a href="#" className="resource-link" onClick={openResourceModal}>
                                    {t("timeEntryModal.selectResource")}
                                </a>
                            </div>

                            <div className="resource-display">
                                {resourceLines.length > 0 ? (
                                    resourceLines.map((line, idx) => (
                                        <div
                                            key={`${line}-${idx}`}
                                            className={`resource-line ${isSelfResourceLine(line) ? "self" : "other"}`}
                                        >
                                            {line}
                                        </div>
                                    ))
                                ) : (
                                    <div className="resource-empty">{t("timeEntryModal.resourcePlaceholder")}</div>
                                )}
                            </div>

                            <label className="modal-label">{t("timeEntryModal.wisdomBu")}</label>
                            {mode === "duplicate" ? (
                                <div className="readonly-text">{wisdomBu || "-"}</div>
                            ) : (
                                <Select
                                    options={[]}
                                    value={wisdomBu || ""}
                                    onChange={setWisdomBu}
                                    placeholder={t("timeEntryModal.placeholders.selectWisdomBu")}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.sapBu")}</label>
                            {mode === "duplicate" ? (
                                <div className="readonly-text">{sapBu || "-"}</div>
                            ) : (
                                <Select
                                    options={[]}
                                    value={sapBu || ""}
                                    onChange={setSapBu}
                                    placeholder={t("timeEntryModal.placeholders.selectSapBu")}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.deviceSn")}</label>
                            {mode === "duplicate" || deviceSn ? (
                                <div className="readonly-text">
                                    {(selectedEvent as any)?.deviceSnName || deviceSnOptions.find(opt => opt.value === deviceSn || opt.label === deviceSn)?.label || deviceSn || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={deviceSnOptions}
                                    value={deviceSn || ""}
                                    onChange={setDeviceSn}
                                    placeholder={t("timeEntryModal.placeholders.selectDeviceSn")}
                                />
                            )}

                            {shouldShowWoSo && (
                                <>
                                    <label className="modal-label">{t("timeEntryModal.soBaan")}</label>
                                    {mode === "duplicate" ? (
                                        <div className="readonly-text">
                                            {(selectedEvent as any)?.woSoName || woSoOptions.find((opt) => opt.value === woSo || opt.label === woSo)?.label || woSo || "-"}
                                        </div>
                                    ) : (
                                        <Select
                                            options={woSoOptions}
                                            value={woSo || ""}
                                            onChange={setWoSo}
                                            placeholder={t("timeEntryModal.placeholders.selectSoBaan")}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        <div>
                            <label className="modal-label">{t("timeEntryModal.timeCategory")}</label>
                            {mode === "duplicate" || selectedIndirectTask ? (
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

                            <label className="modal-label">{t("timeEntryModal.workStatus")}</label>
                            {mode === "duplicate" ? (
                                <div className="readonly-text">
                                    {workStatusOptions.find(opt => opt.value === workStatus)?.label || workStatus || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={workStatusOptions}
                                    value={workStatus || ""}
                                    onChange={setWorkStatus}
                                    placeholder={t("timeEntryModal.placeholders.selectWorkStatus")}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.task")}</label>
                            {mode === "duplicate" || selectedIndirectTask ? (
                                <div className="readonly-text">
                                    {taskOptions.find(opt => opt.value === task)?.label || task || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={taskOptions}
                                    value={task || ""}
                                    onChange={setTask}
                                    placeholder={t("timeEntryModal.placeholders.selectTask")}
                                />
                            )}

                            {/* <label className="modal-label">{t("timeEntryModal.comment")}</label> */}
                            {mode === "duplicate" ? (
                                <div className="readonly-text">{comment || "-"}</div>
                            ) : (
                                <Textarea
                                    label={t("timeEntryModal.comment")}
                                    value={comment}
                                    onChange={setComment}
                                    placeholder={t("timeEntryModal.placeholders.enterComment")}
                                    rows={4}
                                    showCount
                                    maxLength={2000}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.woType")}</label>
                            {mode === "duplicate" || woType ? (
                                <div className="readonly-text">
                                    {(selectedEvent as any)?.woTypeName || woTypeOptions.find(opt => opt.value === woType || opt.label === woType)?.label || woType || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={woTypeOptions}
                                    value={woType || ""}
                                    onChange={setWoType}
                                    placeholder={t("timeEntryModal.placeholders.selectWoType")}
                                />
                            )}

                            {/*
                            <label className="modal-label">{t("timeEntryModal.paymentType")}</label>
                            {mode === "duplicate" || paymentType ? (
                                <div className="readonly-text">
                                    {paymenttypeOptions.find(opt => opt.value === paymentType)?.label || paymentType || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={paymenttypeOptions}
                                    value={paymentType || ""}
                                    onChange={setPaymentType}
                                    placeholder={t("timeEntryModal.placeholders.selectPaymentType")}
                                />
                            )}
                            */}

                            <label className="modal-label">{t("timeEntryModal.billableType")}</label>
                            {mode === "duplicate" ? (
                                <div className="readonly-text">
                                    {BILLABLE_TYPE_OPTIONS.find((opt) => opt.value === billableType)?.label || billableType || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={billableTypeOptions}
                                    value={billableType || ""}
                                    onChange={setBillableType}
                                    placeholder={t("timeEntryModal.placeholders.selectBillableType")}
                                    disabled={isBillableTypeDisabled}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.paymentToBe")}</label>
                            {mode === "duplicate" ? (
                                <div className="readonly-text">
                                    {PAYMENT_TYPE_OPTIONS.find((opt) => opt.value === paymentToBe)?.label || paymentToBe || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={paymentToBeOptions}
                                    value={paymentToBe || ""}
                                    onChange={setPaymentToBe}
                                    placeholder={t("timeEntryModal.placeholders.selectPaymentToBe")}
                                    disabled={isPaymentToBeDisabled}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.paymentTo")}</label>
                            {mode === "duplicate" ? (
                                <div className="readonly-text">
                                    {PAYMENT_TO_OPTIONS.find((opt) => opt.value === paymentTo)?.label || paymentTo || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={paymentToOptions}
                                    value={paymentTo || ""}
                                    onChange={setPaymentTo}
                                    placeholder={t("timeEntryModal.placeholders.selectPaymentTo")}
                                    disabled={isPaymentToDisabled}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.concessionType")}</label>
                            {mode === "duplicate" ? (
                                <div className="readonly-text">
                                    {CONCESSION_TYPE_OPTIONS.find((opt) => opt.value === concessionType)?.label || concessionType || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={concessionTypeOptions}
                                    value={concessionType || ""}
                                    onChange={setConcessionType}
                                    placeholder={t("timeEntryModal.placeholders.selectConcessionType")}
                                    disabled={isConcessionTypeDisabled}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.mainCategoryLabel")}</label>
                            {mode === "duplicate" || mainCategory ? (
                                <div className="readonly-text">
                                    {maincategoryOptions.find(opt => opt.value === mainCategory)?.label || mainCategory || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={maincategoryOptions}
                                    value={mainCategory || ""}
                                    onChange={setMainCategory}
                                    placeholder={t("timeEntryModal.placeholders.selectMainCategory")}
                                />
                            )}

                            <label className="modal-label">{t("timeEntryModal.subCategory")}</label>
                            {mode === "duplicate" || subcategory ? (
                                <div className="readonly-text">
                                    {(selectedEvent as any)?.subcategoryName || subcategoryOptions.find(opt => opt.value === subcategory || opt.label === subcategory)?.label || subcategory || "-"}
                                </div>
                            ) : (
                                <Select
                                    options={subcategoryOptions}
                                    value={subcategory ?? ""}
                                    onChange={setSubcategory}
                                    placeholder={t("favoriteTask.selectSubCategory") || "サブカテゴリを選択"}
                                />
                            )}
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
