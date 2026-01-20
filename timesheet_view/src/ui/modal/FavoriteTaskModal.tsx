import React, { useState, useEffect, useCallback } from "react";
import * as FaIcons from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { BaseModal } from "./BaseModal";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Input } from "../components/Input";
import "../styles/modal/FavoriteTaskModal.css";
import { useTranslation } from "react-i18next";
import { useFavoriteTasks } from "../../context/FavoriteTaskContext";
import { getXrm } from "../../utils/xrmUtils";
import type { Option } from "../../types";

/* =========================================================
   型定義
========================================================= */
export interface FavoriteTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedTasks: string[]) => void;
}

/* =========================================================
   コンポーネント
========================================================= */
export const FavoriteTaskModal: React.FC<FavoriteTaskModalProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const { t } = useTranslation();
    const { setFavoriteTasks } = useFavoriteTasks();

    /* ---------------------------
       Dataverseから取得
    --------------------------- */
    const [subcategories, setSubcategories] = useState<Option[]>([]);
    const [tasks, setTasks] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    /* ---------------------------
       状態管理
    --------------------------- */
    const [selectedCategory, setSelectedCategory] = useState("");
    const [taskName, setTaskName] = useState("");
    const [searchResults, setSearchResults] = useState<
        { id: string; subcategoryName: string; taskName: string }[]
    >([]);
    const [allCombinations, setAllCombinations] = useState<
        { id: string; subcategoryName: string; taskName: string }[]
    >([]);
    const [selectedTasks, setSelectedTasks] = useState<
        { id: string; subcategoryName: string; taskName: string }[]
    >([]);
    const [checkedResults, setCheckedResults] = useState<string[]>([]);
    const [checkedSelected, setCheckedSelected] = useState<string[]>([]);
    const [isLeftHeaderChecked, setIsLeftHeaderChecked] = useState(false);
    const [isRightHeaderChecked, setIsRightHeaderChecked] = useState(false);

    /* =========================================================
       Dataverseからデータ取得
    ========================================================= */
    useEffect(() => {
        if (!isOpen) return;

        const loadData = async () => {
            setIsLoading(true);
            const xrm = getXrm();
            if (!xrm?.WebApi) {
                setIsLoading(false);
                return;
            }

            try {
                // proto_subcategoryを取得
                const subcategoryResult = await xrm.WebApi.retrieveMultipleRecords(
                    "proto_subcategory",
                    "?$select=proto_subcategoryid,proto_name&$orderby=proto_name"
                );
                const subcategoryOptions: Option[] = subcategoryResult.entities.map((item: any) => ({
                    value: item.proto_name || "",
                    label: item.proto_name || "",
                }));
                setSubcategories(subcategoryOptions);

                // proto_wo_task2を取得
                const taskResult = await xrm.WebApi.retrieveMultipleRecords(
                    "proto_wo_task2",
                    "?$select=proto_wo_task2id,proto_name&$orderby=proto_name"
                );
                const taskList = taskResult.entities.map((item: any) => ({
                    id: item.proto_wo_task2id?.replace(/[{}]/g, "") || "",
                    name: item.proto_name || "",
                }));
                setTasks(taskList);
            } catch (err) {
                console.error("データ取得エラー:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [isOpen]);

    /* =========================================================
       初期データ生成（サブカテゴリ × タスク）
    ========================================================= */
    useEffect(() => {
        if (subcategories.length === 0 || tasks.length === 0) return;
        const combined = subcategories.flatMap((sc) =>
            tasks.map((task) => ({
                id: `${sc.value}_${task.id}`,
                subcategoryName: sc.label || "",
                taskName: task.name || "-",
            }))
        );
        setAllCombinations(combined);
        setSearchResults([]); // 初期は空
    }, [subcategories, tasks]);

    /* =========================================================
       🔍 検索処理（空検索で全件ヒット）
    ========================================================= */
    const handleSearch = useCallback(() => {
        if (!allCombinations || allCombinations.length === 0) {
            setSearchResults([]);
            return;
        }

        // 検索条件が両方とも空の場合は全件表示
        if (!selectedCategory && !taskName) {
            setSearchResults(allCombinations);
            return;
        }

        const filtered = allCombinations.filter((item) => {
            const matchCat =
                !selectedCategory || item.subcategoryName.includes(selectedCategory);
            const matchName =
                !taskName || item.taskName.includes(taskName);
            return matchCat && matchName;
        });

        setSearchResults(filtered);
    }, [allCombinations, selectedCategory, taskName]);

    /* =========================================================
       チェックボックス操作
    ========================================================= */
    const toggleCheck = useCallback((id: string) => {
        setCheckedResults((prev) =>
            prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
        );
    }, []);

    const toggleSelectedCheck = useCallback((id: string) => {
        setCheckedSelected((prev) =>
            prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
        );
    }, []);

    /* =========================================================
       全選択・全解除
    ========================================================= */
    const toggleLeftHeaderCheck = useCallback(() => {
        const newState = !isLeftHeaderChecked;
        setIsLeftHeaderChecked(newState);
        const available = searchResults.filter(
            (r) => !selectedTasks.some((s) => s.id === r.id)
        );
        setCheckedResults(newState ? available.map((r) => r.id) : []);
    }, [isLeftHeaderChecked, searchResults, selectedTasks]);

    const toggleRightHeaderCheck = useCallback(() => {
        const newState = checkedSelected.length < selectedTasks.length;
        setCheckedSelected(newState ? selectedTasks.map((r) => r.id) : []);
    }, [checkedSelected.length, selectedTasks]);

    useEffect(() => {
        setIsRightHeaderChecked(checkedSelected.length > 0);
    }, [checkedSelected]);

    /* =========================================================
       移動・削除操作
    ========================================================= */
    const moveToSelected = useCallback(() => {
        const toAdd = searchResults.filter((r) => checkedResults.includes(r.id));

        const updated = [...selectedTasks];
        const newChecked = [...checkedSelected];

        toAdd.forEach((r) => {
            if (!updated.some((u) => u.id === r.id)) {
                updated.push(r);
                newChecked.push(r.id);
            }
        });

        setSelectedTasks(updated);
        setCheckedSelected(newChecked);
        setCheckedResults([]);
        setIsLeftHeaderChecked(false);
    }, [searchResults, checkedResults, selectedTasks, checkedSelected]);

    const removeCheckedSelected = useCallback(() => {
        setSelectedTasks((prev) => prev.filter((r) => !checkedSelected.includes(r.id)));
        setCheckedSelected([]);
    }, [checkedSelected]);

    const removeTask = useCallback((id: string) => {
        setSelectedTasks((prev) => prev.filter((r) => r.id !== id));
        setCheckedSelected((prev) => prev.filter((u) => u !== id));
    }, []);

    /* =========================================================
       初期化処理（モーダルを閉じる時）
    ========================================================= */
    const resetModal = useCallback(() => {
        setSelectedCategory("");
        setTaskName("");
        setSearchResults([]);
        setCheckedResults([]);
        setCheckedSelected([]);
        setIsLeftHeaderChecked(false);
        setIsRightHeaderChecked(false);
    }, []);

    /* =========================================================
       クリア処理
    ========================================================= */
    const handleClear = useCallback(() => {
        setSelectedCategory("");
        setTaskName("");
        setSearchResults([]);
        setCheckedResults([]);
        setIsLeftHeaderChecked(false);
    }, []);

    /* =========================================================
       保存処理
    ========================================================= */
    const handleSave = useCallback(() => {
        const ids = selectedTasks.map((u) => u.id);
        setFavoriteTasks(selectedTasks);
        onSave(ids);
        resetModal();
        onClose();
    }, [selectedTasks, setFavoriteTasks, onSave, onClose, resetModal]);

    /* =========================================================
       モーダルを閉じる処理
    ========================================================= */
    const handleClose = useCallback(() => {
        resetModal();
        onClose();
    }, [resetModal, onClose]);

    /* =========================================================
       JSX
    ========================================================= */
    if (isLoading) {
        return (
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title={t("favoriteTask.title")}
                size="medium"
            >
                <div className="loading-state">
                    <p>{t("favoriteTask.loading")}</p>
                </div>
            </BaseModal>
        );
    }

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title={t("favoriteTask.title")}
            description={t("favoriteTask.description")}
            size="large"
            footerButtons={[
                <Button
                    key="cancel"
                    label={t("favoriteTask.cancel")}
                    color="secondary"
                    onClick={handleClose}
                />,
                <Button
                    key="save"
                    label={t("favoriteTask.save")}
                    color="primary"
                    onClick={handleSave}
                    className="favotitetask-create-button"
                />,
            ]}
        >
            <div className="modal-body">
                {/* 検索フォーム */}
                <div className="modal-grid">
                    <div className="grid-left">
                        <label className="modal-label">{t("favoriteTask.subCategory")}</label>
                        <Select
                            options={subcategories}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            placeholder={t("favoriteTask.selectSubCategory")}
                            className="favorite-task-select"
                        />
                        <div className="right-align">
                            <Button
                                label={t("favoriteTask.clear")}
                                color="secondary"
                                onClick={handleClear}
                            />
                        </div>
                    </div>

                    <div className="grid-right">
                        <label className="modal-label">{t("favoriteTask.taskName")}</label>
                        <Input
                            value={taskName}
                            onChange={setTaskName}
                            placeholder={t("favoriteTask.enterTaskName")}
                            width="100%"
                            type="text"
                        />
                        <div className="left-align">
                            <Button
                                label={t("favoriteTask.search")}
                                color="primary"
                                onClick={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                <hr className="divider" />
                <p className="list-description">{t("favoriteTask.instructions")}</p>

                {/* タスクリスト */}
                <div className="task-grid">
                    {/* 左：検索結果 */}
                    <div className="task-list">
                        <div className="list-header">
                            <span className="modal-label">{t("favoriteTask.searchResults")}</span>
                            <span className="count">{searchResults.length}{t("favoriteTask.items")}</span>
                        </div>

                        <div className="list-subheader">
                            <div className="list-subheader-left">
                                <input
                                    type="checkbox"
                                    checked={isLeftHeaderChecked}
                                    onChange={toggleLeftHeaderCheck}
                                    className="subheader-checkbox"
                                />
                                <FaIcons.FaChevronDown className="task-icon" />
                                <span className="label-text">{t("favoriteTask.subCategory")}</span>
                            </div>
                        </div>

                        <div className="list-box">
                            {
                                searchResults.map((r) => {
                                    const isSelected = selectedTasks.some((u) => u.id === r.id);
                                    return (
                                        <label
                                            key={r.id}
                                            className={`list-item-2line ${isSelected ? "disabled-item" : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                disabled={isSelected}
                                                checked={checkedResults.includes(r.id)}
                                                onChange={() => toggleCheck(r.id)}
                                            />
                                            <div className="list-text">
                                                <div className="category-name">{r.subcategoryName}</div>
                                                <div className="task-name">{r.taskName}</div>
                                            </div>
                                        </label>
                                    );
                                })
                            }
                        </div>
                    </div>

                    {/* 中央：移動ボタン */}
                    <div className="move-button-container">
                        <button
                            onClick={moveToSelected}
                            className="move-button"
                            title={t("favoriteTask.moveRight")}
                        >
                            <IoIosArrowForward />
                        </button>
                    </div>

                    {/* 右：お気に入り */}
                    <div className="task-list">
                        <div className="list-header">
                            <span className="modal-label">{t("favoriteTask.favoriteList")}</span>
                            <span className="count">{selectedTasks.length}{t("favoriteTask.items")}</span>
                        </div>

                        <div className="list-subheader">
                            <div className="list-subheader-left">
                                <input
                                    type="checkbox"
                                    checked={isRightHeaderChecked}
                                    onChange={toggleRightHeaderCheck}
                                    className="subheader-checkbox"
                                />
                                <FaIcons.FaChevronDown className="task-icon" />
                                <span className="label-text">{t("favoriteTask.subCategory")}</span>
                            </div>
                            {selectedTasks.length > 0 && (
                                <Button
                                    label=""
                                    icon={<FaIcons.FaRegTrashAlt />}
                                    onClick={removeCheckedSelected}
                                    className="trash-icon-button"
                                />
                            )}
                        </div>

                        <div className="list-box">
                            {
                                selectedTasks.map((r) => (
                                    <div key={r.id} className="list-item-favorite">
                                        <div className="list-item-favorite-left">
                                            <input
                                                type="checkbox"
                                                checked={checkedSelected.includes(r.id)}
                                                onChange={() => toggleSelectedCheck(r.id)}
                                            />
                                            <div className="list-text">
                                                <div className="category-name">{r.subcategoryName}</div>
                                                <div className="task-name">{r.taskName}</div>
                                            </div>
                                        </div>
                                        <div className="list-item-favorite-right">
                                            <Button
                                                label=""
                                                icon={<FaIcons.FaTimes />}
                                                onClick={() => removeTask(r.id)}
                                                className="delete-list-button"
                                            />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};
