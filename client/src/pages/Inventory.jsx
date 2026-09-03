import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PackagePlus,
  Boxes,
  AlertTriangle,
  PackageX,
  Search,
  X,
} from "lucide-react";

import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const Inventory = () => {
  const { isAdmin } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [adjustProduct, setAdjustProduct] = useState(null);
  const [qty, setQty] = useState("");
  const [type, setType] = useState("ADJUSTMENT");
  const [note, setNote] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory");
      setItems(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load inventory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdjust = (p) => {
    setAdjustProduct(p);
    setQty("");
    setType("ADJUSTMENT");
    setNote("");
  };

  const submitAdjust = async (e) => {
    e.preventDefault();

    if (!qty || Number(qty) === 0) {
      return toast.error("Enter a non-zero quantity");
    }

    try {
      await api.post("/inventory/adjust", {
        productId: adjustProduct._id,
        quantity: Number(qty),
        transactionType: type,
        note,
      });

      toast.success("Stock updated successfully");
      setAdjustProduct(null);
      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Adjustment failed"
      );
    }
  };

  const filteredItems = items.filter((item) => {
    const text = `${item.name} ${item.sku} ${
      item.supplier?.name || ""
    }`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const total = items.length;

  const lowStock = items.filter(
    (p) =>
      p.stockStatus === "LOW" ||
      p.stockStatus === "CRITICAL"
  ).length;

  const outOfStock = items.filter(
    (p) => p.stockStatus === "OUT_OF_STOCK"
  ).length;

  return (
    <div className="space-y-6 pb-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Boxes size={14} />
            Stock Control
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Inventory
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor stock levels and manage inventory movements.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-600">
            Inventory Live
          </span>
        </div>

      </div>


      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <SummaryCard
          title="Total Items"
          value={total}
          icon={Boxes}
          bg="bg-blue-50"
          color="text-blue-600"
        />

        <SummaryCard
          title="Low Stock"
          value={lowStock}
          icon={AlertTriangle}
          bg="bg-amber-50"
          color="text-amber-600"
        />

        <SummaryCard
          title="Out of Stock"
          value={outOfStock}
          icon={PackageX}
          bg="bg-red-50"
          color="text-red-600"
        />

      </div>


      {/* SEARCH */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search product, SKU or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-sm"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}

        </div>

      </div>


      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

          <div>
            <h2 className="font-bold text-gray-800">
              Inventory Overview
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              {filteredItems.length} items displayed
            </p>
          </div>

        </div>


        <div className="overflow-x-auto">

          {loading ? (

            <div className="py-20 text-center">

              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />

              <p className="text-sm text-gray-400">
                Loading inventory...
              </p>

            </div>

          ) : filteredItems.length === 0 ? (

            <EmptyState
              title="No inventory items found"
              subtitle="Try changing your search"
            />

          ) : (

            <table className="w-full text-sm">

              <thead>

                <tr className="bg-slate-50 border-b border-gray-100">

                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Product
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    SKU
                  </th>

                  <th className="text-right px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Current Qty
                  </th>

                  <th className="text-right px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Minimum
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Supplier
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Status
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Restocked
                  </th>

                  {isAdmin && (
                    <th className="text-right px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                      Action
                    </th>
                  )}

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {filteredItems.map((p) => (

                  <tr
                    key={p._id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >

                    {/* PRODUCT */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center">
                          <Boxes size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {p.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {p.unit}
                          </p>
                        </div>

                      </div>

                    </td>


                    {/* SKU */}
                    <td className="px-5 py-4">

                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        {p.sku}
                      </span>

                    </td>


                    {/* CURRENT */}
                    <td className="px-5 py-4 text-right">

                      <span
                        className={`text-base font-bold ${
                          p.stockStatus === "OUT_OF_STOCK"
                            ? "text-red-600"
                            : p.stockStatus === "CRITICAL"
                            ? "text-red-500"
                            : p.stockStatus === "LOW"
                            ? "text-amber-600"
                            : "text-gray-800"
                        }`}
                      >
                        {p.currentStock}
                      </span>

                      <span className="text-xs text-gray-400 ml-1">
                        {p.unit}
                      </span>

                    </td>


                    {/* MIN */}
                    <td className="px-5 py-4 text-right text-gray-600 font-medium">
                      {p.minimumStock}
                    </td>


                    {/* SUPPLIER */}
                    <td className="px-5 py-4 text-gray-500">
                      {p.supplier?.name || "—"}
                    </td>


                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <StatusBadge status={p.stockStatus} />
                    </td>


                    {/* RESTOCKED */}
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {p.lastRestockedAt
                        ? new Date(
                            p.lastRestockedAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>


                    {/* ACTION */}
                    {isAdmin && (

                      <td className="px-5 py-4 text-right">

                        <button
                          onClick={() => openAdjust(p)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-xs transition"
                        >
                          <PackagePlus size={15} />
                          Adjust
                        </button>

                      </td>

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>


      {/* ADJUST MODAL */}
      {adjustProduct && (

        <Modal
          title={`Adjust Stock — ${adjustProduct.name}`}
          onClose={() => setAdjustProduct(null)}
        >

          <form
            onSubmit={submitAdjust}
            className="space-y-5"
          >

            {/* CURRENT STOCK */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider">
                Current Stock
              </p>

              <p className="text-2xl font-bold text-blue-700 mt-1">
                {adjustProduct.currentStock}
                <span className="text-sm ml-1">
                  {adjustProduct.unit}
                </span>
              </p>

            </div>


            {/* TYPE */}
            <label className="block">

              <span className="text-xs font-semibold text-gray-500">
                Transaction Type
              </span>

              <select
                className="input-field mt-1.5"
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
              >
                <option value="ADJUSTMENT">
                  Adjustment
                </option>

                <option value="RESTOCK">
                  Restock
                </option>

                <option value="RETURN">
                  Return
                </option>
              </select>

            </label>


            {/* QUANTITY */}
            <label className="block">

              <span className="text-xs font-semibold text-gray-500">
                Quantity
              </span>

              <input
                type="number"
                className="input-field mt-1.5"
                value={qty}
                onChange={(e) =>
                  setQty(e.target.value)
                }
                placeholder="Example: 20 or -5"
              />

              <p className="text-[11px] text-gray-400 mt-1">
                Use a negative value to remove stock.
              </p>

            </label>


            {/* NOTE */}
            <label className="block">

              <span className="text-xs font-semibold text-gray-500">
                Note
              </span>

              <input
                className="input-field mt-1.5"
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                placeholder="Optional note..."
              />

            </label>


            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  setAdjustProduct(null)
                }
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
              >
                Apply Adjustment
              </button>

            </div>

          </form>

        </Modal>

      )}

    </div>
  );
};


const SummaryCard = ({
  title,
  value,
  icon: Icon,
  bg,
  color,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-400">
          {title}
        </p>

        <p className="text-2xl font-bold text-gray-900 mt-2">
          {value}
        </p>
      </div>

      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} ${color}`}
      >
        <Icon size={21} />
      </div>

    </div>

  </div>
);

export default Inventory;