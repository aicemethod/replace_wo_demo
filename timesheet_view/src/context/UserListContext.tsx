import React, { createContext, useContext, useState, type ReactNode } from "react";

/** 許可済みユーザー管理の型定義 */
export type AllowedUserContextType = {
    /** 許可済みユーザーID一覧 */
    allowedUsers: string[];
    /** 許可ユーザーの更新関数 */
    setAllowedUsers: (users: string[]) => void;
};

/** Context本体（初期値: undefined） */
const UserListContext = createContext<AllowedUserContextType | undefined>(undefined);

/**
 * 許可ユーザー情報をアプリ全体で共有するProvider
 * - allowedUsers: 許可されたユーザーID一覧
 * - setAllowedUsers: 許可リストの更新関数
 */
export const UserListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [allowedUsers, setAllowedUsers] = useState<string[]>([]);

    return (
        <UserListContext.Provider value={{ allowedUsers, setAllowedUsers }}>
            {children}
        </UserListContext.Provider>
    );
};

/**
 * 許可ユーザー情報を利用するためのカスタムフック
 * - Provider配下でのみ使用可能
 */
export const useAllowedUsers = (): AllowedUserContextType => {
    const context = useContext(UserListContext);
    if (!context) {
        throw new Error("useAllowedUsers は UserListProvider 内でのみ使用できます。");
    }
    return context;
};
