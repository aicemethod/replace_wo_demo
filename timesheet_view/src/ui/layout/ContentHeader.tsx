import * as FaIcons from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Tabs } from "../components/Tabs";
import { Button } from "../components/Button";
import "../styles/layout/ContentHeader.css";
import { useTranslation } from "react-i18next";
import type { ContentHeaderProps } from "../../types/components";
import type { MainTab, ViewMode, Option } from "../../types";

/**
 * タイムシート上部の操作ヘッダー
 * - タブ切替（ユーザー／間接タスク）
 * - カレンダー移動（前・次・今日）
 * - 表示モード切替（1日／3日／週）
 * - 新規登録ボタン
 */
export const ContentHeader: React.FC<ContentHeaderProps> = ({
    mainTab,
    setMainTab,
    viewMode,
    setViewMode,
    formattedToday,
    onPrev,
    onNext,
    onToday,
    onCreateNew,
}) => {
    const { t } = useTranslation();

    /** メインタブ設定（多言語対応） */
    const mainTabOptions: Option[] = [
        { value: "user", label: t("contentHeader.userTab") },
        { value: "indirect", label: t("contentHeader.indirectTab") },
    ];

    /** 表示モードボタン（多言語対応） */
    const viewModes: { value: ViewMode; label: string }[] = [
        { value: "稼働日", label: t("contentHeader.viewMode.weekdays") },
        { value: "週", label: t("contentHeader.viewMode.week") },
    ];

    return (
        <header className="tab-header">
            {/* =============================
                左側：タブ + 新規ボタン
            ============================= */}
            <div className="tab-header-left">
                <Tabs
                    tabs={mainTabOptions}
                    activeTab={mainTab}
                    onChange={(v) => setMainTab(v as MainTab)}
                    className="main-tabs"
                />

                <Button
                    label={t("contentHeader.createNew")}
                    color="primary"
                    icon={<FaIcons.FaPlus />}
                    className="add-entry-button new-create-button"
                    onClick={onCreateNew}
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
