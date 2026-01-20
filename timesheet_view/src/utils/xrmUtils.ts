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

/**
 * 現在開いているフォーム（proto_workorder）のフィールド値を取得する関数
 * 
 * 【戻り値】
 * - フォームのフィールド値（取得成功時）
 * - null（フォームが開いていない場合、または取得できなかった場合）
 */
export const getWorkOrderFormValues = (): {
    endUser?: { id: string; name: string } | null;
    deviceSn?: { id: string; name: string } | null;
    payment?: number | null;
    mainCategory?: number | null;
    subcategory?: { id: string; name: string } | null;
} | null => {
    try {
        const xrm = getXrm();
        if (!xrm || !xrm.Page) {
            return null;
        }

        const page = xrm.Page;

        // UCI / レガシー両対応の安全な getAttribute ラッパー
        const getAttr = (name: string) => {
            try {
                if (typeof page.getAttribute === "function") {
                    return page.getAttribute(name);
                }
                if (page.data && page.data.entity && typeof page.data.entity.getAttribute === "function") {
                    return page.data.entity.getAttribute(name);
                }
            } catch {
                // 取得失敗時は null 扱い
            }
            return null;
        };

        // エンティティ名を取得（data.entity がある場合のみ）
        const entityName =
            page.data && page.data.entity && typeof page.data.entity.getEntityName === "function"
                ? page.data.entity.getEntityName()
                : null;
        if (entityName !== "proto_workorder") {
            return null;
        }

        const result: any = {};

        // proto_enduser (Lookup)
        const endUserAttr = getAttr("proto_enduser");
        if (endUserAttr) {
            const endUserValue = endUserAttr.getValue();
            if (endUserValue && endUserValue.length > 0) {
                const value = Array.isArray(endUserValue) ? endUserValue[0] : endUserValue;
                result.endUser = {
                    id: value.id?.replace(/[{}]/g, "") || "",
                    name: value.name || "",
                };
            }
        }

        // 装置S/N（Lookup）: エンティティ proto_nonyudevice
        const deviceSnAttr = getAttr("proto_nonyudevice");
        if (deviceSnAttr) {
            const deviceSnValue = deviceSnAttr.getValue();
            if (deviceSnValue && deviceSnValue.length > 0) {
                const value = Array.isArray(deviceSnValue) ? deviceSnValue[0] : deviceSnValue;
                result.deviceSn = {
                    id: value.id?.replace(/[{}]/g, "") || "",
                    name: value.name || "",
                };
            }
        }

        // proto_payment (OptionSet)
        const paymentAttr = getAttr("proto_payment");
        if (paymentAttr) {
            const paymentValue = paymentAttr.getValue();
            if (paymentValue !== null && paymentValue !== undefined) {
                result.payment = paymentValue;
            }
        }

        // proto_maincategory (OptionSet)
        const mainCategoryAttr = getAttr("proto_maincategory");
        if (mainCategoryAttr) {
            const mainCategoryValue = mainCategoryAttr.getValue();
            if (mainCategoryValue !== null && mainCategoryValue !== undefined) {
                result.mainCategory = mainCategoryValue;
            }
        }

        // proto_subcategory (Lookup)
        const subcategoryAttr = getAttr("proto_subcategory");
        if (subcategoryAttr) {
            const subcategoryValue = subcategoryAttr.getValue();
            if (subcategoryValue && subcategoryValue.length > 0) {
                const value = Array.isArray(subcategoryValue) ? subcategoryValue[0] : subcategoryValue;
                result.subcategory = {
                    id: value.id?.replace(/[{}]/g, "") || "",
                    name: value.name || "",
                };
            }
        }

        return result;
    } catch (err) {
        console.error("フォーム値取得中にエラーが発生しました。：", err);
        return null;
    }
};

/**
 * 現在開いているフォーム（proto_workorder）の proto_workorderid と指定フィールドを取得してログ出力する関数
 */
