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

function normalizeText(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

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

function getChildKeys(node) {
    if (!node || typeof node !== "object") return [];
    return Object.keys(node);
}

function getNodeByValue(node, selectedValue) {
    if (!node || selectedValue == null) return null;
    return node[String(selectedValue)] ?? null;
}

function getAttributeValue(context, fieldName) {
    return context.getFormContext().getAttribute(fieldName)?.getValue();
}

function getAttributeLabel(formContext, fieldName) {
    const attr = formContext.getAttribute(fieldName);
    if (!attr) return "";
    const value = attr.getValue();
    if (Array.isArray(value) && value[0]?.name) return String(value[0].name);
    if (typeof attr.getText === "function") return String(attr.getText() || "");
    return "";
}

function setFieldVisible(formContext, fieldName, visible) {
    const control = formContext.getControl(fieldName);
    if (control) control.setVisible(!!visible);
}

function onChangeRetrofitFcnNo(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;

    const value = formContext.getAttribute("proto_tel_wo_retrofitfcnno")?.getValue();
    const hasValue = Array.isArray(value) ? value.length > 0 : String(value || "").trim() !== "";
    setFieldVisible(formContext, "proto_wo_fcnsiid", hasValue);
}

function applyConditionalVisibility(formContext, pattern) {
    CONDITIONAL_VISIBLE_FIELDS.forEach(function (name) {
        setFieldVisible(formContext, name, false);
    });

    const region = getAttributeLabel(formContext, "proto_region").toUpperCase();
    const paymentToBe = Number(formContext.getAttribute("proto_payment_tobe")?.getValue());
    const paymentToToBe = Number(formContext.getAttribute("proto_paymentto_tobe")?.getValue());
    const concessionToBe = Number(formContext.getAttribute("proto_concession_tobe")?.getValue());

    if (pattern === 1) {
        if ((region === "JP" || region === "US") && [931440000, 931440001, 931440002].includes(paymentToBe)) {
            setFieldVisible(formContext, "proto_primaryso", true);
        }

        if (region === "EU" && [931440000, 931440002, 931440003].includes(paymentToBe)) {
            setFieldVisible(formContext, "proto_wo_soassociation", true);
        }

        if (paymentToBe === 931440003) {
            setFieldVisible(formContext, "proto_tel_wo_sow", true);
            setFieldVisible(formContext, "proto_cnt_contractsummary", true);
        }

        if (paymentToToBe === 931440002) {
            setFieldVisible(formContext, "proto_tel_wo_concession_reason", true);
        }
    }

    if (pattern === 2) {
        setFieldVisible(formContext, "proto_tel_wo_retrofitfcnno", true);
        setFieldVisible(formContext, "proto_tel_wo_continuouswork", true);

        if (paymentToToBe === 931440002) {
            setFieldVisible(formContext, "proto_tel_wo_concession_reason", true);
        }

        if (region === "EU" && paymentToToBe === 931440003 && concessionToBe === 931440000) {
            setFieldVisible(formContext, "proto_wo_installation", true);
        }
    }

    if (pattern === 3) {
        if (paymentToBe === 931440002 && region === "EU") {
            setFieldVisible(formContext, "proto_wo_installation", true);
            setFieldVisible(formContext, "proto_wo_soassociation", true);
        }

        if (paymentToBe === 931440003) {
            setFieldVisible(formContext, "proto_cnt_contractsummary", true);
            setFieldVisible(formContext, "proto_tel_wo_sow", true);

            if (region === "EU") {
                setFieldVisible(formContext, "proto_wo_installation", true);
                setFieldVisible(formContext, "proto_wo_soassociation", true);
            }
        }

        if (paymentToToBe === 931440002) {
            setFieldVisible(formContext, "proto_tel_wo_concession_reason", true);
        }

        if (paymentToToBe === 931440003 && concessionToBe === 931440000) {
            setFieldVisible(formContext, "proto_wo_installation", true);
        }
    }

    if (pattern === 4) {
        if (paymentToBe === 931440002 && region === "EU") {
            setFieldVisible(formContext, "proto_wo_soassociation", true);
        }

        if (paymentToBe === 931440003) {
            setFieldVisible(formContext, "proto_tel_wo_sow", true);
            setFieldVisible(formContext, "proto_cnt_contractsummary", true);

            if (region === "EU") {
                setFieldVisible(formContext, "proto_wo_installation", true);
                setFieldVisible(formContext, "proto_wo_soassociation", true);
            }
        }

        if (paymentToBe === 931440007 && region === "EU") {
            setFieldVisible(formContext, "proto_wo_installation", true);
        }

        if (paymentToToBe === 931440002) {
            setFieldVisible(formContext, "proto_tel_wo_concession_reason", true);
        }

        if (paymentToToBe === 931440003 && concessionToBe === 931440000 && region === "EU") {
            setFieldVisible(formContext, "proto_wo_installation", true);
        }
    }
}

function applyFilterByValues(formContext, fieldName, allowedValues) {
    const control = formContext.getControl(fieldName);
    const attr = formContext.getAttribute(fieldName);
    if (!control || !attr) return;
    const source = attr.getOptions ? attr.getOptions() : control.getOptions();

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

function disablePaymentFields(formContext) {
    PAYMENT_TARGET_FIELDS.forEach(function (name) {
        const control = formContext.getControl(name);
        if (control) control.setDisabled(true);
    });
}

function onLoadPaymentType(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;
    disablePaymentFields(formContext);

    const woTypeText = formContext.getAttribute("proto_wotype")?.getValue()?.[0]?.name || "";
    const pattern = detectPatternFromWoType(woTypeText);
    const tree = pattern ? PAYMENT_TYPE_TREE[pattern] : null;
    applyFilterByValues(formContext, "proto_billabletype", tree ? getChildKeys(tree) : []);
    applyConditionalVisibility(formContext, pattern);
}

function onChangePaymentType(context) {
    const formContext = context?.getFormContext?.();
    if (!formContext) return;

    const woTypeText = formContext.getAttribute("proto_wotype")?.getValue()?.[0]?.name || "";
    const pattern = detectPatternFromWoType(woTypeText);
    const tree = pattern ? PAYMENT_TYPE_TREE[pattern] : null;

    applyFilterByValues(formContext, "proto_billabletype", tree ? getChildKeys(tree) : []);

    const billableValue = getAttributeValue(context, "proto_billabletype");
    const paymentTypeNode = getNodeByValue(tree, billableValue);
    applyFilterByValues(formContext, "proto_payment_tobe", getChildKeys(paymentTypeNode));

    const paymentTypeValue = getAttributeValue(context, "proto_payment_tobe");
    const paymentToNode = getNodeByValue(paymentTypeNode, paymentTypeValue);
    applyFilterByValues(formContext, "proto_paymentto_tobe", getChildKeys(paymentToNode));

    const paymentToValue = getAttributeValue(context, "proto_paymentto_tobe");
    const concessionNode = getNodeByValue(paymentToNode, paymentToValue);
    applyFilterByValues(formContext, "proto_concession_tobe", getChildKeys(concessionNode));

    applyConditionalVisibility(formContext, pattern);
}

function filterPaymentType(context) {
    onChangePaymentType(context);
}
