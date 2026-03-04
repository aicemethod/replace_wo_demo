import type { Option } from "../types";

export const BILLABLE_TYPE = {
    STARTUP: 931440000,
    BILLABLE: 931440001,
    NON_BILLABLE: 931440002,
} as const;

export const PAYMENT_TYPE = {
    STARTUP: 931440000,
    PRE_WARRANTY: 931440001,
    PAID: 931440002,
    CONTRACT: 931440003,
    CONCESSION: 931440004,
    FCN_SI: 931440005,
    EQUIPMENT_WARRANTY: 931440006,
    MOD_WARRANTY: 931440007,
    CREDIT: 931440008,
} as const;

export const PAYMENT_TO = {
    DSS: 931440000,
    BU: 931440001,
    FACTORY: 931440002,
    GENPO: 931440003,
} as const;

export const CONCESSION_TYPE = {
    STRATEGIC: 931440000,
    NON_STRATEGIC: 931440001,
} as const;

export const BILLABLE_TYPE_OPTIONS: Option[] = [
    { value: String(BILLABLE_TYPE.STARTUP), label: "Startup" },
    { value: String(BILLABLE_TYPE.BILLABLE), label: "Billable" },
    { value: String(BILLABLE_TYPE.NON_BILLABLE), label: "Non-Billable" },
];

export const PAYMENT_TYPE_OPTIONS: Option[] = [
    { value: String(PAYMENT_TYPE.STARTUP), label: "Startup" },
    { value: String(PAYMENT_TYPE.PRE_WARRANTY), label: "Pre Warranty" },
    { value: String(PAYMENT_TYPE.PAID), label: "Paid" },
    { value: String(PAYMENT_TYPE.CONTRACT), label: "Contract" },
    { value: String(PAYMENT_TYPE.CONCESSION), label: "Concession" },
    { value: String(PAYMENT_TYPE.FCN_SI), label: "FCN/SI" },
    { value: String(PAYMENT_TYPE.EQUIPMENT_WARRANTY), label: "Equipment Warranty" },
    { value: String(PAYMENT_TYPE.MOD_WARRANTY), label: "Mod Warranty" },
    { value: String(PAYMENT_TYPE.CREDIT), label: "Credit" },
];

export const PAYMENT_TO_OPTIONS: Option[] = [
    { value: String(PAYMENT_TO.DSS), label: "DSS" },
    { value: String(PAYMENT_TO.BU), label: "BU" },
    { value: String(PAYMENT_TO.FACTORY), label: "Factory" },
    { value: String(PAYMENT_TO.GENPO), label: "Genpo" },
];

export const CONCESSION_TYPE_OPTIONS: Option[] = [
    { value: String(CONCESSION_TYPE.STRATEGIC), label: "Strategic" },
    { value: String(CONCESSION_TYPE.NON_STRATEGIC), label: "Non-Strategic" },
];

interface PaymentTreeMap {
    [key: string]: PaymentTreeMap | null;
}

type PaymentTreeNode = PaymentTreeMap | null;