export const logWorkOrderFormFields = (): void => {
    try {
        const xrm = getXrm();
        if (!xrm || !xrm.Page) {
            console.log("Xrm または Page が取得できませんでした");
            return;
        }

        const page = xrm.Page;

        // エンティティ名を取得
        const entityName =
            page.data && page.data.entity && typeof page.data.entity.getEntityName === "function"
                ? page.data.entity.getEntityName()
                : null;
        if (entityName !== "proto_workorder") {
            console.log("proto_workorder フォームが開かれていません");
            return;
        }

        // proto_workorderid を取得
        let workOrderId: string | null = null;
        try {
            if (page.data && page.data.entity && typeof page.data.entity.getId === "function") {
                const id = page.data.entity.getId();
                workOrderId = id ? id.replace(/[{}]/g, "") : null;
            }
        } catch (err) {
            console.error("proto_workorderid 取得エラー：", err);
        }

        // UCI / レガシー両対応の安全な getAttribute ラッパー
        const getAttr = (name: string) => {
            try {
                if (typeof page.getAttribute === "function") {
                    return page.getAttribute(name);
                }
                if (page.data && page.data.entity && typeof page.data.entity.getAttribute === "function") {
                    return page.data.entity.getAttribute(name);
                }
            } catch {
                // 取得失敗時は null 扱い
            }
            return null;
        };

        // 各フィールドを取得
        const result: any = {
            proto_workorderid: workOrderId,
        };

        // proto_enduser (Lookup)
        const endUserAttr = getAttr("proto_enduser");
        if (endUserAttr) {
            const endUserValue = endUserAttr.getValue();
            if (endUserValue && endUserValue.length > 0) {
                const value = Array.isArray(endUserValue) ? endUserValue[0] : endUserValue;
                result.proto_enduser = {
                    id: value.id?.replace(/[{}]/g, "") || "",
                    name: value.name || "",
                };
            }
        }

        // proto_devicesearch (Lookup)
        const deviceSearchAttr = getAttr("proto_devicesearch");
        if (deviceSearchAttr) {
            const deviceSearchValue = deviceSearchAttr.getValue();
            if (deviceSearchValue && deviceSearchValue.length > 0) {
                const value = Array.isArray(deviceSearchValue) ? deviceSearchValue[0] : deviceSearchValue;
                result.proto_devicesearch = {
                    id: value.id?.replace(/[{}]/g, "") || "",
                    name: value.name || "",
                };
            }
        }

        // proto_paymenttype (OptionSet)
        const paymentTypeAttr = getAttr("proto_paymenttype");
        if (paymentTypeAttr) {
            const paymentTypeValue = paymentTypeAttr.getValue();
            if (paymentTypeValue !== null && paymentTypeValue !== undefined) {
                result.proto_paymenttype = paymentTypeValue;
            }
        }

        // proto_maincategory (OptionSet)
        const mainCategoryAttr = getAttr("proto_maincategory");
        if (mainCategoryAttr) {
            const mainCategoryValue = mainCategoryAttr.getValue();
            if (mainCategoryValue !== null && mainCategoryValue !== undefined) {
                result.proto_maincategory = mainCategoryValue;
            }
        }

        // proto_subcategory (Lookup)
        const subcategoryAttr = getAttr("proto_subcategory");
        if (subcategoryAttr) {
            const subcategoryValue = subcategoryAttr.getValue();
            if (subcategoryValue && subcategoryValue.length > 0) {
                const value = Array.isArray(subcategoryValue) ? subcategoryValue[0] : subcategoryValue;
                result.proto_subcategory = {
                    id: value.id?.replace(/[{}]/g, "") || "",
                    name: value.name || "",
                };
            }
        }

        // ログ出力
        console.log("=== proto_workorder フォームフィールド値 ===");
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("フォームフィールド取得・ログ出力中にエラーが発生しました。：", err);
    }
};
