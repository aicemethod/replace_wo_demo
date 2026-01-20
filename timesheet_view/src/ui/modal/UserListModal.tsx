// src/product/modal/userlistmodal/UserListModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import * as FaIcons from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { BaseModal } from "./BaseModal";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useResources } from "../../hooks/useResources";
import { useAllowedUsers } from "../../context/UserListContext";
import type { Resource } from "../../hooks/useResources";
import "../styles/modal/UserListModal.css";
import { useTranslation } from "react-i18next";

/* =========================================================
   型定義
========================================================= */
export interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (selectedUsers: string[]) => void;
}

/* =========================================================
   コンポーネント
========================================================= */
export const UserListModal: React.FC<UserListModalProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const { t } = useTranslation();

    /* ---------------------------
       Dataverseから取得
    --------------------------- */
    const { resources, isLoading } = useResources();
    const { setAllowedUsers } = useAllowedUsers();

    /* ---------------------------
       状態管理
    --------------------------- */
    const [employeeId, setEmployeeId] = useState("");
    const [userName, setUserName] = useState("");
    const [searchResults, setSearchResults] = useState<Resource[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Resource[]>([]);
    const [checkedResults, setCheckedResults] = useState<string[]>([]);
    const [checkedSelected, setCheckedSelected] = useState<string[]>([]);
    const [isLeftHeaderChecked, setIsLeftHeaderChecked] = useState(false);
    const [isRightHeaderChecked, setIsRightHeaderChecked] = useState(false);

    /* ---------------------------
       General resource1~3（固定リソース）
    --------------------------- */
    const generalResources: Resource[] = [
        { id: "general-resource-1", name: "General resource1", number: "GR1" },
        { id: "general-resource-2", name: "General resource2", number: "GR2" },
        { id: "general-resource-3", name: "General resource3", number: "GR3" },
    ];

    /* =========================================================
       検索処理（空検索で全件ヒット）
    ========================================================= */
    const handleSearch = useCallback(() => {
        if (!resources || resources.length === 0) {
            setSearchResults([]);
            return;
        }

        // 検索条件が両方とも空の場合は全件表示
        if (!employeeId && !userName) {
            setSearchResults(resources);
            return;
        }

        const filtered = resources.filter(
            (r) =>
                (!employeeId || (r.number ?? "").includes(employeeId)) &&
                (!userName || (r.name ?? "").includes(userName))
        );
        setSearchResults(filtered);
    }, [employeeId, userName, resources]);

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
            (r) => !selectedUsers.some((s) => s.id === r.id)
        );
        setCheckedResults(newState ? available.map((r) => r.id) : []);
    }, [isLeftHeaderChecked, searchResults, selectedUsers]);

    /* =========================================================
       モーダルオープン時にGeneral resource1~3を初期化
    ========================================================= */
    useEffect(() => {
        if (isOpen) {
            // General resource1~3を常に選択済みに追加（まだ追加されていない場合のみ）
            setSelectedUsers((prev) => {
                const generalIds = generalResources.map((r) => r.id);
                const hasAllGeneral = generalIds.every((id) =>
                    prev.some((u) => u.id === id)
                );
                if (!hasAllGeneral) {
                    const existingIds = prev.map((u) => u.id);
                    const toAdd = generalResources.filter(
                        (r) => !existingIds.includes(r.id)
                    );
                    return [...prev, ...toAdd];
                }
                return prev;
            });
        }
    }, [isOpen]);

    const toggleRightHeaderCheck = useCallback(() => {
        const newState = checkedSelected.length < selectedUsers.length;
        setCheckedSelected(newState ? selectedUsers.map((r) => r.id) : []);
    }, [checkedSelected.length, selectedUsers]);

    useEffect(() => {
        setIsRightHeaderChecked(checkedSelected.length > 0);
    }, [checkedSelected]);

    /* =========================================================
       移動・削除操作
    ========================================================= */
    const moveToSelected = useCallback(() => {
        const toAdd = searchResults.filter((r) => checkedResults.includes(r.id));

        const updated = [...selectedUsers];
        const newChecked = [...checkedSelected];

        toAdd.forEach((r) => {
            if (!updated.some((u) => u.id === r.id)) {
                updated.push(r);
                newChecked.push(r.id);
            }
        });

        setSelectedUsers(updated);
        setCheckedSelected(newChecked);
        setCheckedResults([]);
        setIsLeftHeaderChecked(false);
    }, [searchResults, checkedResults, selectedUsers, checkedSelected]);

    const removeCheckedSelected = useCallback(() => {
        // General resource1~3は削除不可
        const generalIds = generalResources.map((r) => r.id);
        setSelectedUsers((prev) =>
            prev.filter(
                (r) => !checkedSelected.includes(r.id) || generalIds.includes(r.id)
            )
        );
        setCheckedSelected([]);
    }, [checkedSelected]);

    const removeUser = useCallback((id: string) => {
        // General resource1~3は削除不可
        const generalIds = generalResources.map((r) => r.id);
        if (generalIds.includes(id)) {
            return;
        }
        setSelectedUsers((prev) => prev.filter((r) => r.id !== id));
        setCheckedSelected((prev) => prev.filter((u) => u !== id));
    }, []);

    /* =========================================================
       初期化処理（モーダルを閉じる時）
    ========================================================= */
    const resetModal = useCallback(() => {
        setEmployeeId("");
        setUserName("");
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
        setEmployeeId("");
        setUserName("");
        setSearchResults([]);
        setCheckedResults([]);
        setIsLeftHeaderChecked(false);
    }, []);

    /* =========================================================
       保存処理
    ========================================================= */
    const handleSave = useCallback(() => {
        const ids = selectedUsers.map((u) => u.id);
        setAllowedUsers(ids);
        onSave(ids);
        resetModal();
        onClose();
    }, [selectedUsers, setAllowedUsers, onSave, onClose, resetModal]);

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
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title={t("userList.title")}
            description={t("userList.description")}
            size="large"
            footerButtons={[
                <Button
                    key="cancel"
                    label={t("userList.cancel")}
                    color="secondary"
                    onClick={handleClose}
                />,
                <Button
                    key="save"
                    label={t("userList.save")}
                    color="primary"
                    onClick={handleSave}
                    className="userlist-create-button"
                />,
            ]}
        >
            <div className="modal-body">
                {/* 検索フォーム */}
                <div className="modal-grid">
                    <div className="grid-left">
                        <label className="modal-label">{t("userList.employeeId")}</label>
                        <Input
                            value={employeeId}
                            onChange={setEmployeeId}
                            placeholder={t("userList.enterEmployeeId")}
                            width="100%"
                            type="text"
                        />
                        <div className="right-align">
                            <Button
                                label={t("userList.clear")}
                                color="secondary"
                                onClick={handleClear}
                            />
                        </div>
                    </div>

                    <div className="grid-right">
                        <label className="modal-label">{t("userList.userName")}</label>
                        <Input
                            value={userName}
                            onChange={setUserName}
                            placeholder={t("userList.enterUserName")}
                            width="100%"
                            type="text"
                        />
                        <div className="left-align">
                            <Button label={t("userList.search")} color="primary" onClick={handleSearch} />
                        </div>
                    </div>
                </div>

                <hr className="divider" />

                <p className="list-description">{t("userList.instructions")}</p>

                {isLoading ? (
                    <p>{t("userList.loading")}</p>
                ) : (
                    <div className="task-grid">
                        {/* 左：検索結果 */}
                        <div className="task-list">
                            <div className="list-header">
                                <span className="modal-label">{t("userList.searchResults")}</span>
                                <span className="count">{searchResults.length}{t("userList.items")}</span>
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
                                    <span className="label-text">{t("userList.userName")}</span>
                                </div>
                            </div>

                            <div className="list-box">
                                {
                                    searchResults.map((r) => {
                                        const isSelected = selectedUsers.some((u) => u.id === r.id);
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
                                                    <div className="category-name">{r.number ?? "-"}</div>
                                                    <div className="task-name">{r.name ?? t("userList.noName")}</div>
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
                                title={t("userList.moveRight")}
                            >
                                <IoIosArrowForward />
                            </button>
                        </div>

                        {/* 右：設定済ユーザー */}
                        <div className="task-list">
                            <div className="list-header">
                                <span className="modal-label">{t("userList.selectedUsers")}</span>
                                <span className="count">{selectedUsers.length}{t("userList.items")}</span>
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
                                    <span className="label-text">{t("userList.userName")}</span>
                                </div>
                                {selectedUsers.length > 0 && (
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
                                    selectedUsers.map((r) => {
                                        const isGeneralResource = generalResources.some(
                                            (gr) => gr.id === r.id
                                        );
                                        return (
                                            <div key={r.id} className="list-item-favorite">
                                                <div className="list-item-favorite-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedSelected.includes(r.id)}
                                                        onChange={() => toggleSelectedCheck(r.id)}
                                                    />
                                                    <div className="list-text">
                                                        <div className="category-name">{r.number ?? "-"}</div>
                                                        <div className="task-name">{r.name ?? t("userList.noName")}</div>
                                                    </div>
                                                </div>
                                                <div className="list-item-favorite-right">
                                                    {!isGeneralResource && (
                                                        <Button
                                                            label=""
                                                            icon={<FaIcons.FaTimes />}
                                                            onClick={() => removeUser(r.id)}
                                                            className="delete-list-button"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};
