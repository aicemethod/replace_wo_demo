/**
 * 日付フォーマット関連のユーティリティ
 * UI表示用の日付フォーマット処理を集約
 */

/**
 * 今日の日付を日本語形式でフォーマット
 * @returns フォーマットされた日付文字列（例：2025/10/14）
 */
export const formatToday = (): string => {
    return new Date().toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

/**
 * 日付範囲から新規タイムエントリ用のデフォルト時間を生成
 * @returns デフォルトの開始・終了時間
 */
export const createDefaultTimeRange = (): { start: Date; end: Date } => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1時間後
    return { start, end };
};
