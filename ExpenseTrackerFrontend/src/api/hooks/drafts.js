import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { queryKeys } from "../queryKeys";

export const useDraftsQuery = () =>
  useQuery({
    queryKey: queryKeys.drafts,
    queryFn: async () => (await api.get("/drafts")).data || []
  });
