import React, { useState, useMemo, useCallback } from "react";
import * as FaIcons from "react-icons/fa";
import { BaseModal } from "./BaseModal";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useResources } from "../../hooks/useResources";
import type { Resource } from "../../hooks/useResources";
import "../styles/modal/ResourceSelectModal.css";
import { useTranslation } from "react-i18next";
import { FIXED_USER_NAMES } from "../../constants/fixedUsers";

interface ResourceSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (selectedResources: { id: string; label: string }[]) => void;
}

/* =========================================================
   コンポーネント本体
========================================================= */
export const ResourceSelectModal: React.FC<ResourceSelectModalProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const { t } = useTranslation();

    /* =========================================================
       ▼ Dataverse ログインユーザー情報
    ========================================================= */
    const { currentUser, isLoading: isUserLoading } = useCurrentUser();

    const displaySelf = useMemo(() => {
        if (isUserLoading) {
            return { fullName: t("resource.loadingName") };
        }
        if (!currentUser) {
            return { fullName: t("resource.noUserInfo") };
        }

        const fullName = `${currentUser.lastName ?? ""} ${currentUser.firstName ?? ""}`.trim();

        return { fullName };
    }, [currentUser, isUserLoading, t]);

    /* =========================================================
       ▼ Dataverse リソース一覧
    ========================================================= */
    const { resources, isLoading: isResourcesLoading } = useResources();

    // 固定ユーザーのみ抽出
    const visibleResources = useMemo(() => {
        if (isResourcesLoading) return [];
        return FIXED_USER_NAMES.map((name, index) => {
            const found = resources.find((r) => r.name === name);
            return found ?? { id: `fixed-user-${index + 1}`, name, number: "" };
        });
    }, [resources, isResourcesLoading]);

    /* =========================================================
       ▼ 検索・ソート設定
    ========================================================= */
    const [searchType, setSearchType] = useState<"name" | "number">("name");
    const [keyword, setKeyword] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>(["self"]);
    const [sortByNumberAsc, setSortByNumberAsc] = useState(true);
    const [sortByNameAsc, setSortByNameAsc] = useState(true);

    /* =========================================================
       ▼ 検索＋ソート結果
    ========================================================= */
    const filteredUsers = useMemo(() => {
        const filtered =
            searchType === "name"
                ? visibleResources.filter((u) => (u.name ?? "").includes(keyword))
                : visibleResources.filter((u) => (u.number ?? "").includes(keyword));

        return [...filtered]
            .sort((a, b) =>
                sortByNumberAsc
                    ? (a.number ?? "").localeCompare(b.number ?? "")
                    : (b.number ?? "").localeCompare(a.number ?? "")
            )
            .sort((a, b) =>
                sortByNameAsc
                    ? (a.name ?? "").localeCompare(b.name ?? "")
                    : (b.name ?? "").localeCompare(a.name ?? "")
            );
    }, [keyword, searchType, sortByNumberAsc, sortByNameAsc, visibleResources]);

    /* =========================================================
       ▼ 表示用配列（常に自分を先頭に表示）
    ========================================================= */
    const displayUsers: Resource[] = [
        {
            id: "self",
            number: "",
            name: displaySelf.fullName,
        },
        ...filteredUsers,
    ];

    /* =========================================================
       ▼ チェック操作
    ========================================================= */
    const toggleSelect = useCallback(
        (id: string) => {
            setSelectedUsers((prev) =>
                prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
            );
        },
        [setSelectedUsers]
    );

    /* =========================================================
       ▼ 保存処理（ラベル形式で返す）
    ========================================================= */
    const handleSave = useCallback(() => {
        const selectedResources = displayUsers
            .filter((u) => selectedUsers.includes(u.id))
            .map((u) => ({
                id: u.id,
                label: u.id === "self"
                    ? `${u.name ?? t("resource.noName")}${t("resource.selfTag")}`
                    : (u.name ?? t("resource.noName")),
            }));

        console.log(" 選択されたリソース:", selectedResources);

        onSave?.(selectedResources);
        onClose();
    }, [displayUsers, selectedUsers, onSave, onClose, t]);

    /* =========================================================
       ▼ JSX
    ========================================================= */
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            size="medium"
            footerButtons={[
                <Button key="cancel" label={t("resource.cancel")} color="secondary" onClick={onClose} />,
                <Button
                    key="save"
                    label={t("resource.save")}
                    color="primary"
                    onClick={handleSave}
                    className="resource-modal-button"
                />,
            ]}
        >
            <div className="resource-modal-body">
                {/* -------------------------------
            検索条件
        ------------------------------- */}
                <div className="resource-radios">
                    <input
                        id="radio-name"
                        type="radio"
                        name="searchTypeResource"
                        value="name"
                        checked={searchType === "name"}
                        onChange={() => setSearchType("name")}
                    />
                    <label htmlFor="radio-name">{t("resource.userName")}</label>

                    <input
                        id="radio-number"
                        type="radio"
                        name="searchTypeResource"
                        value="number"
                        checked={searchType === "number"}
                        onChange={() => setSearchType("number")}
                    />
                    <label htmlFor="radio-number">{t("resource.employeeId")}</label>
                </div>

                <Input
                    placeholder={
                        searchType === "name"
                            ? t("resource.enterUserName")
                            : t("resource.enterEmployeeId")
                    }
                    className="resource-input"
                    value={keyword}
                    onChange={setKeyword}
                />

                {/* -------------------------------
            ソート
        ------------------------------- */}
                <div className="resource-sort-row">
                    <button
                        className="resource-sort-btn"
                        onClick={() => setSortByNumberAsc((p) => !p)}
                    >
                        {sortByNumberAsc ? (
                            <FaIcons.FaSortAmountUp className="resource-sort-icon" />
                        ) : (
                            <FaIcons.FaSortAmountDown className="resource-sort-icon" />
                        )}
                        {t("resource.sortByNumber")}
                    </button>

                    <button
                        className="resource-sort-btn"
                        onClick={() => setSortByNameAsc((p) => !p)}
                    >
                        {sortByNameAsc ? (
                            <FaIcons.FaSortAlphaUp className="resource-sort-icon" />
                        ) : (
                            <FaIcons.FaSortAlphaDown className="resource-sort-icon" />
                        )}
                        {t("resource.sortByName")}
                    </button>
                </div>

                {/* -------------------------------
            リスト表示
        ------------------------------- */}
                <div className="resource-list">
                    {displayUsers.map((u) => (
                        <label key={u.id} className="resource-item clickable">
                            <input
                                type="checkbox"
                                checked={selectedUsers.includes(u.id)}
                                onChange={() => toggleSelect(u.id)}
                                className="resource-checkbox"
                            />
                            <div className="resource-text">
                                <span className="resource-name">
                                    {u.name ?? t("resource.noName")}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </BaseModal>
    );
};
