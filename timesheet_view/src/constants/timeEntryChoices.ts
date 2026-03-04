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
