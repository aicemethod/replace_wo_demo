import React, { useState, useMemo } from "react";
import { Select } from "../components/Select";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { FaChevronDown, FaChevronUp, FaUser, FaStar } from "react-icons/fa";
import "../styles/layout/WorkTimeInfo.css";
import { useTranslation } from "react-i18next";
import type { Option } from "../../types";
import type { EventInput } from "@fullcalendar/core";
import type { CalendarViewMode } from "./CalendarView";

/**
 * 作業時間情報コンポーネントのProps
 */
export type WorkTimeInfoProps = {
    events: EventInput[];
    currentDate: Date;
    viewMode: CalendarViewMode;
    onInsertBreakTime?: (breakEvents: EventInput[]) => void;
    onLoadingChange?: (isLoading: boolean) => void;
    /** ユーザー一覧設定モーダルを開く */
    onOpenUserList?: () => void;
    /** お気に入り間接タスク設定モーダルを開く */
    onOpenFavoriteTask?: () => void;
};

/**
 * 作業時間情報コンポーネント
 * - 開始時間、終了時間、休憩時間1、休憩時間2、工数合計を表示・入力
 * - 隙間時間挿入、固定時間挿入のセレクト
 * - カレンダーのイベントから合計工数を計算
 */
export const WorkTimeInfo: React.FC<WorkTimeInfoProps> = ({
    events,
    currentDate,
    viewMode,
    onInsertBreakTime,
    onLoadingChange,
    onOpenUserList,
    onOpenFavoriteTask,
}) => {
    const { t } = useTranslation();
    /** 時間入力の状態管理 */
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("18:00");
    const [breakTime1Start, setBreakTime1Start] = useState("12:00");
    const [breakTime1End, setBreakTime1End] = useState("13:00");
    const [breakTime2Start, setBreakTime2Start] = useState("15:00");
    const [breakTime2End, setBreakTime2End] = useState("15:30");
    const [gapTimeInsert, setGapTimeInsert] = useState<string>("");
    const [fixedTimeInsert, setFixedTimeInsert] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    /** 隙間時間挿入オプション */
    const gapTimeOptions: Option[] = [
        { value: "gap1", label: "隙間時間挿入1" },
        { value: "gap2", label: "隙間時間挿入2" },
    ];

    /** 固定時間挿入オプション */
    const fixedTimeOptions: Option[] = [
        { value: "fixed1", label: "休憩時間挿入1" },
        { value: "fixed2", label: "休憩時間挿入2" },
    ];

    /** 現在表示されている期間の開始日と終了日を計算 */
    const viewRange = useMemo(() => {
        const start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);

        // 週の開始日（月曜日）を取得
        const dayOfWeek = start.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 月曜日を0にする
        start.setDate(start.getDate() + diff);

        const end = new Date(start);
        if (viewMode === "稼働日") {
            // 月〜金の5日間
            end.setDate(start.getDate() + 5);
        } else {
            // 週の7日間
            end.setDate(start.getDate() + 7);
        }

        return { start, end };
    }, [currentDate, viewMode]);

    /** 固定時間挿入の選択が変更されたときの処理 */
    const handleFixedTimeInsertChange = async (value: string) => {
        if (!value) {
            return;
        }

        // 既に選択されている場合は処理しない
        if (fixedTimeInsert === value) {
            return;
        }

        setFixedTimeInsert(value);
        setIsLoading(true);
        onLoadingChange?.(true);

        try {
            // 処理時間をシミュレート（実際の処理時間に合わせて調整可能）
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (value === "fixed1" && onInsertBreakTime && breakTime1Start && breakTime1End) {
                handleInsertBreakTime(breakTime1Start, breakTime1End, "休憩1");
            } else if (value === "fixed2" && onInsertBreakTime && breakTime2Start && breakTime2End) {
                handleInsertBreakTime(breakTime2Start, breakTime2End, "休憩2");
            }
        } catch (error) {
            console.error("固定時間挿入エラー:", error);
            alert("固定時間の挿入に失敗しました。");
        } finally {
            setIsLoading(false);
            onLoadingChange?.(false);
        }
    };

    /** 休憩時間を挿入する共通処理（クライアント側のみ） */
    const handleInsertBreakTime = (
        breakStartTime: string,
        breakEndTime: string,
        title: string
    ) => {
        if (!onInsertBreakTime || !breakStartTime || !breakEndTime) {
            return;
        }

        try {
            // 休憩時間の開始時間と終了時間を分に変換
            const [breakStartHours, breakStartMinutes] = breakStartTime.split(":").map(Number);
            const [breakEndHours, breakEndMinutes] = breakEndTime.split(":").map(Number);
            const breakStartTotalMinutes = (breakStartHours || 0) * 60 + (breakStartMinutes || 0);
            const breakEndTotalMinutes = (breakEndHours || 0) * 60 + (breakEndMinutes || 0);

            // 表示範囲内の各週の平日（月曜日から金曜日）を取得
            const dates: Date[] = [];
            const startDate = new Date(viewRange.start);
            const endDate = new Date(viewRange.end);

            // 開始日の週の月曜日を取得
            const startDayOfWeek = startDate.getDay();
            const startMondayOffset = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
            const firstMonday = new Date(startDate);
            firstMonday.setDate(startDate.getDate() + startMondayOffset);
            firstMonday.setHours(0, 0, 0, 0);

            // 終了日の週の月曜日を取得
            const endDayOfWeek = endDate.getDay();
            const endMondayOffset = endDayOfWeek === 0 ? -6 : 1 - endDayOfWeek;
            const lastMonday = new Date(endDate);
            lastMonday.setDate(endDate.getDate() + endMondayOffset);
            lastMonday.setHours(0, 0, 0, 0);

            // 各週の月曜日から金曜日までの平日を取得
            let currentMonday = new Date(firstMonday);
            while (currentMonday <= lastMonday) {
                // 月曜日から金曜日までの5日間を追加
                for (let i = 0; i < 5; i++) {
                    const date = new Date(currentMonday);
                    date.setDate(currentMonday.getDate() + i);
                    // 表示範囲内の日付のみ追加
                    if (date >= startDate && date < endDate) {
                        dates.push(date);
                    }
                }
                // 次の週の月曜日に移動
                currentMonday.setDate(currentMonday.getDate() + 7);
            }

            // 各日に休憩時間のイベントを作成
            const breakEvents: EventInput[] = dates.map((date, index) => {
                const breakStart = new Date(date);
                breakStart.setHours(Math.floor(breakStartTotalMinutes / 60), breakStartTotalMinutes % 60, 0, 0);

                const breakEnd = new Date(date);
                breakEnd.setHours(Math.floor(breakEndTotalMinutes / 60), breakEndTotalMinutes % 60, 0, 0);

                return {
                    id: `break-${title}-${date.getTime()}-${index}`,
                    start: breakStart,
                    end: breakEnd,
                    title: title,
                    backgroundColor: "#e0e0e0",
                    borderColor: "#d0d0d0",
                    textColor: "#666",
                    extendedProps: {
                        isBreakTime: true,
                    },
                };
            });

            onInsertBreakTime(breakEvents);
        } catch (error) {
            console.error("休憩時間挿入エラー:", error);
            alert("休憩時間の挿入に失敗しました。");
        }
    };

    /** カレンダーのイベントから合計工数を計算 */
    const totalTime = useMemo(() => {
        try {
            let totalMinutes = 0;

            events.forEach((event) => {
                if (!event.start || !event.end) return;

                const eventStart = event.start instanceof Date
                    ? event.start
                    : new Date(event.start as string | number);
                const eventEnd = event.end instanceof Date
                    ? event.end
                    : new Date(event.end as string | number);

                // 現在表示されている期間内のイベントのみを計算
                if (eventStart >= viewRange.start && eventEnd <= viewRange.end) {
                    const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);
                    totalMinutes += duration;
                }
            });

            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.round(totalMinutes % 60);

            return { hours, minutes };
        } catch {
            return { hours: 0, minutes: 0 };
        }
    }, [events, viewRange]);

    return (
        <div className={`work-time-info ${isCollapsed ? "collapsed" : ""}`}>
            <div className="work-time-info-header">
                <div className="work-time-info-header-left">
                    <span className="time-label">工数合計</span>
                    <span className="time-value">
                        {totalTime.hours}時{totalTime.minutes}分
                    </span>
                </div>
                <button
                    className="work-time-info-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "展開" : "折りたたみ"}
                    aria-expanded={!isCollapsed}
                >
                    {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </button>
            </div>
            <div className={`work-time-info-content ${isCollapsed ? "collapsed" : ""}`}>
                <div className="work-time-info-content-row">
                    <div className="work-time-info-left">
                        <div className="time-item">
                            <Input
                                label="開始時間"
                                type="time"
                                value={startTime}
                                onChange={setStartTime}
                                width="100px"
                            />
                        </div>
                        <div className="time-item">
                            <Input
                                label="終了時間"
                                type="time"
                                value={endTime}
                                onChange={setEndTime}
                                width="100px"
                            />
                        </div>
                        <div className="time-item break-time-item">
                            <span className="time-label">休憩時間1</span>
                            <div className="break-time-inputs">
                                <Input
                                    type="time"
                                    value={breakTime1Start}
                                    onChange={setBreakTime1Start}
                                    width="95px"
                                />
                                <span className="time-separator">~</span>
                                <Input
                                    type="time"
                                    value={breakTime1End}
                                    onChange={setBreakTime1End}
                                    width="95px"
                                />
                            </div>
                        </div>
                        <div className="time-item break-time-item">
                            <span className="time-label">休憩時間2</span>
                            <div className="break-time-inputs">
                                <Input
                                    type="time"
                                    value={breakTime2Start}
                                    onChange={setBreakTime2Start}
                                    width="95px"
                                />
                                <span className="time-separator">~</span>
                                <Input
                                    type="time"
                                    value={breakTime2End}
                                    onChange={setBreakTime2End}
                                    width="95px"
                                />
                            </div>
                        </div>
                        <div className="time-item">
                            <span className="time-label">工数合計</span>
                            <span className="time-value">
                                {totalTime.hours}時{totalTime.minutes}分
                            </span>
                        </div>
                    </div>
                    <div className="work-time-info-divider"></div>
                    <div className="work-time-info-right">
                        <div className="select-group">
                            <Select
                                options={gapTimeOptions}
                                value={gapTimeInsert}
                                onChange={setGapTimeInsert}
                                placeholder="隙間時間挿入"
                            />
                        </div>
                        <div className="select-group">
                            <Select
                                options={fixedTimeOptions}
                                value={fixedTimeInsert}
                                onChange={handleFixedTimeInsertChange}
                                placeholder="固定時間挿入"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>
                <div className="work-time-info-footer-buttons">
                    {onOpenUserList && (
                        <Button
                            label={t("footer.userListSetting")}
                            color="secondary"
                            icon={<FaUser />}
                            onClick={onOpenUserList}
                            className="work-time-info-footer-button"
                        />
                    )}
                    {onOpenFavoriteTask && (
                        <Button
                            label={t("footer.favoriteTaskSetting")}
                            color="secondary"
                            icon={<FaStar />}
                            onClick={onOpenFavoriteTask}
                            className="work-time-info-footer-button"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
