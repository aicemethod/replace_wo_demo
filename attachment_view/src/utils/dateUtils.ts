/**
 * Dataverse UTC → JST 補正関数
 * Dataverse の日付は UTC で保存されているため、
 * 画面表示や比較処理時に JST（日本時間）に変換します。
 *
 * @param datetimeString Dataverse から取得した UTC 形式の日時文字列
 * @returns JST に変換された ISO8601 文字列（例: "2025-10-14T09:00:00.000Z"）
 *
 * 使用例:
 *   fromUtcToJst("2025-10-14T00:00:00Z") → "2025-10-14T09:00:00.000Z"
 */
export const fromUtcToJst = (datetimeString: string): string => {
    if (!datetimeString) return "";
    const date = new Date(datetimeString);

    // ✅ UTC → JST補正（UTC-9h → JST）
    const corrected = new Date(date.getTime() - 9 * 60 * 60 * 1000);

    return corrected.toISOString();
};

/**
 * JST → UTC 変換関数（逆方向）
 * Dataverse 登録時に UTC 形式で送信するための補助関数。
 *
 * @param jstString JST の ISO 形式日時文字列
 * @returns UTC に変換された ISO 文字列
 *
 * 使用例:
 *   fromJstToUtc("2025-10-14T09:00:00") → "2025-10-14T00:00:00.000Z"
 */
export const fromJstToUtc = (jstString: string): string => {
    if (!jstString) return "";
    const date = new Date(jstString);

    // ✅ JST → UTC補正 (+9h)
    const corrected = new Date(date.getTime() + 9 * 60 * 60 * 1000);

    return corrected.toISOString();
};
