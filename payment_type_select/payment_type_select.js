const PAYMENT_TYPE_TREE = {
    1: {
        931440000: { 931440000: null, 931440001: null },
        931440001: { 931440002: { 931440000: null, 931440001: null }, 931440003: null },
        931440002: { 931440004: { 931440001: { 931440000: null, 931440001: null }, 931440002: { 931440001: null } } }
    },
    2: {
        931440002: {
            931440005: { 931440000: null, 931440001: null },
            931440004: {
                931440000: { 931440000: null, 931440001: null },
                931440001: { 931440000: null, 931440001: null },
                931440002: { 931440000: null, 931440001: null },
                931440003: { 931440000: null, 931440001: null }
            }
        }
    },
    3: {
        931440001: { 931440002: { 931440000: null, 931440001: null }, 931440003: null },
        931440002: {
            931440004: {
                931440000: { 931440000: null, 931440001: null },
                931440001: { 931440000: null, 931440001: null },
                931440002: { 931440000: null, 931440001: null },
                931440003: { 931440000: null, 931440001: null }
            }
        }
    },
    4: {
        931440000: { 931440001: null },
        931440001: { 931440002: { 931440000: null, 931440001: null }, 931440003: null },
        931440002: {
            931440006: null,
            931440007: null,
            931440004: {
                931440000: { 931440000: null, 931440001: null },
                931440001: { 931440000: null, 931440001: null },
                931440002: { 931440000: null, 931440001: null },
                931440003: { 931440000: null, 931440001: null }
            }
        }
    },
    5: {
        931440000: { 931440001: null },
        931440001: { 931440002: { 931440000: null, 931440001: null }, 931440003: null },
        931440002: {
            931440006: null,
            931440004: {
                931440000: { 931440000: null, 931440001: null },
                931440001: { 931440000: null, 931440001: null },
                931440002: { 931440000: null, 931440001: null },
                931440003: { 931440000: null, 931440001: null }
            }
        }
    },
    6: {
        931440000: { 931440001: null },
        931440001: { 931440002: { 931440000: null, 931440001: null }, 931440003: null },
        931440002: {
            931440004: {
                931440000: { 931440000: null, 931440001: null },
                931440001: { 931440000: null, 931440001: null },
                931440002: { 931440000: null, 931440001: null },
                931440003: { 931440000: null, 931440001: null }
            }
        }
    },
    7: {
        931440001: { 931440002: { 931440000: null, 931440001: null }, 931440003: null },
        931440002: {
            931440008: { 931440000: null, 931440001: null },
            931440004: { 931440003: { 931440000: null } }
        }
    }
};

const PAYMENT_TARGET_FIELDS = [
    "proto_billabletype",
    "proto_payment_tobe",
    "proto_paymentto_tobe",
    "proto_concession_tobe"
];

const CONDITIONAL_VISIBLE_FIELDS = [
    "proto_primaryso",
    "proto_wo_soassociation",
    "proto_tel_wo_sow",
    "proto_tel_wo_concession_reason",
    "proto_cnt_contractsummary",
    "proto_tel_wo_retrofitfcnno",
    "proto_tel_wo_continuouswork",
    "proto_wo_installation"
];

const WO_TYPE_VISIBLE_TAB_NAME = "tab_14";

