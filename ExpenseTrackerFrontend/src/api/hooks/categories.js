import { useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "../client";
import { queryKeys } from "../queryKeys";

export const useCategoriesQuery = (includeInactive = false, enabled = true) =>
  useQuery({
    queryKey: queryKeys.categories(includeInactive),
    queryFn: async () => (await api.get(`/categories?${toQueryString({ includeInactive })}`)).data || [],
    enabled
  });
