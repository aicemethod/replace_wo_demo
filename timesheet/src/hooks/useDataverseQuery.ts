import { useQuery } from "@tanstack/react-query"
import { fetchDataverse } from "../services/dataverse"

// 一覧キャッシュのキー。
export const buildDataverseListQueryKey = (
    entityLogicalName: string,
    query?: string
) => ["dataverse", entityLogicalName, query] as const

export const useDataverseQuery = <T>(
    entityLogicalName: string,
    query?: string,
    enabled: boolean = true
): ReturnType<typeof useQuery<T[], Error>> => {
    // 一覧取得用の共通フック。
    return useQuery({
        queryKey: buildDataverseListQueryKey(entityLogicalName, query),
        queryFn: () => fetchDataverse<T>(entityLogicalName, query),
        enabled,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false
    })
}
