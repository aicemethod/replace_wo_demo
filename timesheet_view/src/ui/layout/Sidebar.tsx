import React, { useState, useMemo } from "react";
import * as FaIcons from "react-icons/fa";
import { Input } from "../components/Input";
import "../styles/layout/Sidebar.css";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useResources } from "../../hooks/useResources";
import { useAllowedUsers } from "../../context/UserListContext";
import { useFavoriteTasks } from "../../context/FavoriteTaskContext"; // ✅ 追加
import { useTranslation } from "react-i18next";
import type { SidebarProps } from "../../types/components";
import type { UserSortKey, TaskSortKey, SearchType } from "../../types";

/**
 * Sidebar コンポーネント
 */
export const Sidebar: React.FC<SidebarProps> = ({ mainTab, selectedTask = "", onTaskSelect }) => {
    const { t } = useTranslation();
    const { favoriteTasks } = useFavoriteTasks(); // ✅ Contextからお気に入りタスク取得

    /** 検索・選択状態 */
    const [searchType, setSearchType] = useState<SearchType>("name");
    const [keyword, setKeyword] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>(["self"]);

    /** 並び替え設定 */
    const [isUserSortOpen, setIsUserSortOpen] = useState(false);
    const [isTaskSortOpen, setIsTaskSortOpen] = useState(false);
    const [userSortOption, setUserSortOption] = useState<UserSortKey>("numberAsc");
    const [taskSortOption, setTaskSortOption] = useState<TaskSortKey>("categoryAsc");

    /** Dataverse: 現在ユーザー情報 */
    const { currentUser, isLoading: isUserLoading } = useCurrentUser();

    /** Dataverse: リソース一覧 */
    const { resources, isLoading: isResourceLoading } = useResources();

    /** コンテキスト: 許可ユーザー一覧 */
    const { allowedUsers } = useAllowedUsers();

    /** ログイン中ユーザー表示用 */
    const displaySelf = useMemo(() => {
        if (isUserLoading)
            return { number: t("sidebar.loadingNumber"), fullName: t("sidebar.loadingUser") };
        if (!currentUser)
            return { number: t("sidebar.noEmpId"), fullName: t("sidebar.noUserInfo") };

        return {
            number: currentUser.employeeid || t("sidebar.noEmpId"),
            fullName: `${currentUser.lastName || ""} ${currentUser.firstName || ""}`.trim(),
        };
    }, [currentUser, isUserLoading, t]);

    /** 表示対象ユーザー（許可済みのみ） */
    const visibleUsers = useMemo(() => {
        if (isResourceLoading) return [];
        return resources.filter((r) => allowedUsers.includes(r.id));
    }, [resources, allowedUsers, isResourceLoading]);

    /** 検索・ソート適用後のユーザー一覧 */
    const filteredUsers = useMemo(() => {
        const list =
            searchType === "name"
                ? visibleUsers.filter((u) => (u.name || "").includes(keyword))
                : visibleUsers.filter((u) => (u.number || "").includes(keyword));

        const sortBy: Record<UserSortKey, (a: any, b: any) => number> = {
            numberAsc: (a, b) => (a.number || "").localeCompare(b.number || ""),
            numberDesc: (a, b) => (b.number || "").localeCompare(a.number || ""),
            nameAsc: (a, b) => (a.name || "").localeCompare(b.name || ""),
            nameDesc: (a, b) => (b.name || "").localeCompare(a.name || ""),
        };

        return [...list].sort(sortBy[userSortOption]);
    }, [keyword, searchType, visibleUsers, userSortOption]);

    /** ✅ お気に入りタスクのソート処理 */
    const sortedFavoriteTasks = useMemo(() => {
        const sortBy: Record<TaskSortKey, (a: any, b: any) => number> = {
            categoryAsc: (a, b) => a.subcategoryName.localeCompare(b.subcategoryName),
            categoryDesc: (a, b) => b.subcategoryName.localeCompare(a.subcategoryName),
            taskAsc: (a, b) => a.taskName.localeCompare(b.taskName),
            taskDesc: (a, b) => b.taskName.localeCompare(a.taskName),
        };
        return [...favoriteTasks].sort(sortBy[taskSortOption]);
    }, [favoriteTasks, taskSortOption]);

    /** ユーザー選択トグル */
    const toggleSelect = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    /** 並び替え候補（多言語対応） */
    const userSortOptions = [
        { value: "numberAsc", label: `▲ ${t("sidebar.sort.empAsc")}` },
        { value: "numberDesc", label: `▼ ${t("sidebar.sort.empDesc")}` },
        { value: "nameAsc", label: `▲ ${t("sidebar.sort.nameAsc")}` },
        { value: "nameDesc", label: `▼ ${t("sidebar.sort.nameDesc")}` },
    ];

    const taskSortOptions = [
        { value: "categoryAsc", label: `▲ ${t("sidebar.sort.categoryAsc")}` },
        { value: "categoryDesc", label: `▼ ${t("sidebar.sort.categoryDesc")}` },
        { value: "taskAsc", label: `▲ ${t("sidebar.sort.taskAsc")}` },
        { value: "taskDesc", label: `▼ ${t("sidebar.sort.taskDesc")}` },
    ];

    return (
        <aside className="sidebar-container">
            {/* USERタブ */}
            {mainTab === "user" && (
                <>
                    <h2 className="sidebar-title">{t("sidebar.searchTitle")}</h2>

                    {/* 検索タイプ切替 */}
                    <div className="sidebar-radios">
                        {["name", "number"].map((type) => (
                            <label key={type}>
                                <input
                                    type="radio"
                                    name="sidebarSearchType"
                                    value={type}
                                    checked={searchType === type}
                                    onChange={() => setSearchType(type as SearchType)}
                                />
                                {type === "name" ? t("sidebar.searchByName") : t("sidebar.searchByNumber")}
                            </label>
                        ))}
                    </div>

                    {/* 検索入力 */}
                    <Input
                        placeholder={
                            searchType === "name" ? t("sidebar.placeholderName") : t("sidebar.placeholderNumber")
                        }
                        className="sidebar-input"
                        value={keyword}
                        onChange={setKeyword}
                    />

                    {/* 自分の表示 */}
                    <label className="sidebar-self-item clickable">
                        <input
                            type="checkbox"
                            className="sidebar-checkbox"
                            checked={selectedUsers.includes("self")}
                            onChange={() => toggleSelect("self")}
                        />
                        <div className="sidebar-self-text">
                            <span className="sidebar-self-number">
                                {`${displaySelf.number}（${t("sidebar.self")}）`}
                            </span>
                            <span className="sidebar-self-roman">{displaySelf.fullName}</span>
                        </div>
                    </label>

                    {/* 並び替え */}
                    <div
                        className="sidebar-self-divider clickable"
                        onClick={() => setIsUserSortOpen((p) => !p)}
                    >
                        <FaIcons.FaChevronDown
                            className={`sidebar-self-icon ${isUserSortOpen ? "rotated" : ""}`}
                        />
                        <span className="sidebar-self-label">{t("sidebar.userSortLabel")}</span>
                        <FaIcons.FaSortAmountDown className="sidebar-self-icon" />
                    </div>

                    {isUserSortOpen && (
                        <div className="sidebar-sort-dropdown">
                            {userSortOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`sidebar-sort-option ${userSortOption === opt.value ? "active" : ""}`}
                                    onClick={() => {
                                        setUserSortOption(opt.value as UserSortKey);
                                        setIsUserSortOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 検索結果 */}
                    {!isResourceLoading && filteredUsers.length > 0 && (
                        <div className="sidebar-results">
                            {filteredUsers.map((user) => (
                                <label key={user.id} className="sidebar-result-item clickable">
                                    <input
                                        type="checkbox"
                                        className="sidebar-checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleSelect(user.id)}
                                    />
                                    <span className="sidebar-result-text">
                                        {(user.number || t("sidebar.unknownNumber"))}{" "}
                                        {(user.name || t("sidebar.unknownName"))}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* INDIRECTタブ */}
            {mainTab === "indirect" && (
                <>
                    <div
                        className="sidebar-self-divider clickable"
                        onClick={() => setIsTaskSortOpen((p) => !p)}
                    >
                        <FaIcons.FaChevronDown
                            className={`sidebar-self-icon ${isTaskSortOpen ? "rotated" : ""}`}
                        />
                        <span className="sidebar-self-label">{t("sidebar.taskSortLabel")}</span>
                        <FaIcons.FaSortAmountDown className="sidebar-self-icon" />
                    </div>

                    {isTaskSortOpen && (
                        <div className="sidebar-sort-dropdown">
                            {taskSortOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`sidebar-sort-option ${taskSortOption === opt.value ? "active" : ""}`}
                                    onClick={() => {
                                        setTaskSortOption(opt.value as TaskSortKey);
                                        setIsTaskSortOpen(false);
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ✅ お気に入りタスクのみ表示 */}
                    <div className="sidebar-task-list">
                        {
                            sortedFavoriteTasks.map((task) => (
                                <label key={task.id} className="sidebar-task-radio">
                                    <input
                                        type="radio"
                                        name="sidebarTaskType"
                                        value={task.id}
                                        checked={selectedTask === task.id}
                                        onChange={() => onTaskSelect?.(task.id)}
                                    />
                                    <div className="sidebar-task-lines">
                                        <span className="sidebar-task-category">{task.subcategoryName}</span>
                                        <span className="sidebar-task-name">{task.taskName}</span>
                                    </div>
                                </label>
                            ))
                        }
                    </div>
                </>
            )}
        </aside>
    );
};
