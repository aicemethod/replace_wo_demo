import { useState, useRef, useEffect, useMemo } from "react";
import * as FaIcons from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// import { Tabs } from "../components/Tabs";
import { Button } from "../components/Button";
import "../styles/layout/ContentHeader.css";
import { useTranslation } from "react-i18next";
import type { ContentHeaderProps } from "../../types/components";
import type { ViewMode } from "../../types";

/**
 * タイムシート上部の操作ヘッダー
 * - タブ切替（ユーザー／間接タスク）
 * - カレンダー移動（前・次・今日）
 * - 表示モード切替（1日／3日／週）
 * - 新規登録ボタン
 */
export const ContentHeader: React.FC<ContentHeaderProps> = ({
    // mainTab,
    // setMainTab,
    viewMode,
    setViewMode,
    formattedToday,
    onPrev,
    onNext,
    onToday,
    onCreateNew,
    onCopyClick,
    isCopyEnabled = false,
    selectOptions = [],
    selectValue,
    onSelectChange,
    isSelectLoading = false,
}) => {
    const { t } = useTranslation();

    /** 表示モードボタン（多言語対応） */
    const viewModes: { value: ViewMode; label: string }[] = [
        { value: "稼働日", label: t("contentHeader.viewMode.weekdays") },
        { value: "週", label: t("contentHeader.viewMode.week") },
    ];

    /** 検索欄付きセレクトの状態 */
    const [selectOpen, setSelectOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const selectWrapperRef = useRef<HTMLDivElement | null>(null);

    /** 外部クリックで閉じる */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (selectWrapperRef.current && !selectWrapperRef.current.contains(e.target as Node)) {
                setSelectOpen(false);
                setSearchQuery("");
            }
        };
        if (selectOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [selectOpen]);

    /** 検索でフィルタリングされたオプション */
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return selectOptions;
        const query = searchQuery.toLowerCase();
        return selectOptions.filter((opt) =>
            opt.label.toLowerCase().includes(query)
        );
    }, [selectOptions, searchQuery]);

    /** 現在のラベルを取得 */
    const selectedLabel = selectOptions.find((opt) => opt.value === selectValue)?.label;

    /** 値選択時の処理 */
    const handleSelect = (val: string) => {
        onSelectChange?.(val);
        setSelectOpen(false);
        setSearchQuery("");
    };

    return (
        <header className="tab-header">
            {/* =============================
                左側：タブ + 新規ボタン
            ============================= */}
            <div className="tab-header-left">
                <Button
                    label={t("contentHeader.createNew")}
                    color="primary"
                    icon={<FaIcons.FaPlus />}
                    className="add-entry-button new-create-button"
                    onClick={onCreateNew}
                />
                <div ref={selectWrapperRef} className={`header-select-wrapper ${selectOpen ? "open" : ""} ${isSelectLoading ? "loading" : ""}`}>
                    {/* 表示部分 */}
                    <div
                        className="header-select-display"
                        onClick={() => !isSelectLoading && setSelectOpen((prev) => !prev)}
                        role="button"
                        aria-expanded={selectOpen}
                    >
                        <span className={`header-select-text ${!selectedLabel ? "placeholder" : ""}`}>
                            {isSelectLoading ? "取得中..." : (selectedLabel || "選択してください")}
                        </span>
                        <span className="header-select-icon">
                            <FaIcons.FaChevronDown />
                        </span>
                    </div>

                    {/* ドロップダウンリスト */}
                    {selectOpen && !isSelectLoading && (
                        <div className="header-select-dropdown">
                            {/* 検索欄 */}
                            <div className="header-select-search">
                                <FaIcons.FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="検索..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>

                            {/* オプションリスト */}
                            <div className="header-select-options">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((opt) => (
                                        <div
                                            key={opt.value}
                                            className={`header-select-option ${opt.value === selectValue ? "selected" : ""}`}
                                            onClick={() => handleSelect(opt.value)}
                                        >
                                            {opt.label}
                                        </div>
                                    ))
                                ) : (
                                    <div className="header-select-option empty">該当する項目がありません</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    label="1dayコピー"
                    color="primary"
                    disabled={!isCopyEnabled}
                    onClick={onCopyClick}
                />
            </div>

            {/* =============================
                右側：カレンダー操作群
            ============================= */}
            <div className="tab-header-right">
                {/* 今日ボタン */}
                <button className="today-button" onClick={onToday}>
                    <FaIcons.FaCalendarDay className="icon" /> {t("calendar.today")}
                </button>

                {/* 前後ナビゲーション */}
                <button className="arrow-button" onClick={onPrev}>
                    <IoIosArrowBack />
                </button>
                <button className="arrow-button" onClick={onNext}>
                    <IoIosArrowForward />
                </button>

                {/* 現在表示日 */}
                <div className="date-display">
                    {formattedToday}
                    <FaIcons.FaRegCalendarAlt className="date-icon" />
                </div>

                {/* 表示モード切替 */}
                <div className="view-tabs">
                    {viewModes.map((mode) => (
                        <button
                            key={mode.value}
                            className={`view-tab ${viewMode === mode.value ? "active" : ""}`}
                            onClick={() => setViewMode(mode.value)}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
};
