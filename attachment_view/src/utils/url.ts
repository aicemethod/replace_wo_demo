/**
 * URL のクエリパラメータをオブジェクト形式で取得するユーティリティ関数
 * 
 * 例：
 *   URL: https://example.com/?RecordId=123&Mode=edit
 *   戻り値: { recordid: "123", mode: "edit" }
 */
export const getUrlParams = (): Record<string, string> => {
    const searchParams = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};

    // すべてのパラメータを小文字キーで格納
    searchParams.forEach((value, key) => {
        result[key.toLowerCase()] = value;
    });

    return result;
};
