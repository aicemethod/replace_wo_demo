import { useQuery } from "@tanstack/react-query";
import { dataverseClient } from "../api/dataverseClient";

/** WorkOrder 型定義 */
export interface WorkOrder {
    id: string;
    name: string;
}

/**
 * WorkOrder 一覧を取得するカスタムフック
 * - Dataverse から WorkOrder データを取得
 * - React Query によりキャッシュ・再取得を管理
 */
export const useWorkOrders = () => {
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useQuery<WorkOrder[]>({
        queryKey: ["workOrders"],
        queryFn: async () => {
            const result = await dataverseClient.getWorkOrders();
            return Array.isArray(result) ? result : [];
        },
    });

    return {
        /** 取得した WorkOrder 一覧（データが未取得時は空配列） */
        workOrders: data,
        isLoading,
        isError,
        refetchWorkOrders: refetch,
    };
};
