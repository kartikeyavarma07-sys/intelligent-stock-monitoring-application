import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Boxes,
  AlertTriangle,
  X,
} from "lucide-react";

import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  costPrice: "",
  currentStock: "",
  minimumStock: "",
  reorderQuantity: "",
  unit: "pcs",
  supplier: "",
};

const Products = () => {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);

      const params = {};

      if (search) params.search = search;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const [prodRes, supRes, catRes] = await Promise.all([
        api.get("/products", { params }),
        api.get("/suppliers"),
        api.get("/products/meta/categories"),
      ]);

      setProducts(prodRes.data.data);
      setSuppliers(supRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);

    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      description: p.description || "",
      price: p.price,
      costPrice: p.costPrice,
      currentStock: p.currentStock,
      minimumStock: p.minimumStock,
      reorderQuantity: p.reorderQuantity,
      unit: p.unit,
      supplier: p.supplier?._id || "",
    });

    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      costPrice: Number(form.costPrice),
      currentStock: Number(form.currentStock),
      minimumStock: Number(form.minimumStock),
      reorderQuantity: Number(form.reorderQuantity),
      supplier: form.supplier || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", payload);
        toast.success("Product added successfully");
      }

      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Save failed"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Delete failed"
      );
    }
  };

  const totalProducts = products.length;

  const lowStock = products.filter(
    (p) =>
      p.stockStatus === "LOW" ||
      p.stockStatus === "CRITICAL"
  ).length;

  const outOfStock = products.filter(
    (p) => p.stockStatus === "OUT_OF_STOCK"
  ).length;

  return (
    <div className="space-y-6 pb-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Package size={14} />
            Inventory Management
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Products
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage products, pricing and stock information.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} />
            Add Product
          </button>
        )}

      </div>


      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <SummaryCard
          title="Products"
          value={totalProducts}
          icon={Package}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Low Stock"
          value={lowStock}
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="Out of Stock"
          value={outOfStock}
          icon={Boxes}
          iconClass="bg-red-50 text-red-600"
        />

      </div>


      {/* FILTER BAR */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">

        <div className="flex items-center gap-2 mb-4">
          <Search size={17} className="text-blue-600" />

          <div>
            <h2 className="text-sm font-bold text-gray-800">
              Search & Filter
            </h2>

            <p className="text-xs text-gray-400">
              Find products quickly
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* SEARCH */}
          <div className="relative md:col-span-1">

            <Search
              size={17}
              className="absolute left-3 top-3 text-gray-400"
            />

            <input
              className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-sm"
              placeholder="Search name, SKU, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>


          {/* CATEGORY */}
          <select
            className="h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none text-sm text-gray-600"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="all">
              All Categories
            </option>

            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>


          {/* STATUS */}
          <select
            className="h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 outline-none text-sm text-gray-600"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">
              All Stock Status
            </option>

            <option value="HEALTHY">
              Healthy
            </option>

            <option value="LOW">
              Low Stock
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="OUT_OF_STOCK">
              Out of Stock
            </option>
          </select>

        </div>

      </div>


      {/* PRODUCT TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

          <div>
            <h2 className="font-bold text-gray-800">
              Product Inventory
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              {products.length} products displayed
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Live inventory
          </div>

        </div>


        <div className="overflow-x-auto">

          {loading ? (

            <div className="py-20 text-center">

              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />

              <p className="text-sm text-gray-400">
                Loading products...
              </p>

            </div>

          ) : products.length === 0 ? (

            <EmptyState
              title="No products found"
              subtitle="Try adjusting your search or filters"
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

                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Category
                  </th>

                  <th className="text-right px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Price
                  </th>

                  <th className="text-right px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Stock
                  </th>

                  <th className="text-left px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                    Status
                  </th>

                  {isAdmin && (
                    <th className="text-right px-5 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                      Actions
                    </th>
                  )}

                </tr>
              </thead>


              <tbody className="divide-y divide-gray-100">

                {products.map((p) => (

                  <tr
                    key={p._id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >

                    {/* PRODUCT */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center">
                          <Package size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {p.name}
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5">
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


                    {/* CATEGORY */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium">
                        {p.category}
                      </span>
                    </td>


                    {/* PRICE */}
                    <td className="px-5 py-4 text-right">

                      <span className="font-semibold text-gray-800">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>

                    </td>


                    {/* STOCK */}
                    <td className="px-5 py-4 text-right">

                      <span className="font-bold text-gray-800">
                        {p.currentStock}
                      </span>

                      <span className="text-xs text-gray-400 ml-1">
                        {p.unit}
                      </span>

                    </td>


                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <StatusBadge status={p.stockStatus} />
                    </td>


                    {/* ACTIONS */}
                    {isAdmin && (

                      <td className="px-5 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() => openEdit(p)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(p._id)
                            }
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </td>

                    )}

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>


      {/* MODAL */}
      {modalOpen && (

        <Modal
          title={
            editingId
              ? "Edit Product"
              : "Add Product"
          }
          onClose={() => setModalOpen(false)}
          wide
        >

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Field label="Product Name">
                <input
                  required
                  className="input-field"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="SKU">
                <input
                  required
                  className="input-field"
                  value={form.sku}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sku: e.target.value,
                    })
                  }
                  disabled={!!editingId}
                />
              </Field>

              <Field label="Category">
                <input
                  required
                  className="input-field"
                  value={form.category}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Unit">
                <input
                  className="input-field"
                  value={form.unit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Selling Price (₹)">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Cost Price (₹)">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      costPrice: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Current Stock">
                <input
                  required
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.currentStock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentStock: e.target.value,
                    })
                  }
                  disabled={!!editingId}
                />
              </Field>

              <Field label="Minimum Stock">
                <input
                  required
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.minimumStock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minimumStock: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Reorder Quantity">
                <input
                  required
                  type="number"
                  min="1"
                  className="input-field"
                  value={form.reorderQuantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reorderQuantity: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Supplier">

                <select
                  className="input-field"
                  value={form.supplier}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      supplier: e.target.value,
                    })
                  }
                >

                  <option value="">
                    -- None --
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

              </Field>

            </div>


            <Field label="Description">

              <textarea
                className="input-field"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

            </Field>


            {editingId && (

              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">

                <AlertTriangle
                  size={18}
                  className="text-amber-500 mt-0.5"
                />

                <p className="text-xs text-amber-700">
                  Stock quantity can't be edited here.
                  Use the Inventory page to adjust or
                  restock inventory.
                </p>

              </div>

            )}


            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition"
              >
                {editingId
                  ? "Save Changes"
                  : "Add Product"}
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
  iconClass,
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">

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
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
      >
        <Icon size={21} />
      </div>

    </div>

  </div>
);


const Field = ({ label, children }) => (
  <label className="block">

    <span className="text-xs font-semibold text-gray-500">
      {label}
    </span>

    <div className="mt-1.5">
      {children}
    </div>

  </label>
);

export default Products;