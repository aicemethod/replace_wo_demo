// Xrm.WebApi の存在確認を共通化する。
const getWebApi = () => {
    if (!Xrm?.WebApi) {
        throw new Error("Xrm.WebApiが使えません。")
    }

    return Xrm.WebApi
}

export const fetchDataverse = async <T>(
    entityLogicalName: string,
    query?: string,
    maxPageSize?: number
): Promise<T[]> => {
    // 条件付きで複数レコードを取得する。
    const webApi = getWebApi()
    const result = await webApi.retrieveMultipleRecords<T>(
        entityLogicalName,
        query ?? "",
        maxPageSize
    )

    return result.entities
}
