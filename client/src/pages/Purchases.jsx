import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Trash2,
  ShoppingBag,
  PackageCheck,
  IndianRupee,
  Truck,
  CalendarDays,
} from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([
    { productId: "", quantity: 1, purchasePrice: "" },
  ]);

  const load = async () => {
    setLoading(true);

    try {
      const [purRes, prodRes, supRes] = await Promise.all([
        api.get("/purchases"),
        api.get("/products"),
        api.get("/suppliers"),
      ]);

      setPurchases(purRes.data.data);
      setProducts(prodRes.data.data);
      setSuppliers(supRes.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load purchase data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setSupplierId("");
    setItems([{ productId: "", quantity: 1, purchasePrice: "" }]);
    setModalOpen(true);
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", quantity: 1, purchasePrice: "" },
    ]);
  };

  const removeRow = (idx) => {
    if (items.length === 1) {
      toast.error("At least one item is required");
      return;
    }

    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplierId) {
      return toast.error("Select a supplier");
    }

    const validItems = items.filter(
      (i) =>
        i.productId &&
        Number(i.quantity) > 0 &&
        i.purchasePrice !== ""
    );

    if (validItems.length === 0) {
      return toast.error("Add at least one valid item");
    }

    try {
      await api.post("/purchases", {
        supplierId,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          purchasePrice: Number(i.purchasePrice),
        })),
      });

      toast.success("Purchase recorded — stock updated");
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to record purchase"
      );
    }
  };

  const totalPurchaseValue = purchases.reduce(
    (sum, p) => sum + Number(p.totalCost || 0),
    0
  );

  const totalItemsPurchased = purchases.reduce(
    (sum, p) =>
      sum +
      p.items.reduce(
        (itemSum, item) => itemSum + Number(item.quantity || 0),
        0
      ),
    0
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Purchases & Restocking
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Record purchases and automatically update inventory
          </p>
        </div>

        <button
          onClick={openAdd}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={17} />
          Record Purchase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <ShoppingBag
              size={21}
              className="text-primary-600"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Total Purchases
            </p>

            <p className="text-xl font-bold text-gray-800">
              {purchases.length}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
            <PackageCheck
              size={21}
              className="text-green-600"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Items Purchased
            </p>

            <p className="text-xl font-bold text-gray-800">
              {totalItemsPurchased}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
            <IndianRupee
              size={21}
              className="text-orange-600"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Total Purchase Value
            </p>

            <p className="text-xl font-bold text-gray-800">
              ₹{totalPurchaseValue.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

      </div>

      {/* Purchase Table */}
      <div className="card overflow-hidden p-0">

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            Loading purchases...
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState title="No purchases recorded yet" />
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-100">

                <tr>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Purchase
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Supplier
                  </th>

                  <th className="text-center px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Items
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Total Cost
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Recorded By
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {purchases.map((p) => (

                  <tr
                    key={p._id}
                    className="hover:bg-primary-50/30 transition-colors"
                  >

                    {/* Purchase number */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                          <ShoppingBag
                            size={18}
                            className="text-primary-600"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {p.purchaseNumber}
                          </p>

                          <p className="text-xs text-gray-400">
                            Purchase Order
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Date */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 text-gray-600">

                        <CalendarDays
                          size={14}
                          className="text-gray-400"
                        />

                        <span className="text-xs">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>

                      </div>

                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <Truck
                          size={15}
                          className="text-gray-400"
                        />

                        <span className="font-medium text-gray-700">
                          {p.supplier?.name || "—"}
                        </span>

                      </div>

                    </td>

                    {/* Items */}
                    <td className="px-5 py-4 text-center">

                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                        {p.items.length}
                      </span>

                    </td>

                    {/* Cost */}
                    <td className="px-5 py-4 text-right">

                      <span className="font-semibold text-gray-800">
                        ₹{Number(p.totalCost).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>

                    </td>

                    {/* User */}
                    <td className="px-5 py-4 text-gray-500">
                      {p.createdBy?.name || "—"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Add Purchase Modal */}
      {modalOpen && (

        <Modal
          title="Record New Purchase"
          onClose={() => setModalOpen(false)}
          wide
        >

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Supplier */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">

              <label className="block">

                <span className="text-xs font-semibold text-gray-600">
                  Supplier
                </span>

                <select
                  required
                  className="input-field mt-1.5"
                  value={supplierId}
                  onChange={(e) =>
                    setSupplierId(e.target.value)
                  }
                >

                  <option value="">
                    -- Select supplier --
                  </option>

                  {suppliers.map((s) => (
                    <option
                      key={s._id}
                      value={s._id}
                    >
                      {s.name}
                    </option>
                  ))}

                </select>

              </label>

            </div>

            {/* Items */}
            <div>

              <div className="flex items-center justify-between mb-2">

                <span className="text-xs font-semibold text-gray-600">
                  Purchase Items
                </span>

                <span className="text-xs text-gray-400">
                  {items.length} item row
                  {items.length !== 1 ? "s" : ""}
                </span>

              </div>

              <div className="space-y-3">

                {items.map((item, idx) => (

                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-200 bg-white"
                  >

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_140px_40px] gap-2 items-center">

                      {/* Product */}
                      <select
                        className="input-field"
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "productId",
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          -- Select Product --
                        </option>

                        {products.map((p) => (

                          <option
                            key={p._id}
                            value={p._id}
                          >
                            {p.name} ({p.sku})
                          </option>

                        ))}

                      </select>

                      {/* Quantity */}
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        className="input-field"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "quantity",
                            e.target.value
                          )
                        }
                      />

                      {/* Price */}
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Unit Price"
                        className="input-field"
                        value={item.purchasePrice}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "purchasePrice",
                            e.target.value
                          )
                        }
                      />

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="h-10 w-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                ))}

              </div>

              <button
                type="button"
                onClick={addRow}
                className="mt-3 flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-semibold"
              >
                <Plus size={15} />
                Add another item
              </button>

            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t">

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                <PackageCheck size={16} />
                Record Purchase
              </button>

            </div>

          </form>

        </Modal>

      )}

    </div>
  );
};

export default Purchases;