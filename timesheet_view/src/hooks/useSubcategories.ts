import { useQuery } from "@tanstack/react-query";
import { dataverseClient } from "../api/dataverseClient";
import type { SubCategory } from "../api/dataverseClient/subcategoryClient";

export const useSubcategories = () => {
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useQuery<SubCategory[]>({
        queryKey: ["subcategories"],
        queryFn: async () => {
            const result = await dataverseClient.getSubcategories();
            return Array.isArray(result) ? result : [];
        },
    });

    return {
        subcategories: data,
        isLoading,
        isError,
        refetchSubcategories: refetch,
    };
};
