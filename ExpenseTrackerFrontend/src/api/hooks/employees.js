import { useQuery } from "@tanstack/react-query";
import { api, toQueryString } from "../client";
import { queryKeys } from "../queryKeys";

export const useEmployeesQuery = (includeInactive = true) =>
  useQuery({
    queryKey: queryKeys.employees(includeInactive),
    queryFn: async () => (await api.get(`/admin/employees?${toQueryString({ includeInactive })}`)).data || []
  });

export const useEmployeeByIdQuery = (id, enabled) =>
  useQuery({
    queryKey: queryKeys.employeeById(id),
    queryFn: async () => (await api.get(`/admin/employees/${id}`)).data,
    enabled
  });
