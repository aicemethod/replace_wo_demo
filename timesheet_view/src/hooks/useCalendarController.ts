import type { Dispatch, SetStateAction } from "react";

/**
 * カレンダーの日付操作ロジックを管理するカスタムフック
 * - 表示モードに応じた日数単位で前後に移動
 * - 今日の日付にリセット
 */
export const useCalendarController = (
    viewMode: "稼働日" | "週",
    setCurrentDate: Dispatch<SetStateAction<Date>>
): {
    handlePrev: () => void;
    handleNext: () => void;
    handleToday: () => void;
} => {
    /** 表示モードに応じて日数を返す */
    const getShiftDays = (): number => {
        switch (viewMode) {
            case "稼働日":
                return 5;
            default:
                return 7;
        }
    };

    /** 前の期間へ移動 */
    const handlePrev = (): void => {
        const shift = getShiftDays();
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() - shift);
            return newDate;
        });
    };

    /** 次の期間へ移動 */
    const handleNext = (): void => {
        const shift = getShiftDays();
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + shift);
            return newDate;
        });
    };

    /** 今日に戻る */
    const handleToday = (): void => {
        setCurrentDate(new Date());
    };

    return { handlePrev, handleNext, handleToday };
};
