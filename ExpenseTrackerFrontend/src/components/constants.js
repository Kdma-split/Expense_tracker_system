export const REQUEST_STATUS = {
  Draft: 0,
  Submitted: 1,
  Approved: 2,
  Rejected: 3,
  Paid: 4
};

export const STATUS_LABEL = {
  0: "Draft",
  1: "Submitted",
  2: "Approved",
  3: "Rejected",
  4: "Paid"
};

export const STATUS_COLOR = {
  0: "default",    // Draft - Gray/Default
  1: "info",       // Submitted - Blue
  2: "success",    // Approved - Green
  3: "error",      // Rejected - Red
  4: "secondary"  // Paid - Dark Green / Teal
};
