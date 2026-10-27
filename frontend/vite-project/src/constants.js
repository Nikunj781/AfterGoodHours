export const CATEGORIES = [
  { value: "beverages", label: "Beverages", emoji: "🥤" },
  { value: "snacks", label: "Snacks", emoji: "🍿" },
  { value: "fruits", label: "Fruits", emoji: "🍎" },
  { value: "instant-food", label: "Instant Food", emoji: "🍜" },
  { value: "stationery", label: "Stationery", emoji: "📚" },
  { value: "medicines", label: "Medicines", emoji: "💊" },
  { value: "electronics", label: "Electronics", emoji: "🔌" },
  { value: "miscellaneous", label: "Misc", emoji: "🛍️" },
];

export const CATEGORY_EMOJI = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.emoji]));

export const ORDER_STATUS = {
  pending_payment: { label: "Awaiting payment", className: "badge-muted" },
  paid: { label: "Paid", className: "badge-info" },
  ready_for_pickup: { label: "Ready for pickup", className: "badge-warn" },
  completed: { label: "Completed", className: "badge-ok" },
  cancelled: { label: "Cancelled", className: "badge-danger" },
};
