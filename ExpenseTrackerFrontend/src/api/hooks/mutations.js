import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";

export const useInvalidateExpenseData = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.drafts });
    queryClient.invalidateQueries({ queryKey: ["requests"] });
    queryClient.invalidateQueries({ queryKey: ["teamPending"] });
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };
};

export const useAppMutation = (mutationFn) => {
  const invalidate = useInvalidateExpenseData();
  return useMutation({
    mutationFn,
    onSuccess: invalidate
  });
};
