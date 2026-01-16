/**
 * モデル駆動型アプリ（Dataverse）の Web リソース上で、
 * Xrm オブジェクトを安全に取得するユーティリティ関数。
 * 
 * Xrm は通常「親フレーム（parent）」または「現在のウィンドウ」
 * に存在するため、両方をチェックして返します。
 * 
 * 【使用例】
 * const xrm = getXrm();
 * if (xrm) {
 *   const userId = xrm.Utility.getGlobalContext().userSettings.userId;
 * }
 * 
 * 【戻り値】
 * - Xrm オブジェクト（取得成功時）
 * - null（取得できなかった場合）
 */
export const getXrm = (): any | null => {
    try {
        // ブラウザ環境でのみ動作させる（SSR防止）
        if (typeof window !== "undefined") {
            const win = window as any;

            // モデル駆動型アプリ内でWebリソースがiframeに埋め込まれている場合
            // 通常は親フレームに Xrm が存在する
            if (win.parent?.Xrm) return win.parent.Xrm;

            // ローカル動作や一部特殊ケースでは、現在のウィンドウに直接存在することもある
            if (win.Xrm) return win.Xrm;
        }

        // Xrmが存在しない場合（例：ローカル開発環境）
        // return null にしてアプリ側でフォールバック処理を行う
        // console.warn("Xrm 環境が見つかりません（ローカル開発モード）。");
        return null;
    } catch (err) {
        // 万が一、window参照でエラーが発生した場合にも安全に処理を終了
        console.error("Xrm 取得中にエラーが発生しました。：", err);
        return null;
    }
};

/**
 * サブグリッドで表示されているかどうかを判定する関数
 * 
 * サブグリッドで表示される場合、Xrm.Page.data.entity が存在し、
 * エンティティ名が "proto_workorder" であることを確認します。
 * 
 * 【戻り値】
 * - true: サブグリッドで表示されている場合
 * - false: 通常のWEBリソースとして表示されている場合、またはXrmが取得できない場合
 */
export const isSubgridContext = (): boolean => {
    try {
        const xrm = getXrm();
        if (!xrm || !xrm.Page || !xrm.Page.data || !xrm.Page.data.entity) {
            return false;
        }

        const entityName = xrm.Page.data.entity.getEntityName();
        return entityName === "proto_workorder";
    } catch (err) {
        console.error("サブグリッド判定中にエラーが発生しました。：", err);
        return false;
    }
};

/**
 * サブグリッドで表示されている場合、親レコード（proto_workorder）のIDを取得する関数
 * 
 * 【戻り値】
 * - 親レコードID（取得成功時、GUID形式）
 * - null（サブグリッドでない場合、または取得できなかった場合）
 */
export const getParentWorkOrderId = (): string | null => {
    try {
        if (!isSubgridContext()) {
            return null;
        }

        const xrm = getXrm();
        if (!xrm || !xrm.Page || !xrm.Page.data || !xrm.Page.data.entity) {
            return null;
        }

        const recordId = xrm.Page.data.entity.getId();
        // GUID形式のIDから波括弧を除去
        return recordId.replace(/[{}]/g, "") || null;
    } catch (err) {
        console.error("親レコードID取得中にエラーが発生しました。：", err);
        return null;
    }
};
