import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Truck, Search, Users, Clock } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

const emptyForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  leadTimeDays: 5,
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s._id);
    setForm({
      name: s.name,
      contactPerson: s.contactPerson || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      leadTimeDays: s.leadTimeDays,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        leadTimeDays: Number(form.leadTimeDays),
      };

      if (editingId) {
        await api.put(`/suppliers/${editingId}`, payload);
        toast.success("Supplier updated successfully");
      } else {
        await api.post("/suppliers", payload);
        toast.success("Supplier added successfully");
      }

      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this supplier?")) return;

    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    `${s.name} ${s.contactPerson || ""} ${s.email || ""} ${s.phone || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const averageLeadTime =
    suppliers.length > 0
      ? Math.round(
          suppliers.reduce((sum, s) => sum + Number(s.leadTimeDays || 0), 0) /
            suppliers.length
        )
      : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Suppliers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your suppliers and delivery information
          </p>
        </div>

        <button
          onClick={openAdd}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={17} />
          Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
            <Truck size={21} className="text-primary-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Total Suppliers</p>
            <p className="text-xl font-bold text-gray-800">
              {suppliers.length}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users size={21} className="text-blue-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Active Contacts</p>
            <p className="text-xl font-bold text-gray-800">
              {suppliers.filter((s) => s.contactPerson).length}
            </p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
            <Clock size={21} className="text-orange-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Avg. Lead Time</p>
            <p className="text-xl font-bold text-gray-800">
              {averageLeadTime} days
            </p>
          </div>
        </div>

      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            className="input-field pl-10"
            placeholder="Search suppliers, contacts, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            Loading suppliers...
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <EmptyState title="No suppliers found" />
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Supplier
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Contact
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Phone
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Email
                  </th>

                  <th className="text-center px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Lead Time
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredSuppliers.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-primary-50/30 transition-colors"
                  >

                    {/* Supplier */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                          <Truck
                            size={18}
                            className="text-primary-600"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {s.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            Supplier
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 text-gray-600">
                      {s.contactPerson || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-gray-600">
                      {s.phone || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-gray-600">
                      {s.email || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Lead time */}
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                        {s.leadTimeDays} days
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(s._id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={editingId ? "Edit Supplier" : "Add Supplier"}
          onClose={() => setModalOpen(false)}
        >

          <form onSubmit={handleSubmit} className="space-y-4">

            <Field label="Supplier Name">
              <input
                required
                className="input-field"
                placeholder="Enter supplier name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </Field>

            <Field label="Contact Person">
              <input
                className="input-field"
                placeholder="Contact person name"
                value={form.contactPerson}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contactPerson: e.target.value,
                  })
                }
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <Field label="Phone">
                <input
                  className="input-field"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </Field>

            </div>

            <Field label="Address">
              <textarea
                className="input-field"
                rows={2}
                placeholder="Supplier address"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />
            </Field>

            <Field label="Lead Time (days)">
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.leadTimeDays}
                onChange={(e) =>
                  setForm({
                    ...form,
                    leadTimeDays: e.target.value,
                  })
                }
              />
            </Field>

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
                className="btn-primary"
              >
                {editingId ? "Save Changes" : "Add Supplier"}
              </button>
            </div>

          </form>

        </Modal>
      )}

    </div>
  );
};

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

export default Suppliers;