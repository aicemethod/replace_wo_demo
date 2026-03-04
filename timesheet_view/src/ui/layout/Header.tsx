import { useEffect } from "react";
import { Select } from "../components/Select";
import "../styles/layout/Header.css";
import { useTranslation } from "react-i18next";
import { getUrlParams } from "../../utils/url";
import type { HeaderProps } from "../../types/components";

/**
 * アプリ上部ヘッダー
 * - アプリタイトル表示
 * - WorkOrder選択
 * - アップロードボタン
 */
export const Header: React.FC<HeaderProps> = ({
    workOrders = [],
    selectedWO,
    setSelectedWO,
}) => {
    const { t } = useTranslation();
    const params = getUrlParams();
    const dataParam = params.data || params.recordid || params.value || "";
    const paramWoId = dataParam.includes("\u0001") ? (dataParam.split("\u0001")[0] || "") : dataParam;

    useEffect(() => {
        if (!paramWoId || !workOrders.length) return;

        const matchedWorkOrder = workOrders.find(
            (wo) => wo.id.toLowerCase() === paramWoId.toLowerCase()
        );

        if (matchedWorkOrder && matchedWorkOrder.id !== selectedWO) {
            setSelectedWO(matchedWorkOrder.id);
        }
    }, [paramWoId, workOrders, selectedWO, setSelectedWO]);

    const woOptions = [
        { value: "all", label: t("header.all") },
        ...workOrders.map((wo) => ({
            value: wo.id,
            label: wo.name || t("header.noName"),
        })),
    ];

    return (
        <header className="app-header">
            <div className="header-left">
                <h1 className="header-title">{t("header.title")}</h1>
            </div>

            <div className="header-right">
                <span className="header-label">{t("header.targetWO")}</span>

                <Select
                    options={woOptions}
                    value={selectedWO}
                    onChange={setSelectedWO}
                    placeholder={t("header.selectWO")}
                />

                {/* <Button
                    label={t("header.upload")}
                    color="secondary"
                    icon={<FaIcons.FaUpload />}
                    className="upload-button"
                    onClick={() => console.log("アップロード処理")}
                /> */}
            </div>
        </header>
    );
};
