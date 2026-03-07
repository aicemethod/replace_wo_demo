var ProtoForm = window.ProtoForm || {};
(function () {
    "use strict";

    // =========================
    // 定数
    // =========================

    // Lookup: proto_test1
    const PROTO_TEST1 = {
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

    // OptionSet: proto_test2
    const PROTO_TEST2 = {
        STARTUP: 931440000,
        BILLABLE: 931440001,
        NON_BILLABLE: 931440002
    };

    // OptionSet: proto_test3
    const PROTO_TEST3 = {
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

    // OptionSet: proto_test4
    const PROTO_TEST4 = {
        DSS: 931440000,
        BU: 931440001,
        FACTORY: 931440002,
        GENPO: 931440003
    };

    // OptionSet: proto_test5
    const PROTO_TEST5 = {
        STRATEGIC: 931440000,
        NON_STRATEGIC: 931440001
    };

    // Lookup: proto_test11
    const PROTO_TEST11 = {
        CN: "GUID",
        EU: "GUID",
        JP: "GUID",
        KR: "GUID",
        SG: "GUID",
        TW: "GUID",
        US: "GUID"
    };

    // 表示制御対象
    const REGION_FIELDS = [
        "proto_test6",
        "proto_test7",
        "proto_test8",
        "proto_test9",
        "proto_test10",
        "proto_test12",
        "proto_test13",
        "proto_test14",
        "proto_test15"
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
        const test1Id = this.getLookupId(formContext, "proto_test1");
        const test11Id = this.getLookupId(formContext, "proto_test11");

        const test2 = this.getOptionValue(formContext, "proto_test2");
        const test3 = this.getOptionValue(formContext, "proto_test3");
        const test4 = this.getOptionValue(formContext, "proto_test4");
        const test5 = this.getOptionValue(formContext, "proto_test5");

        this.resetRegionFields(formContext);
        this.resetOptionControls(formContext);

        // proto_test1 が未選択なら後続をすべて読み取り
        if (!test1Id) {
            this.setDisabled(formContext, "proto_test2", true);
            this.setDisabled(formContext, "proto_test3", true);
            this.setDisabled(formContext, "proto_test4", true);
            this.setDisabled(formContext, "proto_test5", true);
            return;
        }

        // proto_test2 制御
        const test2Options = this.getAllowedProtoTest2(test1Id);
        this.applyOptions(formContext, "proto_test2", test2Options);

        // proto_test3 制御
        if (test2 !== null) {
            const test3Options = this.getAllowedProtoTest3(test1Id, test2);
            this.applyOptions(formContext, "proto_test3", test3Options);
        } else {
            this.clearField(formContext, "proto_test3");
            this.clearField(formContext, "proto_test4");
            this.clearField(formContext, "proto_test5");
            this.setDisabled(formContext, "proto_test3", true);
            this.setDisabled(formContext, "proto_test4", true);
            this.setDisabled(formContext, "proto_test5", true);
            return;
        }

        // proto_test4 制御
        if (test3 !== null) {
            const test4Options = this.getAllowedProtoTest4(test1Id, test2, test3);
            this.applyOptions(formContext, "proto_test4", test4Options);
        } else {
            this.clearField(formContext, "proto_test4");
            this.clearField(formContext, "proto_test5");
            this.setDisabled(formContext, "proto_test4", true);
            this.setDisabled(formContext, "proto_test5", true);
            this.showRegionFields(formContext, test1Id, test2, null, null, null, test11Id);
            return;
        }

        // proto_test5 制御
        if (test4 !== null) {
            const test5Options = this.getAllowedProtoTest5(test1Id, test2, test3, test4);
            this.applyOptions(formContext, "proto_test5", test5Options);
        } else {
            this.clearField(formContext, "proto_test5");
            this.setDisabled(formContext, "proto_test5", true);
        }

        // 地域固有表示
        this.showRegionFields(formContext, test1Id, test2, test3, test4, test5, test11Id);
    };

    // =========================
    // パターン判定
    // =========================

    // PROTO_TEST1 の値から PROTO_TEST2 の許可選択肢を返す。
    this.getAllowedProtoTest2 = (test1Id) => {
        // パターン1
        if (this.isLookupId(test1Id, PROTO_TEST1.STARTUP)) {
            return [
                this.option("Startup", PROTO_TEST2.STARTUP),
                this.option("Billable", PROTO_TEST2.BILLABLE),
                this.option("non_billable", PROTO_TEST2.NON_BILLABLE)
            ];
        }

        // パターン2
        if (this.isLookupId(test1Id, PROTO_TEST1.FCN_SI)) {
            return [
                this.option("non_billable", PROTO_TEST2.NON_BILLABLE)
            ];
        }

        // パターン3
        if (
            this.isLookupId(test1Id, PROTO_TEST1.MODIFICATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.RE_LOCATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.DECOMISSION) ||
            this.isLookupId(test1Id, PROTO_TEST1.RE_INSTALLATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.OH) ||
            this.isLookupId(test1Id, PROTO_TEST1.PM) ||
            this.isLookupId(test1Id, PROTO_TEST1.REPAIR)
        ) {
            return [
                this.option("Billable", PROTO_TEST2.BILLABLE),
                this.option("non_billable", PROTO_TEST2.NON_BILLABLE)
            ];
        }

        // パターン4
        if (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR)) {
            return [
                this.option("Startup", PROTO_TEST2.STARTUP),
                this.option("Billable", PROTO_TEST2.BILLABLE),
                this.option("non_billable", PROTO_TEST2.NON_BILLABLE)
            ];
        }

        // パターン5
        if (
            this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)
        ) {
            return [
                this.option("Startup", PROTO_TEST2.STARTUP),
                this.option("Billable", PROTO_TEST2.BILLABLE),
                this.option("non_billable", PROTO_TEST2.NON_BILLABLE)
            ];
        }

        // パターン6
        if (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION)) {
            return [
                this.option("Startup", PROTO_TEST2.STARTUP),
                this.option("Billable", PROTO_TEST2.BILLABLE),
                this.option("non_billable", PROTO_TEST2.NON_BILLABLE)
            ];
        }

        // パターン7
        if (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING)) {
            return [
                this.option("Billable", PROTO_TEST2.BILLABLE),
                this.option("non_billable", PROTO_TEST2.NON_BILLABLE)
            ];
        }

        return [];
    };

    // PROTO_TEST1 と PROTO_TEST2 の値から PROTO_TEST3 の許可選択肢を返す。
    this.getAllowedProtoTest3 = (test1Id, test2) => {
        // パターン1 STARTUP
        if (this.isLookupId(test1Id, PROTO_TEST1.STARTUP)) {
            if (test2 === PROTO_TEST2.STARTUP) {
                return [
                    this.option("Startup", PROTO_TEST3.STARTUP),
                    this.option("pre_warranty", PROTO_TEST3.PRE_WARRANTY)
                ];
            }
            if (test2 === PROTO_TEST2.BILLABLE) {
                return [
                    this.option("Paid", PROTO_TEST3.PAID),
                    this.option("Contract", PROTO_TEST3.CONTRACT)
                ];
            }
            if (test2 === PROTO_TEST2.NON_BILLABLE) {
                return [
                    this.option("Concession", PROTO_TEST3.CONCESSION)
                ];
            }
        }

        // パターン2 FCN_SI
        if (this.isLookupId(test1Id, PROTO_TEST1.FCN_SI)) {
            if (test2 === PROTO_TEST2.NON_BILLABLE) {
                return [
                    this.option("fcn_si", PROTO_TEST3.FCN_SI),
                    this.option("Concession", PROTO_TEST3.CONCESSION)
                ];
            }
        }

        // パターン3
        if (
            this.isLookupId(test1Id, PROTO_TEST1.MODIFICATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.RE_LOCATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.DECOMISSION) ||
            this.isLookupId(test1Id, PROTO_TEST1.RE_INSTALLATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.OH) ||
            this.isLookupId(test1Id, PROTO_TEST1.PM) ||
            this.isLookupId(test1Id, PROTO_TEST1.REPAIR)
        ) {
            if (test2 === PROTO_TEST2.BILLABLE) {
                return [
                    this.option("Paid", PROTO_TEST3.PAID),
                    this.option("Contract", PROTO_TEST3.CONTRACT)
                ];
            }
            if (test2 === PROTO_TEST2.NON_BILLABLE) {
                return [
                    this.option("Concession", PROTO_TEST3.CONCESSION)
                ];
            }
        }

        // パターン4 TROUBLESHOOTING_REPAIR
        if (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR)) {
            if (test2 === PROTO_TEST2.STARTUP) {
                return [
                    this.option("pre_warranty", PROTO_TEST3.PRE_WARRANTY)
                ];
            }
            if (test2 === PROTO_TEST2.BILLABLE) {
                return [
                    this.option("Paid", PROTO_TEST3.PAID),
                    this.option("Contract", PROTO_TEST3.CONTRACT)
                ];
            }
            if (test2 === PROTO_TEST2.NON_BILLABLE) {
                return [
                    this.option("equipment_warranty", PROTO_TEST3.EQUIPMENT_WARRANTY),
                    this.option("mod_warranty", PROTO_TEST3.MOD_WARRANTY),
                    this.option("Concession", PROTO_TEST3.CONCESSION)
                ];
            }
        }

        // パターン5 PROCESS_APPLICATION / CONSAULTING_ANALYSIS
        if (
            this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)
        ) {
            if (test2 === PROTO_TEST2.STARTUP) {
                return [
                    this.option("pre_warranty", PROTO_TEST3.PRE_WARRANTY)
                ];
            }
            if (test2 === PROTO_TEST2.BILLABLE) {
                return [
                    this.option("Paid", PROTO_TEST3.PAID),
                    this.option("Contract", PROTO_TEST3.CONTRACT)
                ];
            }
            if (test2 === PROTO_TEST2.NON_BILLABLE) {
                return [
                    this.option("equipment_warranty", PROTO_TEST3.EQUIPMENT_WARRANTY),
                    this.option("Concession", PROTO_TEST3.CONCESSION)
                ];
            }
        }

        // パターン6 SOFTWARE_INSTALLATION
        if (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION)) {
            if (test2 === PROTO_TEST2.STARTUP) {
                return [
                    this.option("pre_warranty", PROTO_TEST3.PRE_WARRANTY)
                ];
            }
            if (test2 === PROTO_TEST2.BILLABLE) {
                return [
                    this.option("Paid", PROTO_TEST3.PAID),
                    this.option("Contract", PROTO_TEST3.CONTRACT)
                ];
            }
            if (test2 === PROTO_TEST2.NON_BILLABLE) {
                return [
                    this.option("Concession", PROTO_TEST3.CONCESSION)
                ];
            }
        }

        // パターン7 CUSTOMER_TRAINING
        if (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING)) {
            if (test2 === PROTO_TEST2.BILLABLE) {
                return [
                    this.option("Paid", PROTO_TEST3.PAID),
                    this.option("Contract", PROTO_TEST3.CONTRACT)
                ];
            }
            if (test2 === PROTO_TEST2.NON_BILLABLE) {
                return [
                    this.option("Credit", PROTO_TEST3.CREDIT),
                    this.option("Concession", PROTO_TEST3.CONCESSION)
                ];
            }
        }

        return [];
    };

    // PROTO_TEST1〜PROTO_TEST3 の値から PROTO_TEST4 の許可選択肢を返す。
    this.getAllowedProtoTest4 = (test1Id, test2, test3) => {
        // proto_test4 を使わない場合
        if (
            test3 === PROTO_TEST3.STARTUP ||
            test3 === PROTO_TEST3.PRE_WARRANTY ||
            test3 === PROTO_TEST3.EQUIPMENT_WARRANTY ||
            test3 === PROTO_TEST3.MOD_WARRANTY
        ) {
            return [];
        }

        // STARTUP + BILLABLE + PAID
        if (
            this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
            test2 === PROTO_TEST2.BILLABLE &&
            test3 === PROTO_TEST3.PAID
        ) {
            return [
                this.option("dss", PROTO_TEST4.DSS),
                this.option("Bu", PROTO_TEST4.BU)
            ];
        }

        // STARTUP + NON_BILLABLE + CONCESSION
        if (
            this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
            test2 === PROTO_TEST2.NON_BILLABLE &&
            test3 === PROTO_TEST3.CONCESSION
        ) {
            return [
                this.option("Bu", PROTO_TEST4.BU),
                this.option("Factory", PROTO_TEST4.FACTORY)
            ];
        }

        // FCN_SI
        if (this.isLookupId(test1Id, PROTO_TEST1.FCN_SI)) {
            if (test3 === PROTO_TEST3.FCN_SI) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU)
                ];
            }
            if (test3 === PROTO_TEST3.CONCESSION) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU),
                    this.option("Factory", PROTO_TEST4.FACTORY),
                    this.option("Genpo", PROTO_TEST4.GENPO)
                ];
            }
        }

        // パターン3
        if (
            this.isLookupId(test1Id, PROTO_TEST1.MODIFICATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.RE_LOCATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.DECOMISSION) ||
            this.isLookupId(test1Id, PROTO_TEST1.RE_INSTALLATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.OH) ||
            this.isLookupId(test1Id, PROTO_TEST1.PM) ||
            this.isLookupId(test1Id, PROTO_TEST1.REPAIR)
        ) {
            if (test3 === PROTO_TEST3.PAID) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU)
                ];
            }
            if (test3 === PROTO_TEST3.CONCESSION) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU),
                    this.option("Factory", PROTO_TEST4.FACTORY),
                    this.option("Genpo", PROTO_TEST4.GENPO)
                ];
            }
        }

        // TROUBLESHOOTING_REPAIR
        if (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR)) {
            if (test3 === PROTO_TEST3.PAID) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU)
                ];
            }
            if (test3 === PROTO_TEST3.CONCESSION) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU),
                    this.option("Factory", PROTO_TEST4.FACTORY),
                    this.option("Genpo", PROTO_TEST4.GENPO)
                ];
            }
        }

        // PROCESS_APPLICATION / CONSAULTING_ANALYSIS
        if (
            this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
            this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)
        ) {
            if (test3 === PROTO_TEST3.PAID) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU)
                ];
            }
            if (test3 === PROTO_TEST3.CONCESSION) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU),
                    this.option("Factory", PROTO_TEST4.FACTORY),
                    this.option("Genpo", PROTO_TEST4.GENPO)
                ];
            }
        }

        // SOFTWARE_INSTALLATION
        if (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION)) {
            if (test3 === PROTO_TEST3.PAID) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU)
                ];
            }
            if (test3 === PROTO_TEST3.CONCESSION) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU),
                    this.option("Factory", PROTO_TEST4.FACTORY),
                    this.option("Genpo", PROTO_TEST4.GENPO)
                ];
            }
        }

        // CUSTOMER_TRAINING
        if (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING)) {
            if (test3 === PROTO_TEST3.PAID) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU)
                ];
            }
            if (test3 === PROTO_TEST3.CREDIT) {
                return [
                    this.option("dss", PROTO_TEST4.DSS),
                    this.option("Bu", PROTO_TEST4.BU)
                ];
            }
            if (test3 === PROTO_TEST3.CONCESSION) {
                return [
                    this.option("Genpo", PROTO_TEST4.GENPO)
                ];
            }
        }

        return [];
    };

    // PROTO_TEST1〜PROTO_TEST4 の値から PROTO_TEST5 の許可選択肢を返す。
    this.getAllowedProtoTest5 = (test1Id, test2, test3, test4) => {
        // proto_test5 を使わない場合
        if (
            test4 !== PROTO_TEST4.DSS &&
            test4 !== PROTO_TEST4.BU &&
            test4 !== PROTO_TEST4.FACTORY &&
            test4 !== PROTO_TEST4.GENPO
        ) {
            return [];
        }

        // STARTUP + CONCESSION + FACTORY = NON_STRATEGIC★
        if (
            this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
            test2 === PROTO_TEST2.NON_BILLABLE &&
            test3 === PROTO_TEST3.CONCESSION &&
            test4 === PROTO_TEST4.FACTORY
        ) {
            return [
                this.option("non_strategic", PROTO_TEST5.NON_STRATEGIC)
            ];
        }

        // CUSTOMER_TRAINING + NON_BILLABLE + CONCESSION + GENPO = STRATEGIC★
        if (
            this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING) &&
            test2 === PROTO_TEST2.NON_BILLABLE &&
            test3 === PROTO_TEST3.CONCESSION &&
            test4 === PROTO_TEST4.GENPO
        ) {
            return [
                this.option("Strategic", PROTO_TEST5.STRATEGIC)
            ];
        }

        // proto_test5 不要ケース
        if (
            this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
            test2 === PROTO_TEST2.BILLABLE &&
            test3 === PROTO_TEST3.PAID
        ) {
            return [];
        }

        if (
            this.isLookupId(test1Id, PROTO_TEST1.FCN_SI) &&
            test3 === PROTO_TEST3.FCN_SI
        ) {
            return [];
        }

        if (
            (this.isLookupId(test1Id, PROTO_TEST1.MODIFICATION) ||
                this.isLookupId(test1Id, PROTO_TEST1.RE_LOCATION) ||
                this.isLookupId(test1Id, PROTO_TEST1.DECOMISSION) ||
                this.isLookupId(test1Id, PROTO_TEST1.RE_INSTALLATION) ||
                this.isLookupId(test1Id, PROTO_TEST1.OH) ||
                this.isLookupId(test1Id, PROTO_TEST1.PM) ||
                this.isLookupId(test1Id, PROTO_TEST1.REPAIR)) &&
            test3 === PROTO_TEST3.PAID
        ) {
            return [];
        }

        if (
            (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR) ||
                this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
                this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS) ||
                this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION) ||
                this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING)) &&
            (test3 === PROTO_TEST3.PAID || test3 === PROTO_TEST3.CREDIT)
        ) {
            return [];
        }

        // 残りは基本 STRATEGIC / NON_STRATEGIC
        return [
            this.option("Strategic", PROTO_TEST5.STRATEGIC),
            this.option("non_strategic", PROTO_TEST5.NON_STRATEGIC)
        ];
    };

    // =========================
    // 地域固有条件
    // =========================

    // 地域と選択状態の組み合わせに応じて地域項目を表示する。
    this.showRegionFields = (formContext, test1Id, test2, test3, test4, test5, test11Id) => {
        if (!test11Id) {
            return;
        }

        // ① proto_test11 = JP or US -> proto_test6
        if (
            this.isLookupId(test11Id, PROTO_TEST11.JP) ||
            this.isLookupId(test11Id, PROTO_TEST11.US)
        ) {
            if (
                this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
                test2 === PROTO_TEST2.STARTUP &&
                (test3 === PROTO_TEST3.STARTUP || test3 === PROTO_TEST3.PRE_WARRANTY)
            ) {
                this.showField(formContext, "proto_test6");
            }

            if (
                this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
                test2 === PROTO_TEST2.BILLABLE &&
                test3 === PROTO_TEST3.PAID
            ) {
                this.showField(formContext, "proto_test6");
            }
        }

        // ② proto_test11 = EU -> proto_test7
        if (this.isLookupId(test11Id, PROTO_TEST11.EU)) {
            if (
                this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
                test2 === PROTO_TEST2.STARTUP &&
                test3 === PROTO_TEST3.STARTUP
            ) {
                this.showField(formContext, "proto_test7");
            }

            if (
                this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
                test2 === PROTO_TEST2.BILLABLE &&
                test3 === PROTO_TEST3.PAID
            ) {
                this.showField(formContext, "proto_test7");
            }
        }

        // ③ proto_test8 / proto_test9 表示
        if (
            (this.isLookupId(test1Id, PROTO_TEST1.STARTUP) &&
                test2 === PROTO_TEST2.BILLABLE &&
                test3 === PROTO_TEST3.CONTRACT) ||

            (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR) &&
                test2 === PROTO_TEST2.BILLABLE &&
                test3 === PROTO_TEST3.CONTRACT) ||

            ((this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
                this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)) &&
                test2 === PROTO_TEST2.BILLABLE &&
                test3 === PROTO_TEST3.CONTRACT) ||

            (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION) &&
                test2 === PROTO_TEST2.BILLABLE &&
                test3 === PROTO_TEST3.CONTRACT) ||

            (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING) &&
                test2 === PROTO_TEST2.BILLABLE &&
                test3 === PROTO_TEST3.CONTRACT)
        ) {
            this.showField(formContext, "proto_test8");
            this.showField(formContext, "proto_test9");
        }

        // ④ proto_test10 表示
        if (
            test4 === PROTO_TEST4.FACTORY
        ) {
            this.showField(formContext, "proto_test10");
        }

        // ⑤ FCN_SI -> proto_test12 / proto_test13
        if (
            this.isLookupId(test1Id, PROTO_TEST1.FCN_SI)
        ) {
            this.showField(formContext, "proto_test12");
            this.showField(formContext, "proto_test13");
        }

        // ⑥ proto_test11 = EU かつ GENPO + STRATEGIC 系
        if (this.isLookupId(test11Id, PROTO_TEST11.EU)) {
            if (
                (this.isLookupId(test1Id, PROTO_TEST1.FCN_SI) &&
                    test3 === PROTO_TEST3.CONCESSION &&
                    test4 === PROTO_TEST4.GENPO &&
                    test5 === PROTO_TEST5.STRATEGIC) ||

                ((this.isLookupId(test1Id, PROTO_TEST1.MODIFICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.RE_LOCATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.DECOMISSION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.RE_INSTALLATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.OH) ||
                    this.isLookupId(test1Id, PROTO_TEST1.PM) ||
                    this.isLookupId(test1Id, PROTO_TEST1.REPAIR)) &&
                    test3 === PROTO_TEST3.CONCESSION &&
                    test4 === PROTO_TEST4.GENPO &&
                    test5 === PROTO_TEST5.STRATEGIC) ||

                (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR) &&
                    ((test3 === PROTO_TEST3.MOD_WARRANTY) ||
                        (test3 === PROTO_TEST3.CONCESSION &&
                            test4 === PROTO_TEST4.GENPO &&
                            test5 === PROTO_TEST5.STRATEGIC))) ||

                ((this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)) &&
                    test3 === PROTO_TEST3.CONCESSION &&
                    test4 === PROTO_TEST4.GENPO &&
                    test5 === PROTO_TEST5.STRATEGIC) ||

                (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION) &&
                    test3 === PROTO_TEST3.CONCESSION &&
                    test4 === PROTO_TEST4.GENPO &&
                    test5 === PROTO_TEST5.STRATEGIC) ||

                (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING) &&
                    test3 === PROTO_TEST3.CONCESSION)
            ) {
                this.showField(formContext, "proto_test14");
            }
        }

        // ⑦ proto_test11 = SG or TW -> proto_test15
        if (
            this.isLookupId(test11Id, PROTO_TEST11.SG) ||
            this.isLookupId(test11Id, PROTO_TEST11.TW)
        ) {
            if (
                ((this.isLookupId(test1Id, PROTO_TEST1.MODIFICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.RE_LOCATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.DECOMISSION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.RE_INSTALLATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.OH) ||
                    this.isLookupId(test1Id, PROTO_TEST1.PM) ||
                    this.isLookupId(test1Id, PROTO_TEST1.REPAIR)) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.PAID) ||

                (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    (test3 === PROTO_TEST3.PAID || test3 === PROTO_TEST3.CONTRACT)) ||

                ((this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    (test3 === PROTO_TEST3.PAID || test3 === PROTO_TEST3.CONTRACT)) ||

                (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    (test3 === PROTO_TEST3.PAID || test3 === PROTO_TEST3.CONTRACT)) ||

                (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    (test3 === PROTO_TEST3.PAID || test3 === PROTO_TEST3.CONTRACT))
            ) {
                this.showField(formContext, "proto_test15");
            }
        }

        // ⑧ proto_test11 = EU or CN or KR -> proto_test14 + proto_test7
        if (
            this.isLookupId(test11Id, PROTO_TEST11.EU) ||
            this.isLookupId(test11Id, PROTO_TEST11.CN) ||
            this.isLookupId(test11Id, PROTO_TEST11.KR)
        ) {
            if (
                ((this.isLookupId(test1Id, PROTO_TEST1.MODIFICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.RE_LOCATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.DECOMISSION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.RE_INSTALLATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.OH) ||
                    this.isLookupId(test1Id, PROTO_TEST1.PM) ||
                    this.isLookupId(test1Id, PROTO_TEST1.REPAIR)) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    (test3 === PROTO_TEST3.PAID || test3 === PROTO_TEST3.CONTRACT))
            ) {
                this.showField(formContext, "proto_test14");
                this.showField(formContext, "proto_test7");
            }
        }

        // ⑨ proto_test11 = EU or CN or KR -> proto_test7
        if (
            this.isLookupId(test11Id, PROTO_TEST11.EU) ||
            this.isLookupId(test11Id, PROTO_TEST11.CN) ||
            this.isLookupId(test11Id, PROTO_TEST11.KR)
        ) {
            if (
                (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.PAID) ||

                ((this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.PAID) ||

                (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.PAID) ||

                (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.CONTRACT)
            ) {
                this.showField(formContext, "proto_test7");
            }
        }

        // ⑩ proto_test11 = CN or KR -> proto_test7
        if (
            this.isLookupId(test11Id, PROTO_TEST11.CN) ||
            this.isLookupId(test11Id, PROTO_TEST11.KR)
        ) {
            if (
                (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.CONTRACT) ||

                ((this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.CONTRACT) ||

                (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.CONTRACT) ||

                (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.PAID)
            ) {
                this.showField(formContext, "proto_test7");
            }
        }

        // 11 proto_test11 = EU -> proto_test14 + proto_test7
        if (this.isLookupId(test11Id, PROTO_TEST11.EU)) {
            if (
                (this.isLookupId(test1Id, PROTO_TEST1.TROUBLESHOOTING_REPAIR) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.CONTRACT) ||

                ((this.isLookupId(test1Id, PROTO_TEST1.PROCESS_APPLICATION) ||
                    this.isLookupId(test1Id, PROTO_TEST1.CONSAULTING_ANALYSIS)) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.CONTRACT) ||

                (this.isLookupId(test1Id, PROTO_TEST1.SOFTWARE_INSTALLATION) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.PAID) ||

                (this.isLookupId(test1Id, PROTO_TEST1.CUSTOMER_TRAINING) &&
                    test2 === PROTO_TEST2.BILLABLE &&
                    test3 === PROTO_TEST3.CONTRACT)
            ) {
                this.showField(formContext, "proto_test14");
                this.showField(formContext, "proto_test7");
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
        for (let i = 0; i < REGION_FIELDS.length; i++) {
            this.hideField(formContext, REGION_FIELDS[i]);
        }
    };

    // 連動する OptionSet コントロールを有効化する。
    this.resetOptionControls = (formContext) => {
        this.setDisabled(formContext, "proto_test2", false);
        this.setDisabled(formContext, "proto_test3", false);
        this.setDisabled(formContext, "proto_test4", false);
        this.setDisabled(formContext, "proto_test5", false);
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
