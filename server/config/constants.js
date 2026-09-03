// Central place for business-logic constants used by the replenishment engine.
// Keeping these in one file makes the formulas easy to explain in a viva.

module.exports = {
  ROLES: {
    ADMIN: "admin",
    STAFF: "staff",
  },

  STOCK_STATUS: {
    HEALTHY: "HEALTHY",
    LOW: "LOW",
    CRITICAL: "CRITICAL",
    OUT_OF_STOCK: "OUT_OF_STOCK",
  },

  TRANSACTION_TYPES: {
    SALE: "SALE",
    PURCHASE: "PURCHASE",
    RESTOCK: "RESTOCK",
    ADJUSTMENT: "ADJUSTMENT",
    RETURN: "RETURN",
  },

  PRIORITY: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
  },

  PAYMENT_METHODS: ["CASH", "UPI", "CARD"],

  // Defaults used by the replenishment engine when a product/supplier
  // doesn't specify its own lead time or safety days.
  DEFAULTS: {
    SAFETY_DAYS: Number(process.env.DEFAULT_SAFETY_DAYS) || 3,
    LEAD_TIME_DAYS: Number(process.env.DEFAULT_LEAD_TIME_DAYS) || 5,
    SALES_ANALYSIS_WINDOW_DAYS: Number(process.env.SALES_ANALYSIS_WINDOW_DAYS) || 30,
    MOVING_AVERAGE_WINDOW_DAYS: 7,
  },
};
