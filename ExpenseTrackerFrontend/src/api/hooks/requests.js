import { useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "../client";
import { queryKeys } from "../queryKeys";

export const useRequestsQuery = (params, enabled = true) =>
  useQuery({
    queryKey: queryKeys.requests(params),
    queryFn: async () =>
      (
        await api.get(
          `/requests?${toQueryString({
            FromDate: params?.fromDate,
            ToDate: params?.toDate,
            Status: params?.status,
            EmployeeId: params?.employeeId,
            SortBy: params?.sortBy,
            SortOrder: params?.sortOrder,
            PageNumber: params?.pageNumber,
            PageSize: params?.pageSize
          })}`
        )
      ).data || { items: [] },
    enabled
  });

export const useTeamPendingQuery = (params) =>
  useQuery({
    queryKey: queryKeys.teamPending(params),
    queryFn: async () =>
      (
        await api.get(
          `/requests/team-pending?${toQueryString({
            FromDate: params?.fromDate,
            ToDate: params?.toDate,
            Status: params?.status,
            EmployeeId: params?.employeeId,
            SortBy: params?.sortBy,
            SortOrder: params?.sortOrder,
            PageNumber: params?.pageNumber,
            PageSize: params?.pageSize
          })}`
        )
      ).data || { items: [] }
  });
