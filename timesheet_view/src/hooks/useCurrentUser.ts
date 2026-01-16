import { useQuery } from "@tanstack/react-query";
import { userClient } from "../api/dataverseClient/userClient";

/** 現在のユーザー情報の型 */
export type CurrentUser = {
    id: string;
    firstName: string;
    lastName: string;
    employeeid?: string;
    email?: string;
};

/**
 * 現在ログイン中の Dataverse ユーザーを取得するカスタムフック
 * - React Query によるキャッシュ管理を利用
 */
export const useCurrentUser = () => {
    const {
        data: currentUser,
        isLoading,
        isError,
    } = useQuery<CurrentUser>({
        queryKey: ["currentUser"],
        queryFn: userClient.getCurrentUser,
        staleTime: Infinity, // データを永続キャッシュ（再フェッチ不要）
    });

    return { currentUser, isLoading, isError };
};
