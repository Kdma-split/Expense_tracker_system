export const REQUEST_STATUS = {
  Submitted: 1,
  Approved: 2,
  Rejected: 3,
  Paid: 4,
  OnHold: 5
};

export const STATUS_LABEL = {
  1: "Submitted",
  2: "Approved",
  3: "Rejected",
  4: "Paid",
  5: "On Hold"
};

export const STATUS_COLOR = {
  1: "info",       // Submitted - Blue
  2: "success",    // Approved - Green
  3: "error",      // Rejected - Red
  4: "secondary",  // Paid - Dark Green / Teal
  5: "warning"     // On Hold - Amber
};

export const FINANCE_STATUS = {
  Pending: 0,
  Paid: 1,
  Rejected: 2,
  OnHold: 3
};
