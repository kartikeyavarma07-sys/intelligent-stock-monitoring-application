import { useEffect, useState } from "react";
import api from "../services/api";
import EmptyState from "../components/EmptyState";

const TYPE_COLORS = {
  SALE: "text-red-600",
  PURCHASE: "text-green-600",
  RESTOCK: "text-green-600",
  ADJUSTMENT: "text-amber-600",
  RETURN: "text-blue-600",
};

const InventoryHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (typeFilter) params.type = typeFilter;
    const res = await api.get("/inventory/transactions", { params });
    setTransactions(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [typeFilter]); // eslint-disable-line

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Inventory History</h1>
        <select className="input-field w-48" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="SALE">Sale</option>
          <option value="PURCHASE">Purchase</option>
          <option value="RESTOCK">Restock</option>
          <option value="ADJUSTMENT">Adjustment</option>
          <option value="RETURN">Return</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="py-14 text-center text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions yet" />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Qty Change</th>
                <th className="text-right px-4 py-3">Prev → New</th>
                <th className="text-left px-4 py-3">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{t.product?.name}</td>
                  <td className={`px-4 py-3 font-medium ${TYPE_COLORS[t.transactionType]}`}>{t.transactionType}</td>
                  <td className="px-4 py-3 text-right">{t.quantity > 0 ? `+${t.quantity}` : t.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{t.previousStock} → {t.newStock}</td>
                  <td className="px-4 py-3 text-gray-500">{t.createdBy?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;