// パターン判定用に文字列を正規化する。
function normalizeText(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

// WO種別の文字列からパターン番号を判定する。
function detectPatternFromWoType(woTypeText) {
    const text = normalizeText(woTypeText);

    if (text.includes("startup") || text.includes("新規・中古機再販")) return 1;
    if (text.includes("fcn/si")) return 2;
    if (text.includes("troubleshooting")) return 4;
    if (
        text.includes("modification")
        || text.includes("relocation")
        || text.includes("decommission")
        || text.includes("re-installation")
        || text === "oh"
        || text === "pm"
        || text.includes("装置の立ち下げ作業")
        || text.includes("装置の再立ち上げ作業")
        || text.includes("repair")
    ) return 3;
    if (text.includes("process / application") || text.includes("consulting / analysis")) return 5;
    if (text.includes("software installation")) return 6;
    if (text.includes("customer training")) return 7;

    return null;
}

// ツリーノードから選択可能な子キー一覧を返す。
function getChildKeys(node) {
    if (!node || typeof node !== "object") return [];
    return Object.keys(node);
}

// 選択値に対応する子ノードを返す。
function getNodeByValue(node, selectedValue) {
    if (!node || selectedValue == null) return null;
    return node[String(selectedValue)] ?? null;
}

// フォーム項目の値を取得する。
function getAttributeValue(formContext, fieldName) {
    return formContext.getAttribute(fieldName)?.getValue();
}

// Lookup または選択肢項目のラベルを取得する。
function getAttributeLabel(formContext, fieldName) {
    const attr = formContext.getAttribute(fieldName);
    if (!attr) return "";

    const value = attr.getValue();
    if (Array.isArray(value) && value[0] && value[0].name) {
        return String(value[0].name);
    }

    if (typeof attr.getText === "function") {
        return String(attr.getText() || "");
    }

    return "";
}

// 単一コントロールの表示/非表示を安全に切り替える。
function setFieldVisible(formContext, fieldName, visible) {
    const control = formContext.getControl(fieldName);
    if (control) control.setVisible(!!visible);
}

// 複数コントロールを表示する。
function showFields(formContext, fieldNames) {
    fieldNames.forEach(function (fieldName) {
        setFieldVisible(formContext, fieldName, true);
    });
}

// 条件判定前に対象項目をすべて非表示に戻す。
function resetConditionalVisibility(formContext) {
    CONDITIONAL_VISIBLE_FIELDS.forEach(function (fieldName) {
        setFieldVisible(formContext, fieldName, false);
    });
}

// 表示判定で使う値をまとめた状態オブジェクトを作る。
function getVisibilityState(formContext) {
    return {
        region: getAttributeLabel(formContext, "proto_region").toUpperCase(),
        paymentToBe: Number(getAttributeValue(formContext, "proto_payment_tobe")),
        paymentToToBe: Number(getAttributeValue(formContext, "proto_paymentto_tobe")),
        concessionToBe: Number(getAttributeValue(formContext, "proto_concession_tobe"))
    };
}

// proto_payment_tobe = 931440003 の共通表示を行う。
function showCommonPaymentToBe003Fields(formContext, region) {
    showFields(formContext, ["proto_tel_wo_sow", "proto_cnt_contractsummary"]);

    if (region === "EU") {
        showFields(formContext, ["proto_wo_installation", "proto_wo_soassociation"]);
    }
}

// proto_paymentto_tobe = 931440002 のとき値引き理由を表示する。
function showConcessionReasonIfNeeded(formContext, paymentToToBe) {
    if (paymentToToBe === 931440002) {
        setFieldVisible(formContext, "proto_tel_wo_concession_reason", true);
    }
}

// パターン1の表示ルールを適用する。
function applyPattern1Visibility(formContext, state) {
    if ((state.region === "JP" || state.region === "US") && [931440000, 931440001, 931440002].includes(state.paymentToBe)) {
        setFieldVisible(formContext, "proto_primaryso", true);
    }

    if (state.region === "EU" && [931440000, 931440002, 931440003].includes(state.paymentToBe)) {
        setFieldVisible(formContext, "proto_wo_soassociation", true);
    }

    if (state.paymentToBe === 931440003) {
        showFields(formContext, ["proto_tel_wo_sow", "proto_cnt_contractsummary"]);
    }

    showConcessionReasonIfNeeded(formContext, state.paymentToToBe);
}

// パターン2の表示ルールを適用する。
function applyPattern2Visibility(formContext, state) {
    showFields(formContext, ["proto_tel_wo_retrofitfcnno", "proto_tel_wo_continuouswork"]);
    showConcessionReasonIfNeeded(formContext, state.paymentToToBe);

    if (state.region === "EU" && state.paymentToToBe === 931440003 && state.concessionToBe === 931440000) {
        setFieldVisible(formContext, "proto_wo_installation", true);
    }
}

// パターン3の表示ルールを適用する。
function applyPattern3Visibility(formContext, state) {
    if (state.paymentToBe === 931440002 && state.region === "EU") {
        showFields(formContext, ["proto_wo_installation", "proto_wo_soassociation"]);
    }

    if (state.paymentToBe === 931440003) {
        showCommonPaymentToBe003Fields(formContext, state.region);
    }

    showConcessionReasonIfNeeded(formContext, state.paymentToToBe);

    if (state.paymentToToBe === 931440003 && state.concessionToBe === 931440000) {
        setFieldVisible(formContext, "proto_wo_installation", true);
    }
}

// パターン4/5の表示ルールを適用する。
function applyPattern4And5Visibility(formContext, state, pattern) {
    if (state.paymentToBe === 931440002 && state.region === "EU") {
        setFieldVisible(formContext, "proto_wo_soassociation", true);
    }

    if (state.paymentToBe === 931440003) {
        showCommonPaymentToBe003Fields(formContext, state.region);
    }

    if (pattern === 4 && state.paymentToBe === 931440007 && state.region === "EU") {
        setFieldVisible(formContext, "proto_wo_installation", true);
    }

    showConcessionReasonIfNeeded(formContext, state.paymentToToBe);

    if (state.paymentToToBe === 931440003 && state.concessionToBe === 931440000 && state.region === "EU") {
        setFieldVisible(formContext, "proto_wo_installation", true);
    }
}

// パターン6の表示ルールを適用する。
function applyPattern6Visibility(formContext, state) {
    if (state.paymentToBe === 931440002 && state.region === "EU") {
        showFields(formContext, ["proto_wo_soassociation", "proto_wo_installation"]);
    }

    if (state.paymentToBe === 931440003) {
        showCommonPaymentToBe003Fields(formContext, state.region);
    }

    showConcessionReasonIfNeeded(formContext, state.paymentToToBe);

    if (state.paymentToToBe === 931440003 && state.concessionToBe === 931440000 && state.region === "EU") {
        setFieldVisible(formContext, "proto_wo_installation", true);
    }
}

// パターン7の表示ルールを適用する。
function applyPattern7Visibility(formContext, state) {
    if (state.paymentToBe === 931440002 && state.region === "EU") {
        setFieldVisible(formContext, "proto_wo_soassociation", true);
    }

    if (state.paymentToBe === 931440003) {
        showCommonPaymentToBe003Fields(formContext, state.region);
    }

    if (state.paymentToBe === 931440004 && state.region === "EU") {
        setFieldVisible(formContext, "proto_wo_installation", true);
    }
}

// 選択されたパターンの表示ルールを適用する。
function applyConditionalVisibility(formContext, pattern) {
    resetConditionalVisibility(formContext);

    const state = getVisibilityState(formContext);

    if (pattern === 1) {
        applyPattern1Visibility(formContext, state);
        return;
    }

    if (pattern === 2) {
        applyPattern2Visibility(formContext, state);
        return;
    }

    if (pattern === 3) {
        applyPattern3Visibility(formContext, state);
        return;
    }

    if (pattern === 4 || pattern === 5) {
        applyPattern4And5Visibility(formContext, state, pattern);
        return;
    }

    if (pattern === 6) {
        applyPattern6Visibility(formContext, state);
        return;
    }

    if (pattern === 7) {
        applyPattern7Visibility(formContext, state);
    }
}

// 選択肢を絞り込み、不正な選択値をクリアする。
function applyFilterByValues(formContext, fieldName, allowedValues) {
    const control = formContext.getControl(fieldName);
    const attr = formContext.getAttribute(fieldName);
    if (!control || !attr) return;

    const source = attr.getOptions ? attr.getOptions() : control.getOptions();
    const allowAll = !Array.isArray(allowedValues);
    const allowedSet = new Set((allowedValues || []).map(function (value) { return Number(value); }));
    const options = allowAll
        ? source
        : source.filter(function (opt) { return allowedSet.has(Number(opt.value)); });

    control.clearOptions();
    options.forEach(function (opt) {
        control.addOption(opt);
    });
    control.setDisabled(options.length === 0);

    const current = attr.getValue();
    const hasCurrent = options.some(function (opt) {
        return Number(opt.value) === Number(current);
    });

    if (current != null && !hasCurrent) {
        attr.setValue(null);
    }
}

// 選択肢適用前は支払関連コントロールを無効化する。
function disablePaymentFields(formContext) {
    PAYMENT_TARGET_FIELDS.forEach(function (fieldName) {
        const control = formContext.getControl(fieldName);
        if (control) control.setDisabled(true);
    });
}

// WO種別からパターン情報とツリーを取得する。
function getPaymentPatternInfo(formContext) {
    const woTypeText = formContext.getAttribute("proto_wotype")?.getValue()?.[0]?.name || "";
    const pattern = detectPatternFromWoType(woTypeText);
    return {
        pattern: pattern,
        tree: pattern ? PAYMENT_TYPE_TREE[pattern] : null
    };
}

// 支払ツリーに基づいて選択肢の絞り込みを順に適用する。
function applyPaymentTreeFilters(formContext, tree) {
    applyFilterByValues(formContext, "proto_billabletype", tree ? getChildKeys(tree) : []);

    const billableValue = getAttributeValue(formContext, "proto_billabletype");
    const paymentTypeNode = getNodeByValue(tree, billableValue);
    applyFilterByValues(formContext, "proto_payment_tobe", getChildKeys(paymentTypeNode));

    const paymentTypeValue = getAttributeValue(formContext, "proto_payment_tobe");
    const paymentToNode = getNodeByValue(paymentTypeNode, paymentTypeValue);
    applyFilterByValues(formContext, "proto_paymentto_tobe", getChildKeys(paymentToNode));

    const paymentToValue = getAttributeValue(formContext, "proto_paymentto_tobe");
    const concessionNode = getNodeByValue(paymentToNode, paymentToValue);
    applyFilterByValues(formContext, "proto_concession_tobe", getChildKeys(concessionNode));
}

// Retrofit FCN番号の入力有無で FCN/SI ID の表示を切り替える。
function onChangeRetrofitFcnNo(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;

    const value = getAttributeValue(formContext, "proto_tel_wo_retrofitfcnno");
    const hasValue = Array.isArray(value) ? value.length > 0 : String(value || "").trim() !== "";
    setFieldVisible(formContext, "proto_wo_fcnsiid", hasValue);
}

// フォーム読込時に支払選択肢と表示状態を初期化する。
function onLoadPaymentType(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;

    disablePaymentFields(formContext);

    const info = getPaymentPatternInfo(formContext);
    applyFilterByValues(formContext, "proto_billabletype", info.tree ? getChildKeys(info.tree) : []);
    applyConditionalVisibility(formContext, info.pattern);
    toggleTabByWoType(context, WO_TYPE_VISIBLE_TAB_NAME);
}

// 値変更時に支払選択肢と表示状態を再計算する。
function onChangePaymentType(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;

    const info = getPaymentPatternInfo(formContext);
    applyPaymentTreeFilters(formContext, info.tree);
    applyConditionalVisibility(formContext, info.pattern);
    toggleTabByWoType(context, WO_TYPE_VISIBLE_TAB_NAME);
}

// WO種別に応じて指定タブの表示/非表示を切り替える。
function toggleTabByWoType(context) {
    const formContext = context?.getFormContext?.();
    const tabName = "tab_14";
    if (!formContext || !tabName) return;

    const woTypeText = getAttributeValue(formContext, "proto_wotype")?.[0]?.name || "";
    const text = normalizeText(woTypeText);
    const shouldShow = text.includes("modification") || text.includes("software installation");
    const modificationEquipmentTab = formContext.ui.tabs.get(tabName);

    if (modificationEquipmentTab) modificationEquipmentTab.setVisible(shouldShow);
}

// フォームイベントで使っている既存エイリアスを維持する。
function filterPaymentType(context) {
    onChangePaymentType(context);
}
