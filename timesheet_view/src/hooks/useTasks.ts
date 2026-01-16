import { useQuery } from "@tanstack/react-query";
import { dataverseClient } from "../api/dataverseClient";
import type { Task } from "../api/dataverseClient/taskClient";

export const useTasks = () => {
    const {
        data = [],
        isLoading,
        isError,
        refetch,
    } = useQuery<Task[]>({
        queryKey: ["tasks"],
        queryFn: async () => {
            const result = await dataverseClient.getTasks();
            return Array.isArray(result) ? result : [];
        },
    });

    return {
        tasks: data,
        isLoading,
        isError,
        refetchTasks: refetch,
    };
};
