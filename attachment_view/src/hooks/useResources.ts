import { useQuery } from "@tanstack/react-query";
import { resourceClient } from "../api/dataverseClient/resourceClient";

/** BookableResource（リソース）型定義 */
export type Resource = {
    id: string;
    name: string;
    number?: string;
};

/**
 * Dataverse の BookableResource 一覧を取得するフック
 * - React Query によりキャッシュ管理
 * - Dataverse 環境がない場合はモックデータ対応可能
 */
export const useResources = () => {
    const {
        data: resources,
        isLoading,
        isError,
    } = useQuery<Resource[]>({
        queryKey: ["resources"],
        queryFn: resourceClient.getResources,
        staleTime: Infinity, // 再フェッチ不要（固定データ）
    });

    return {
        /** リソース一覧 */
        resources: resources ?? [],
        /** ローディング状態 */
        isLoading,
        /** エラー状態 */
        isError,
    };
};
