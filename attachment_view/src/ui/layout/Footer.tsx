import * as FaIcons from "react-icons/fa";
import { Button } from "../components/Button";
import "../styles/layout/Footer.css";
import { useTranslation } from "react-i18next";

/** Footer コンポーネントの Props 型 */
export type FooterProps = {
    /** ユーザー一覧設定モーダルを開く */
    onOpenUserList: () => void;

    /** お気に入り間接タスク設定モーダルを開く */
    onOpenFavoriteTask: () => void;
};

/**
 * アプリ下部のフッター
 * - 各種設定ボタンを配置（ユーザー設定・お気に入りタスク設定）
 * - 将来的なメニュー拡張用の「その他」ボタンを右側に配置
 */
export const Footer: React.FC<FooterProps> = ({
    onOpenUserList,
    onOpenFavoriteTask,
}) => {
    const { t } = useTranslation();

    return (
        <footer className="content-bottom">
            {/* =============================
          左側：設定関連ボタン
      ============================= */}
            <div className="content-bottom-left">
                <Button
                    label={t("footer.userListSetting")}
                    color="secondary"
                    icon={<FaIcons.FaUser />}
                    onClick={onOpenUserList}
                    className="footer-button"
                />
                <Button
                    label={t("footer.favoriteTaskSetting")}
                    color="secondary"
                    icon={<FaIcons.FaStar />}
                    onClick={onOpenFavoriteTask}
                    className="footer-button"
                />
            </div>

            {/* =============================
          右側：その他メニューボタン
      ============================== */}
            {/* <div className="content-bottom-right">
                <button
                    className="menu-button"
                    title={t("footer.more")}
                    onClick={() => console.log("メニューを開く処理（未実装）")}
                >
                    <FaIcons.FaEllipsisV />
                </button>
            </div> */}
        </footer>
    );
};
