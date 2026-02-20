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
    "proto_paymenttype_tobe",
    "proto_paymentto_tobe",
    "proto_concessiontype_tobe"
];

let paymentOptionCache = null;

function normalizeText(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function detectPatternFromWoType(woTypeText) {
    const text = normalizeText(woTypeText);

    if (text.includes("startup") || text.includes("新規・中古機再販")) return 1;
    if (text.includes("fcn/si")) return 2;
    if (
        text.includes("modification")
        || text.includes("relocation")
        || text.includes("decommission")
        || text.includes("re-installation")
        || text === "oh"
        || text === "pm"
        || text.includes("装置の立ち下げ作業")
        || text.includes("装置の再立ち上げ作業")
    ) return 3;
    if (text.includes("troubleshooting") || text === "repair") return 4;
    if (text.includes("process / application") || text.includes("consulting / analysis")) return 5;
    if (text.includes("software installation")) return 6;
    if (text.includes("customer training")) return 7;

    return null;
}

function getChildKeys(node) {
    if (!node || typeof node !== "object") return [];
    return Object.keys(node);
}

function getNodeByValue(node, selectedValue) {
    if (!node || selectedValue == null) return null;
    return node[String(selectedValue)] ?? null;
}

function initOptionCache(formContext) {
    if (paymentOptionCache) return;
    paymentOptionCache = {};
    PAYMENT_TARGET_FIELDS.forEach(function (name) {
        const control = formContext.getControl(name);
        if (!control) return;
        paymentOptionCache[name] = control.getOptions().map(function (opt) {
            return { value: opt.value, text: opt.text };
        });
    });
}

function getAttributeValue(context, fieldName) {
    return context.getFormContext().getAttribute(fieldName)?.getValue();
}

function applyFilter(formContext, fieldName, allowedTexts) {
    const control = formContext.getControl(fieldName);
    const attr = formContext.getAttribute(fieldName);
    const source = paymentOptionCache?.[fieldName] || [];
    if (!control || !attr) return;

    const allowAll = !Array.isArray(allowedTexts);
    const allowedSet = new Set((allowedTexts || []).map(function (v) { return normalizeText(v); }));
    const options = allowAll
        ? source
        : source.filter(function (opt) { return allowedSet.has(normalizeText(opt.text)); });

    control.clearOptions();
    options.forEach(function (opt) { control.addOption(opt); });
    control.setDisabled(options.length === 0);

    const current = attr.getValue();
    if (current != null && !options.some(function (opt) { return Number(opt.value) === Number(current); })) {
        attr.setValue(null);
    }
}

function applyFilterByValues(formContext, fieldName, allowedValues) {
    const control = formContext.getControl(fieldName);
    const attr = formContext.getAttribute(fieldName);
    const source = paymentOptionCache?.[fieldName] || [];
    if (!control || !attr) return;

    const allowAll = !Array.isArray(allowedValues);
    const allowedSet = new Set((allowedValues || []).map(function (v) { return Number(v); }));
    const options = allowAll
        ? source
        : source.filter(function (opt) { return allowedSet.has(Number(opt.value)); });

    control.clearOptions();
    options.forEach(function (opt) { control.addOption(opt); });
    control.setDisabled(options.length === 0);

    const current = attr.getValue();
    if (current != null && !options.some(function (opt) { return Number(opt.value) === Number(current); })) {
        attr.setValue(null);
    }
}

function filterPaymentType(context) {
    // formContextの有無を判定
    if (!formContext) return;

    initOptionCache(formContext);

    const woTypeText = formContext.getAttribute("proto_wotype")?.getValue()?.[0]?.name || "";
    const pattern = detectPatternFromWoType(woTypeText);
    const tree = pattern ? PAYMENT_TYPE_TREE[pattern] : null;

    applyFilterByValues(formContext, "proto_billabletype", tree ? getChildKeys(tree) : undefined);

    const billableValue = getAttributeValue(context, "proto_billabletype");
    const paymentTypeNode = getNodeByValue(tree, billableValue);
    applyFilterByValues(formContext, "proto_paymenttype_tobe", getChildKeys(paymentTypeNode));

    const paymentTypeValue = getAttributeValue(context, "proto_paymenttype_tobe");
    const paymentToNode = getNodeByValue(paymentTypeNode, paymentTypeValue);
    applyFilterByValues(formContext, "proto_paymentto_tobe", getChildKeys(paymentToNode));

    const paymentToValue = getAttributeValue(context, "proto_paymentto_tobe");
    const concessionNode = getNodeByValue(paymentToNode, paymentToValue);
    applyFilterByValues(formContext, "proto_concessiontype_tobe", getChildKeys(concessionNode));
}
