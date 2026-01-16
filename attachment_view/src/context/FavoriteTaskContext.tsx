import React, { createContext, useContext, useState, type ReactNode } from "react";

/** お気に入りタスク情報の型 */
export type FavoriteTask = {
    id: string;
    subcategoryName: string;
    taskName: string;
};

/** コンテキスト型定義 */
export type FavoriteTaskContextType = {
    /** お気に入りタスク一覧 */
    favoriteTasks: FavoriteTask[];
    /** お気に入りタスクの更新関数 */
    setFavoriteTasks: (tasks: FavoriteTask[]) => void;
};

/** Context本体（初期値: undefined） */
const FavoriteTaskContext = createContext<FavoriteTaskContextType | undefined>(undefined);

/**
 * お気に入りタスク情報をアプリ全体で共有するProvider
 * - favoriteTasks: お気に入りタスク一覧
 * - setFavoriteTasks: 更新関数
 */
export const FavoriteTaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favoriteTasks, setFavoriteTasks] = useState<FavoriteTask[]>([]);

    return (
        <FavoriteTaskContext.Provider value={{ favoriteTasks, setFavoriteTasks }}>
            {children}
        </FavoriteTaskContext.Provider>
    );
};

/**
 * お気に入りタスク情報を利用するためのカスタムフック
 * - Provider配下でのみ使用可能
 */
export const useFavoriteTasks = (): FavoriteTaskContextType => {
    const context = useContext(FavoriteTaskContext);
    if (!context) {
        throw new Error("useFavoriteTasks は FavoriteTaskProvider 内でのみ使用できます。");
    }
    return context;
};
