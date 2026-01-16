/**
 * モーダル関連のアクション管理フック
 * 各モーダルの開閉と保存処理を管理
 */
export const useModalActions = (
    setIsFavoriteTaskModalOpen: (open: boolean) => void,
    setIsUserListModalOpen: (open: boolean) => void
) => {
    /** お気に入りタスク保存 */
    const handleSaveFavoriteTasks = (tasks: string[]) => {
        console.log("保存されたお気に入りタスク:", tasks);
        setIsFavoriteTaskModalOpen(false);
    };

    /** ユーザーリスト保存 */
    const handleSaveUserList = (users: string[]) => {
        console.log("保存されたユーザー一覧:", users);
        setIsUserListModalOpen(false);
    };

    return {
        handleSaveFavoriteTasks,
        handleSaveUserList,
    };
};