export const PAYMENT_TYPE_TREE: Record<number, PaymentTreeNode> = {
    1: {
        [BILLABLE_TYPE.STARTUP]: {
            [PAYMENT_TYPE.STARTUP]: null,
            [PAYMENT_TYPE.PRE_WARRANTY]: null,
        },
        [BILLABLE_TYPE.BILLABLE]: {
            [PAYMENT_TYPE.PAID]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONTRACT]: null,
        },
        [BILLABLE_TYPE.NON_BILLABLE]: {
            [PAYMENT_TYPE.CONCESSION]: {
                [PAYMENT_TO.BU]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.FACTORY]: {
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
            },
        },
    },
    2: {
        [BILLABLE_TYPE.NON_BILLABLE]: {
            [PAYMENT_TYPE.FCN_SI]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONCESSION]: {
                [PAYMENT_TO.DSS]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.BU]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.FACTORY]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.GENPO]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
            },
        },
    },
    3: {
        [BILLABLE_TYPE.BILLABLE]: {
            [PAYMENT_TYPE.PAID]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONTRACT]: null,
        },
        [BILLABLE_TYPE.NON_BILLABLE]: {
            [PAYMENT_TYPE.CONCESSION]: {
                [PAYMENT_TO.DSS]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.BU]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.FACTORY]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.GENPO]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
            },
        },
    },
    4: {
        [BILLABLE_TYPE.STARTUP]: {
            [PAYMENT_TYPE.PRE_WARRANTY]: null,
        },
        [BILLABLE_TYPE.BILLABLE]: {
            [PAYMENT_TYPE.PAID]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONTRACT]: null,
        },
        [BILLABLE_TYPE.NON_BILLABLE]: {
            [PAYMENT_TYPE.EQUIPMENT_WARRANTY]: null,
            [PAYMENT_TYPE.MOD_WARRANTY]: null,
            [PAYMENT_TYPE.CONCESSION]: {
                [PAYMENT_TO.DSS]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.BU]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.FACTORY]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.GENPO]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
            },
        },
    },
    5: {
        [BILLABLE_TYPE.STARTUP]: {
            [PAYMENT_TYPE.PRE_WARRANTY]: null,
        },
        [BILLABLE_TYPE.BILLABLE]: {
            [PAYMENT_TYPE.PAID]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONTRACT]: null,
        },
        [BILLABLE_TYPE.NON_BILLABLE]: {
            [PAYMENT_TYPE.EQUIPMENT_WARRANTY]: null,
            [PAYMENT_TYPE.CONCESSION]: {
                [PAYMENT_TO.DSS]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.BU]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.FACTORY]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.GENPO]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
            },
        },
    },
    6: {
        [BILLABLE_TYPE.STARTUP]: {
            [PAYMENT_TYPE.PRE_WARRANTY]: null,
        },
        [BILLABLE_TYPE.BILLABLE]: {
            [PAYMENT_TYPE.PAID]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONTRACT]: null,
        },
        [BILLABLE_TYPE.NON_BILLABLE]: {
            [PAYMENT_TYPE.CONCESSION]: {
                [PAYMENT_TO.DSS]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.BU]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.FACTORY]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
                [PAYMENT_TO.GENPO]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                    [CONCESSION_TYPE.NON_STRATEGIC]: null,
                },
            },
        },
    },
    7: {
        [BILLABLE_TYPE.BILLABLE]: {
            [PAYMENT_TYPE.PAID]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONTRACT]: null,
        },
        [BILLABLE_TYPE.NON_BILLABLE]: {
            [PAYMENT_TYPE.CREDIT]: {
                [PAYMENT_TO.DSS]: null,
                [PAYMENT_TO.BU]: null,
            },
            [PAYMENT_TYPE.CONCESSION]: {
                [PAYMENT_TO.GENPO]: {
                    [CONCESSION_TYPE.STRATEGIC]: null,
                },
            },
        },
    },
};

const normalizeText = (text: string) =>
    String(text || "").toLowerCase().replace(/\s+/g, " ").trim();

export const detectPatternFromWoType = (woTypeText: string): number | null => {
    const text = normalizeText(woTypeText);

    if (text.includes("startup") || text.includes("新規・中古機再販")) return 1;
    if (text.includes("fcn/si")) return 2;
    if (text.includes("troubleshooting")) return 4;
    if (
        text.includes("modification") ||
        text.includes("relocation") ||
        text.includes("decommission") ||
        text.includes("re-installation") ||
        text === "oh" ||
        text === "pm" ||
        text.includes("装置の立ち下げ作業") ||
        text.includes("装置の再立ち上げ作業") ||
        text.includes("repair")
    ) return 3;
    if (text.includes("process / application") || text.includes("consulting / analysis")) return 5;
    if (text.includes("software installation")) return 6;
    if (text.includes("customer training")) return 7;

    return null;
};

export const getChildKeys = (node: PaymentTreeNode): string[] => {
    if (!node || typeof node !== "object") return [];
    return Object.keys(node);
};

export const getNodeByValue = (node: PaymentTreeNode, selectedValue: string) => {
    if (!node || !selectedValue) return null;
    return node[selectedValue] ?? null;
};
