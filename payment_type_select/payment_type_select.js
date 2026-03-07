var ProtoForm = window.ProtoForm || {};
(function () {
    "use strict";

    // =========================
    // 定数
    // =========================

    // Lookup: proto_wotype
    const WO_TYPE_LOOKUP = {
        STARTUP: "GUID",
        FCN_SI: "GUID",
        RE_LOCATION: "GUID",
        DECOMISSION: "GUID",
        RE_INSTALLATION: "GUID",
        OH: "GUID",
        PM: "GUID",
        MODIFICATION: "GUID",
        REPAIR: "GUID",
        TROUBLESHOOTING_REPAIR: "GUID",
        PROCESS_APPLICATION: "GUID",
        CONSAULTING_ANALYSIS: "GUID",
        SOFTWARE_INSTALLATION: "GUID",
        CUSTOMER_TRAINING: "GUID"
    };

    // OptionSet: proto_billabletype
    const BILLABLE_TYPE_OPTIONS = {
        STARTUP: 931440000,
        BILLABLE: 931440001,
        NON_BILLABLE: 931440002
    };

    // OptionSet: proto_payment_tobe
    const PAYMENT_TOBE_OPTIONS = {
        STARTUP: 931440000,
        PRE_WARRANTY: 931440001,
        PAID: 931440002,
        CONTRACT: 931440003,
        CONCESSION: 931440004,
        FCN_SI: 931440005,
        EQUIPMENT_WARRANTY: 931440006,
        MOD_WARRANTY: 931440007,
        CREDIT: 931440008
    };

    // OptionSet: proto_paymentto_tobe
    const PAYMENT_TO_TOBE_OPTIONS = {
        DSS: 931440000,
        BU: 931440001,
        FACTORY: 931440002,
        GENPO: 931440003
    };

    // OptionSet: proto_concession_tobe
    const CONCESSION_TOBE_OPTIONS = {
        STRATEGIC: 931440000,
        NON_STRATEGIC: 931440001
    };

    // Lookup: proto_region
    const REGION_LOOKUP = {
        CN: "GUID",
        EU: "GUID",
        JP: "GUID",
        KR: "GUID",
        SG: "GUID",
        TW: "GUID",
        US: "GUID"
    };

    // 表示制御対象
    const REGION_DEPENDENT_FIELDS = [
        "proto_primaryso",
        "proto_wo_soassociation",
        "proto_cnt_contractsummary",
        "proto_tel_wo_sow",
        "proto_tel_wo_concession_reason",
        "proto_tel_wo_retrofitfcnno",
        "proto_tel_wo_continuouswork",
        "proto_wo_installation",
        "proto_wo_tmp_so_no_text"
    ];

    // =========================
    // 公開関数
    // =========================

    // フォーム読み込み時に画面制御を更新する。
    this.onLoad = (executionContext) => {
        const formContext = executionContext.getFormContext();
        this.refreshForm(formContext);
    };

    // 対象フィールド変更時に画面制御を更新する。
    this.onChange = (executionContext) => {
        const formContext = executionContext.getFormContext();
        this.refreshForm(formContext);
    };

    // =========================
    // メイン処理
    // =========================

    // 入力状態に応じて選択肢と表示項目を再計算する。
    this.refreshForm = (formContext) => {
        const woTypeId = this.getLookupId(formContext, "proto_wotype");
        const regionId = this.getLookupId(formContext, "proto_region");

        const billableType = this.getOptionValue(formContext, "proto_billabletype");
        const paymentTobe = this.getOptionValue(formContext, "proto_payment_tobe");
        const paymentToTobe = this.getOptionValue(formContext, "proto_paymentto_tobe");
        const concessionTobe = this.getOptionValue(formContext, "proto_concession_tobe");

        this.resetRegionFields(formContext);
        this.resetOptionControls(formContext);

        // proto_wotype が未選択なら後続をすべて読み取り
        if (!woTypeId) {
            this.setDisabled(formContext, "proto_billabletype", true);
            this.setDisabled(formContext, "proto_payment_tobe", true);
            this.setDisabled(formContext, "proto_paymentto_tobe", true);
            this.setDisabled(formContext, "proto_concession_tobe", true);
            return;
        }

        // proto_billabletype 制御
        const billableTypeOptions = this.getAllowedBillableTypeOptions(woTypeId);
        this.applyOptions(formContext, "proto_billabletype", billableTypeOptions);

        // proto_payment_tobe 制御
        if (billableType !== null) {
            const paymentTobeOptions = this.getAllowedPaymentTobeOptions(woTypeId, billableType);
            this.applyOptions(formContext, "proto_payment_tobe", paymentTobeOptions);
        } else {
            this.clearField(formContext, "proto_payment_tobe");
            this.clearField(formContext, "proto_paymentto_tobe");
            this.clearField(formContext, "proto_concession_tobe");
            this.setDisabled(formContext, "proto_payment_tobe", true);
            this.setDisabled(formContext, "proto_paymentto_tobe", true);
            this.setDisabled(formContext, "proto_concession_tobe", true);
            return;
        }

        // proto_paymentto_tobe 制御
        if (paymentTobe !== null) {
            const paymentToTobeOptions = this.getAllowedPaymentToTobeOptions(woTypeId, billableType, paymentTobe);
            this.applyOptions(formContext, "proto_paymentto_tobe", paymentToTobeOptions);
        } else {
            this.clearField(formContext, "proto_paymentto_tobe");
            this.clearField(formContext, "proto_concession_tobe");
            this.setDisabled(formContext, "proto_paymentto_tobe", true);
            this.setDisabled(formContext, "proto_concession_tobe", true);
            this.showRegionFields(formContext, woTypeId, billableType, null, null, null, regionId);
            return;
        }

        // proto_concession_tobe 制御
        if (paymentToTobe !== null) {
            const concessionTobeOptions = this.getAllowedConcessionTobeOptions(woTypeId, billableType, paymentTobe, paymentToTobe);
            this.applyOptions(formContext, "proto_concession_tobe", concessionTobeOptions);
        } else {
            this.clearField(formContext, "proto_concession_tobe");
            this.setDisabled(formContext, "proto_concession_tobe", true);
        }

        // 地域固有表示
        this.showRegionFields(formContext, woTypeId, billableType, paymentTobe, paymentToTobe, concessionTobe, regionId);
    };

    // =========================
    // パターン判定
    // =========================

    // WO_TYPE_LOOKUP の値から BILLABLE_TYPE_OPTIONS の許可選択肢を返す。
    this.getAllowedBillableTypeOptions = (woTypeId) => {
        // パターン1
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP)) {
            return [
                this.option("Startup", BILLABLE_TYPE_OPTIONS.STARTUP),
                this.option("Billable", BILLABLE_TYPE_OPTIONS.BILLABLE),
                this.option("non_billable", BILLABLE_TYPE_OPTIONS.NON_BILLABLE)
            ];
        }

        // パターン2
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.FCN_SI)) {
            return [
                this.option("non_billable", BILLABLE_TYPE_OPTIONS.NON_BILLABLE)
            ];
        }

        // パターン3
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.MODIFICATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_LOCATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.DECOMISSION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_INSTALLATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.OH) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PM) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.REPAIR)
        ) {
            return [
                this.option("Billable", BILLABLE_TYPE_OPTIONS.BILLABLE),
                this.option("non_billable", BILLABLE_TYPE_OPTIONS.NON_BILLABLE)
            ];
        }

        // パターン4
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR)) {
            return [
                this.option("Startup", BILLABLE_TYPE_OPTIONS.STARTUP),
                this.option("Billable", BILLABLE_TYPE_OPTIONS.BILLABLE),
                this.option("non_billable", BILLABLE_TYPE_OPTIONS.NON_BILLABLE)
            ];
        }

        // パターン5
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)
        ) {
            return [
                this.option("Startup", BILLABLE_TYPE_OPTIONS.STARTUP),
                this.option("Billable", BILLABLE_TYPE_OPTIONS.BILLABLE),
                this.option("non_billable", BILLABLE_TYPE_OPTIONS.NON_BILLABLE)
            ];
        }

        // パターン6
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION)) {
            return [
                this.option("Startup", BILLABLE_TYPE_OPTIONS.STARTUP),
                this.option("Billable", BILLABLE_TYPE_OPTIONS.BILLABLE),
                this.option("non_billable", BILLABLE_TYPE_OPTIONS.NON_BILLABLE)
            ];
        }

        // パターン7
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING)) {
            return [
                this.option("Billable", BILLABLE_TYPE_OPTIONS.BILLABLE),
                this.option("non_billable", BILLABLE_TYPE_OPTIONS.NON_BILLABLE)
            ];
        }

        return [];
    };

    // WO_TYPE_LOOKUP と BILLABLE_TYPE_OPTIONS の値から PAYMENT_TOBE_OPTIONS の許可選択肢を返す。
    this.getAllowedPaymentTobeOptions = (woTypeId, billableType) => {
        // パターン1 STARTUP
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP)) {
            if (billableType === BILLABLE_TYPE_OPTIONS.STARTUP) {
                return [
                    this.option("Startup", PAYMENT_TOBE_OPTIONS.STARTUP),
                    this.option("pre_warranty", PAYMENT_TOBE_OPTIONS.PRE_WARRANTY)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.BILLABLE) {
                return [
                    this.option("Paid", PAYMENT_TOBE_OPTIONS.PAID),
                    this.option("Contract", PAYMENT_TOBE_OPTIONS.CONTRACT)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE) {
                return [
                    this.option("Concession", PAYMENT_TOBE_OPTIONS.CONCESSION)
                ];
            }
        }

        // パターン2 FCN_SI
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.FCN_SI)) {
            if (billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE) {
                return [
                    this.option("fcn_si", PAYMENT_TOBE_OPTIONS.FCN_SI),
                    this.option("Concession", PAYMENT_TOBE_OPTIONS.CONCESSION)
                ];
            }
        }

        // パターン3
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.MODIFICATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_LOCATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.DECOMISSION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_INSTALLATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.OH) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PM) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.REPAIR)
        ) {
            if (billableType === BILLABLE_TYPE_OPTIONS.BILLABLE) {
                return [
                    this.option("Paid", PAYMENT_TOBE_OPTIONS.PAID),
                    this.option("Contract", PAYMENT_TOBE_OPTIONS.CONTRACT)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE) {
                return [
                    this.option("Concession", PAYMENT_TOBE_OPTIONS.CONCESSION)
                ];
            }
        }

        // パターン4 TROUBLESHOOTING_REPAIR
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR)) {
            if (billableType === BILLABLE_TYPE_OPTIONS.STARTUP) {
                return [
                    this.option("pre_warranty", PAYMENT_TOBE_OPTIONS.PRE_WARRANTY)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.BILLABLE) {
                return [
                    this.option("Paid", PAYMENT_TOBE_OPTIONS.PAID),
                    this.option("Contract", PAYMENT_TOBE_OPTIONS.CONTRACT)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE) {
                return [
                    this.option("equipment_warranty", PAYMENT_TOBE_OPTIONS.EQUIPMENT_WARRANTY),
                    this.option("mod_warranty", PAYMENT_TOBE_OPTIONS.MOD_WARRANTY),
                    this.option("Concession", PAYMENT_TOBE_OPTIONS.CONCESSION)
                ];
            }
        }

        // パターン5 PROCESS_APPLICATION / CONSAULTING_ANALYSIS
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)
        ) {
            if (billableType === BILLABLE_TYPE_OPTIONS.STARTUP) {
                return [
                    this.option("pre_warranty", PAYMENT_TOBE_OPTIONS.PRE_WARRANTY)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.BILLABLE) {
                return [
                    this.option("Paid", PAYMENT_TOBE_OPTIONS.PAID),
                    this.option("Contract", PAYMENT_TOBE_OPTIONS.CONTRACT)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE) {
                return [
                    this.option("equipment_warranty", PAYMENT_TOBE_OPTIONS.EQUIPMENT_WARRANTY),
                    this.option("Concession", PAYMENT_TOBE_OPTIONS.CONCESSION)
                ];
            }
        }

        // パターン6 SOFTWARE_INSTALLATION
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION)) {
            if (billableType === BILLABLE_TYPE_OPTIONS.STARTUP) {
                return [
                    this.option("pre_warranty", PAYMENT_TOBE_OPTIONS.PRE_WARRANTY)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.BILLABLE) {
                return [
                    this.option("Paid", PAYMENT_TOBE_OPTIONS.PAID),
                    this.option("Contract", PAYMENT_TOBE_OPTIONS.CONTRACT)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE) {
                return [
                    this.option("Concession", PAYMENT_TOBE_OPTIONS.CONCESSION)
                ];
            }
        }

        // パターン7 CUSTOMER_TRAINING
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING)) {
            if (billableType === BILLABLE_TYPE_OPTIONS.BILLABLE) {
                return [
                    this.option("Paid", PAYMENT_TOBE_OPTIONS.PAID),
                    this.option("Contract", PAYMENT_TOBE_OPTIONS.CONTRACT)
                ];
            }
            if (billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE) {
                return [
                    this.option("Credit", PAYMENT_TOBE_OPTIONS.CREDIT),
                    this.option("Concession", PAYMENT_TOBE_OPTIONS.CONCESSION)
                ];
            }
        }

        return [];
    };

    // WO_TYPE_LOOKUP〜PAYMENT_TOBE_OPTIONS の値から PAYMENT_TO_TOBE_OPTIONS の許可選択肢を返す。
    this.getAllowedPaymentToTobeOptions = (woTypeId, billableType, paymentTobe) => {
        // proto_paymentto_tobe を使わない場合
        if (
            paymentTobe === PAYMENT_TOBE_OPTIONS.STARTUP ||
            paymentTobe === PAYMENT_TOBE_OPTIONS.PRE_WARRANTY ||
            paymentTobe === PAYMENT_TOBE_OPTIONS.EQUIPMENT_WARRANTY ||
            paymentTobe === PAYMENT_TOBE_OPTIONS.MOD_WARRANTY
        ) {
            return [];
        }

        // STARTUP + BILLABLE + PAID
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
            billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
            paymentTobe === PAYMENT_TOBE_OPTIONS.PAID
        ) {
            return [
                this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
            ];
        }

        // STARTUP + NON_BILLABLE + CONCESSION
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
            billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE &&
            paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION
        ) {
            return [
                this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU),
                this.option("Factory", PAYMENT_TO_TOBE_OPTIONS.FACTORY)
            ];
        }

        // FCN_SI
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.FCN_SI)) {
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.FCN_SI) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
                ];
            }
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU),
                    this.option("Factory", PAYMENT_TO_TOBE_OPTIONS.FACTORY),
                    this.option("Genpo", PAYMENT_TO_TOBE_OPTIONS.GENPO)
                ];
            }
        }

        // パターン3
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.MODIFICATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_LOCATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.DECOMISSION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_INSTALLATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.OH) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PM) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.REPAIR)
        ) {
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
                ];
            }
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU),
                    this.option("Factory", PAYMENT_TO_TOBE_OPTIONS.FACTORY),
                    this.option("Genpo", PAYMENT_TO_TOBE_OPTIONS.GENPO)
                ];
            }
        }

        // TROUBLESHOOTING_REPAIR
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR)) {
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
                ];
            }
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU),
                    this.option("Factory", PAYMENT_TO_TOBE_OPTIONS.FACTORY),
                    this.option("Genpo", PAYMENT_TO_TOBE_OPTIONS.GENPO)
                ];
            }
        }

        // PROCESS_APPLICATION / CONSAULTING_ANALYSIS
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)
        ) {
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
                ];
            }
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU),
                    this.option("Factory", PAYMENT_TO_TOBE_OPTIONS.FACTORY),
                    this.option("Genpo", PAYMENT_TO_TOBE_OPTIONS.GENPO)
                ];
            }
        }

        // SOFTWARE_INSTALLATION
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION)) {
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
                ];
            }
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU),
                    this.option("Factory", PAYMENT_TO_TOBE_OPTIONS.FACTORY),
                    this.option("Genpo", PAYMENT_TO_TOBE_OPTIONS.GENPO)
                ];
            }
        }

        // CUSTOMER_TRAINING
        if (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING)) {
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
                ];
            }
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.CREDIT) {
                return [
                    this.option("dss", PAYMENT_TO_TOBE_OPTIONS.DSS),
                    this.option("Bu", PAYMENT_TO_TOBE_OPTIONS.BU)
                ];
            }
            if (paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION) {
                return [
                    this.option("Genpo", PAYMENT_TO_TOBE_OPTIONS.GENPO)
                ];
            }
        }

        return [];
    };

    // WO_TYPE_LOOKUP〜PAYMENT_TO_TOBE_OPTIONS の値から CONCESSION_TOBE_OPTIONS の許可選択肢を返す。
    this.getAllowedConcessionTobeOptions = (woTypeId, billableType, paymentTobe, paymentToTobe) => {
        // proto_concession_tobe を使わない場合
        if (
            paymentToTobe !== PAYMENT_TO_TOBE_OPTIONS.DSS &&
            paymentToTobe !== PAYMENT_TO_TOBE_OPTIONS.BU &&
            paymentToTobe !== PAYMENT_TO_TOBE_OPTIONS.FACTORY &&
            paymentToTobe !== PAYMENT_TO_TOBE_OPTIONS.GENPO
        ) {
            return [];
        }

        // STARTUP + CONCESSION + FACTORY = NON_STRATEGIC★
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
            billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE &&
            paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION &&
            paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.FACTORY
        ) {
            return [
                this.option("non_strategic", CONCESSION_TOBE_OPTIONS.NON_STRATEGIC)
            ];
        }

        // CUSTOMER_TRAINING + NON_BILLABLE + CONCESSION + GENPO = STRATEGIC★
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING) &&
            billableType === BILLABLE_TYPE_OPTIONS.NON_BILLABLE &&
            paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION &&
            paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.GENPO
        ) {
            return [
                this.option("Strategic", CONCESSION_TOBE_OPTIONS.STRATEGIC)
            ];
        }

        // proto_concession_tobe 不要ケース
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
            billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
            paymentTobe === PAYMENT_TOBE_OPTIONS.PAID
        ) {
            return [];
        }

        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.FCN_SI) &&
            paymentTobe === PAYMENT_TOBE_OPTIONS.FCN_SI
        ) {
            return [];
        }

        if (
            (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.MODIFICATION) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_LOCATION) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.DECOMISSION) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_INSTALLATION) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.OH) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PM) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.REPAIR)) &&
            paymentTobe === PAYMENT_TOBE_OPTIONS.PAID
        ) {
            return [];
        }

        if (
            (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING)) &&
            (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID || paymentTobe === PAYMENT_TOBE_OPTIONS.CREDIT)
        ) {
            return [];
        }

        // 残りは基本 STRATEGIC / NON_STRATEGIC
        return [
            this.option("Strategic", CONCESSION_TOBE_OPTIONS.STRATEGIC),
            this.option("non_strategic", CONCESSION_TOBE_OPTIONS.NON_STRATEGIC)
        ];
    };

    // =========================
    // 地域固有条件
    // =========================

    // 地域と選択状態の組み合わせに応じて地域項目を表示する。
    this.showRegionFields = (formContext, woTypeId, billableType, paymentTobe, paymentToTobe, concessionTobe, regionId) => {
        if (!regionId) {
            return;
        }

        // ① proto_region = JP or US -> proto_primaryso
        if (
            this.isLookupId(regionId, REGION_LOOKUP.JP) ||
            this.isLookupId(regionId, REGION_LOOKUP.US)
        ) {
            if (
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
                billableType === BILLABLE_TYPE_OPTIONS.STARTUP &&
                (paymentTobe === PAYMENT_TOBE_OPTIONS.STARTUP || paymentTobe === PAYMENT_TOBE_OPTIONS.PRE_WARRANTY)
            ) {
                this.showField(formContext, "proto_primaryso");
            }

            if (
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
                billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.PAID
            ) {
                this.showField(formContext, "proto_primaryso");
            }
        }

        // ② proto_region = EU -> proto_wo_soassociation
        if (this.isLookupId(regionId, REGION_LOOKUP.EU)) {
            if (
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
                billableType === BILLABLE_TYPE_OPTIONS.STARTUP &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.STARTUP
            ) {
                this.showField(formContext, "proto_wo_soassociation");
            }

            if (
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
                billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.PAID
            ) {
                this.showField(formContext, "proto_wo_soassociation");
            }
        }

        // ③ proto_cnt_contractsummary / proto_tel_wo_sow 表示
        if (
            (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.STARTUP) &&
                billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

            (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR) &&
                billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

            ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
                this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)) &&
                billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

            (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION) &&
                billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

            (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING) &&
                billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT)
        ) {
            this.showField(formContext, "proto_cnt_contractsummary");
            this.showField(formContext, "proto_tel_wo_sow");
        }

        // ④ proto_tel_wo_concession_reason 表示
        if (
            paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.FACTORY
        ) {
            this.showField(formContext, "proto_tel_wo_concession_reason");
        }

        // ⑤ FCN_SI -> proto_tel_wo_retrofitfcnno / proto_tel_wo_continuouswork
        if (
            this.isLookupId(woTypeId, WO_TYPE_LOOKUP.FCN_SI)
        ) {
            this.showField(formContext, "proto_tel_wo_retrofitfcnno");
            this.showField(formContext, "proto_tel_wo_continuouswork");
        }

        // ⑥ proto_region = EU かつ GENPO + STRATEGIC 系
        if (this.isLookupId(regionId, REGION_LOOKUP.EU)) {
            if (
                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.FCN_SI) &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION &&
                    paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.GENPO &&
                    concessionTobe === CONCESSION_TOBE_OPTIONS.STRATEGIC) ||

                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.MODIFICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_LOCATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.DECOMISSION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_INSTALLATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.OH) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PM) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.REPAIR)) &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION &&
                    paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.GENPO &&
                    concessionTobe === CONCESSION_TOBE_OPTIONS.STRATEGIC) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR) &&
                    ((paymentTobe === PAYMENT_TOBE_OPTIONS.MOD_WARRANTY) ||
                        (paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION &&
                            paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.GENPO &&
                            concessionTobe === CONCESSION_TOBE_OPTIONS.STRATEGIC))) ||

                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)) &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION &&
                    paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.GENPO &&
                    concessionTobe === CONCESSION_TOBE_OPTIONS.STRATEGIC) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION) &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION &&
                    paymentToTobe === PAYMENT_TO_TOBE_OPTIONS.GENPO &&
                    concessionTobe === CONCESSION_TOBE_OPTIONS.STRATEGIC) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING) &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONCESSION)
            ) {
                this.showField(formContext, "proto_wo_installation");
            }
        }

        // ⑦ proto_region = SG or TW -> proto_wo_tmp_so_no_text
        if (
            this.isLookupId(regionId, REGION_LOOKUP.SG) ||
            this.isLookupId(regionId, REGION_LOOKUP.TW)
        ) {
            if (
                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.MODIFICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_LOCATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.DECOMISSION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_INSTALLATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.OH) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PM) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.REPAIR)) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID || paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT)) ||

                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID || paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT)) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID || paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT)) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID || paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT))
            ) {
                this.showField(formContext, "proto_wo_tmp_so_no_text");
            }
        }

        // ⑧ proto_region = EU or CN or KR -> proto_wo_installation + proto_wo_soassociation
        if (
            this.isLookupId(regionId, REGION_LOOKUP.EU) ||
            this.isLookupId(regionId, REGION_LOOKUP.CN) ||
            this.isLookupId(regionId, REGION_LOOKUP.KR)
        ) {
            if (
                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.MODIFICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_LOCATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.DECOMISSION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.RE_INSTALLATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.OH) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PM) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.REPAIR)) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    (paymentTobe === PAYMENT_TOBE_OPTIONS.PAID || paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT))
            ) {
                this.showField(formContext, "proto_wo_installation");
                this.showField(formContext, "proto_wo_soassociation");
            }
        }

        // ⑨ proto_region = EU or CN or KR -> proto_wo_soassociation
        if (
            this.isLookupId(regionId, REGION_LOOKUP.EU) ||
            this.isLookupId(regionId, REGION_LOOKUP.CN) ||
            this.isLookupId(regionId, REGION_LOOKUP.KR)
        ) {
            if (
                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) ||

                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT)
            ) {
                this.showField(formContext, "proto_wo_soassociation");
            }
        }

        // ⑩ proto_region = CN or KR -> proto_wo_soassociation
        if (
            this.isLookupId(regionId, REGION_LOOKUP.CN) ||
            this.isLookupId(regionId, REGION_LOOKUP.KR)
        ) {
            if (
                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.PAID)
            ) {
                this.showField(formContext, "proto_wo_soassociation");
            }
        }

        // 11 proto_region = EU -> proto_wo_installation + proto_wo_soassociation
        if (this.isLookupId(regionId, REGION_LOOKUP.EU)) {
            if (
                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.TROUBLESHOOTING_REPAIR) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

                ((this.isLookupId(woTypeId, WO_TYPE_LOOKUP.PROCESS_APPLICATION) ||
                    this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CONSAULTING_ANALYSIS)) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.SOFTWARE_INSTALLATION) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.PAID) ||

                (this.isLookupId(woTypeId, WO_TYPE_LOOKUP.CUSTOMER_TRAINING) &&
                    billableType === BILLABLE_TYPE_OPTIONS.BILLABLE &&
                    paymentTobe === PAYMENT_TOBE_OPTIONS.CONTRACT)
            ) {
                this.showField(formContext, "proto_wo_installation");
                this.showField(formContext, "proto_wo_soassociation");
            }
        }
    };

    // =========================
    // 共通関数
    // =========================

    // OptionSet 用の選択肢オブジェクトを生成する。
    this.option = (text, value) => {
        return {
            text: text,
            value: value
        };
    };

    // Lookup フィールドから GUID を取得して正規化する。
    this.getLookupId = (formContext, fieldName) => {
        const attr = formContext.getAttribute(fieldName);
        if (!attr) {
            return null;
        }

        const value = attr.getValue();
        if (!value || value.length === 0 || !value[0].id) {
            return null;
        }

        return this.normalizeGuid(value[0].id);
    };

    // OptionSet フィールドの値を取得する。
    this.getOptionValue = (formContext, fieldName) => {
        const attr = formContext.getAttribute(fieldName);
        if (!attr) {
            return null;
        }

        const value = attr.getValue();
        return value === null || value === undefined ? null : value;
    };

    // GUID の波括弧を除去して小文字に正規化する。
    this.normalizeGuid = (id) => {
        if (!id) {
            return "";
        }
        return id.replace("{", "").replace("}", "").toLowerCase();
    };

    // 2つの GUID を正規化して一致判定する。
    this.isLookupId = (actualId, expectedId) => {
        return this.normalizeGuid(actualId) === this.normalizeGuid(expectedId);
    };

    // 指定フィールドの値をクリアして変更イベントを発火する。
    this.clearField = (formContext, fieldName) => {
        const attr = formContext.getAttribute(fieldName);
        if (attr) {
            attr.setValue(null);
            attr.fireOnChange();
        }
    };

    // 指定コントロールの活性状態を切り替える。
    this.setDisabled = (formContext, fieldName, disabled) => {
        const ctrl = formContext.getControl(fieldName);
        if (ctrl) {
            ctrl.setDisabled(disabled);
        }
    };

    // 指定コントロールを表示する。
    this.showField = (formContext, fieldName) => {
        const ctrl = formContext.getControl(fieldName);
        if (ctrl) {
            ctrl.setVisible(true);
        }
    };

    // 指定コントロールを非表示にする。
    this.hideField = (formContext, fieldName) => {
        const ctrl = formContext.getControl(fieldName);
        if (ctrl) {
            ctrl.setVisible(false);
        }
    };

    // 地域表示対象フィールドをすべて非表示に戻す。
    this.resetRegionFields = (formContext) => {
        for (let i = 0; i < REGION_DEPENDENT_FIELDS.length; i++) {
            this.hideField(formContext, REGION_DEPENDENT_FIELDS[i]);
        }
    };

    // 連動する OptionSet コントロールを有効化する。
    this.resetOptionControls = (formContext) => {
        this.setDisabled(formContext, "proto_billabletype", false);
        this.setDisabled(formContext, "proto_payment_tobe", false);
        this.setDisabled(formContext, "proto_paymentto_tobe", false);
        this.setDisabled(formContext, "proto_concession_tobe", false);
    };

    // 指定フィールドへ選択肢を適用し現在値の整合性を保つ。
    this.applyOptions = (formContext, fieldName, options) => {
        const ctrl = formContext.getControl(fieldName);
        const attr = formContext.getAttribute(fieldName);

        if (!ctrl || !attr) {
            return;
        }

        ctrl.clearOptions();

        for (let i = 0; i < options.length; i++) {
            ctrl.addOption({
                text: options[i].text,
                value: options[i].value
            });
        }

        const currentValue = attr.getValue();
        let valid = false;

        for (let j = 0; j < options.length; j++) {
            if (options[j].value === currentValue) {
                valid = true;
                break;
            }
        }

        if (!valid) {
            attr.setValue(null);
        }

        if (options.length === 0) {
            attr.setValue(null);
            ctrl.setDisabled(true);
            return;
        }

        if (options.length === 1) {
            attr.setValue(options[0].value);
            ctrl.setDisabled(true);
            return;
        }

        ctrl.setDisabled(false);
    };
}).call(ProtoForm);
