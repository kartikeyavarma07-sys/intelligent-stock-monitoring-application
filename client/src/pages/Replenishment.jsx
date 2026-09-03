import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, ShoppingCart, AlertTriangle } from "lucide-react";
import api from "../services/api";

const Replenishment = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/replenishment");
      setItems(res.data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load replenishment data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Replenishment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor products that need restocking.
          </p>
        </div>

        <button
          onClick={load}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Info */}
      <div className="card bg-orange-50 border border-orange-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-orange-600 mt-0.5" size={20} />
          <div>
            <h2 className="font-semibold text-orange-800">
              Smart Replenishment
            </h2>
            <p className="text-sm text-orange-700 mt-1">
              Products below their recommended stock level are shown here
              for restocking decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        {loading ? (
          <div className="py-14 text-center text-gray-400">
            Loading replenishment data...
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center">
            <ShoppingCart
              size={35}
              className="mx-auto text-gray-300 mb-3"
            />
            <p className="font-medium text-gray-600">
              No replenishment required
            </p>
            <p className="text-sm text-gray-400 mt-1">
              All products currently have sufficient stock.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-right px-4 py-3">Current Stock</th>
                <th className="text-right px-4 py-3">Minimum Stock</th>
                <th className="text-right px-4 py-3">
                  Recommended Order
                </th>
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-left px-4 py-3">Priority</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-orange-50/40"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {item.product?.name || item.name}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {item.product?.sku || item.sku || "—"}
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-red-600">
                    {item.currentStock ?? 0}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {item.minimumStock ?? 0}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-primary-600">
                    {item.recommendedOrderQty ??
                      item.recommendedQuantity ??
                      0}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {item.supplier?.name || "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === "CRITICAL"
                          ? "bg-red-100 text-red-700"
                          : item.priority === "HIGH"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.priority || "NORMAL"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Replenishment;