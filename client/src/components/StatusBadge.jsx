const STATUS_STYLES = {
  HEALTHY: "bg-green-100 text-status-healthy",
  LOW: "bg-amber-100 text-status-low",
  CRITICAL: "bg-red-100 text-status-critical",
  OUT_OF_STOCK: "bg-red-200 text-status-out",
  LOW_PRIORITY: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-amber-100 text-status-low",
  HIGH: "bg-orange-100 text-orange-700",
};

const LABELS = {
  HEALTHY: "Healthy",
  LOW: "Low Stock",
  CRITICAL: "Critical",
  OUT_OF_STOCK: "Out of Stock",
  MEDIUM: "Medium",
  HIGH: "High",
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  const label = LABELS[status] || status;
  return <span className={`badge ${style}`}>{label}</span>;
};

export default StatusBadge;
