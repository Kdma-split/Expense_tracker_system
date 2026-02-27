export const queryKeys = {
  drafts: ["drafts"],
  requests: (params = {}) => ["requests", params],
  teamPending: (params = {}) => ["teamPending", params],
  categories: (includeInactive = false) => ["categories", includeInactive],
  employees: (includeInactive = true) => ["employees", includeInactive],
  employeeById: (id) => ["employeeById", id]
};
