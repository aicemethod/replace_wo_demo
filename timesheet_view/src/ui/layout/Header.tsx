import { Select } from "../components/Select";
import "../styles/layout/Header.css";
import { useTranslation } from "react-i18next";
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

    const woOptions = [
        { value: "all", label: t("header.all") },
        ...workOrders.map((wo) => ({
            value: wo.id,
            label: wo.name || t("header.noName"),
        })),
    ];
    /** パラメータと value が一致したオプションを初期表示（大文字小文字を無視） */
    const displayValue = woOptions.find((o) => o.value.toLowerCase() === (selectedWO || "").toLowerCase())?.value ?? selectedWO;

    return (
        <header className="app-header">
            <div className="header-left">
                <h1 className="header-title">{t("header.title")}</h1>
            </div>

            <div className="header-right">
                <span className="header-label">{t("header.targetWO")}</span>

                <Select
                    options={woOptions}
                    value={displayValue}
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
