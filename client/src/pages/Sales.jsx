import { useEffect, useState } from "react";
import { Search, Eye, Receipt, ShoppingBag, CreditCard } from "lucide-react";
import api from "../services/api";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const load = async () => {
    setLoading(true);

    try {
      const res = await api.get("/sales", {
        params: search ? { search } : {},
      });

      setSales(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const paymentIcon = (method) => {
    if (method === "UPI") return "📱";
    if (method === "CARD") return "💳";
    return "💵";
  };

  return (
    <div className="space-y-6 pb-8">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <Receipt size={14} />
          Transaction Management
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Sales
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View and manage all completed sales transactions.
        </p>
      </div>


      {/* SEARCH */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

        <div className="flex items-center gap-3 mb-4">

          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Search size={18} />
          </div>

          <div>
            <h2 className="font-bold text-gray-800">
              Find Transaction
            </h2>

            <p className="text-xs text-gray-400">
              Search by invoice number or customer name
            </p>
          </div>

        </div>

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3.5 text-gray-400"
          />

          <input
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-sm"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>


      {/* SALES TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

          <div>
            <h2 className="font-bold text-gray-800">
              Sales Transactions
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              {sales.length} transaction
              {sales.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag size={17} />
          </div>

        </div>


        {loading ? (

          <div className="py-16 text-center">

            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />

            <p className="text-sm text-gray-400">
              Loading sales...
            </p>

          </div>

        ) : sales.length === 0 ? (

          <div className="py-10">
            <EmptyState title="No sales recorded yet" />
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-50">

                <tr>

                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    Invoice
                  </th>

                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    Date
                  </th>

                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    Items
                  </th>

                  <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    Total
                  </th>

                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    Payment
                  </th>

                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    Created By
                  </th>

                  <th className="text-center px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                    View
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-gray-100">

                {sales.map((s) => (

                  <tr
                    key={s._id}
                    className="hover:bg-blue-50/30 transition"
                  >

                    {/* INVOICE */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Receipt size={16} />
                        </div>

                        <div>
                          <p className="font-bold text-gray-800">
                            {s.invoiceNumber}
                          </p>

                          <p className="text-[10px] text-gray-400">
                            Invoice
                          </p>
                        </div>

                      </div>

                    </td>


                    {/* DATE */}
                    <td className="px-5 py-4">

                      <p className="text-gray-700 text-xs font-medium">
                        {new Date(
                          s.createdAt
                        ).toLocaleDateString()}
                      </p>

                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(
                          s.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                    </td>


                    {/* CUSTOMER */}
                    <td className="px-5 py-4">

                      <p className="font-medium text-gray-700">
                        {s.customerName || "Walk-in Customer"}
                      </p>

                    </td>


                    {/* ITEMS */}
                    <td className="px-5 py-4 text-center">

                      <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-lg bg-gray-100 text-gray-600 font-semibold text-xs">
                        {s.items.length}
                      </span>

                    </td>


                    {/* TOTAL */}
                    <td className="px-5 py-4 text-right">

                      <span className="font-bold text-gray-900">
                        ₹{s.total.toFixed(2)}
                      </span>

                    </td>


                    {/* PAYMENT */}
                    <td className="px-5 py-4">

                      <div className="flex justify-center">

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">

                          <span>
                            {paymentIcon(s.paymentMethod)}
                          </span>

                          {s.paymentMethod}

                        </span>

                      </div>

                    </td>


                    {/* CREATED BY */}
                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {s.createdBy?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <span className="text-xs text-gray-500">
                          {s.createdBy?.name || "—"}
                        </span>

                      </div>

                    </td>


                    {/* VIEW */}
                    <td className="px-5 py-4 text-center">

                      <button
                        onClick={() => setViewing(s)}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white inline-flex items-center justify-center transition"
                        title="View invoice"
                      >
                        <Eye size={15} />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* INVOICE MODAL */}
      {viewing && (

        <Modal
          title={`Invoice ${viewing.invoiceNumber}`}
          onClose={() => setViewing(null)}
        >

          <div className="space-y-5">

            {/* INVOICE INFO */}
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Date
                  </p>

                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    {new Date(
                      viewing.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Customer
                  </p>

                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    {viewing.customerName ||
                      "Walk-in Customer"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Payment
                  </p>

                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    {viewing.paymentMethod}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    Created By
                  </p>

                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    {viewing.createdBy?.name || "—"}
                  </p>
                </div>

              </div>

            </div>


            {/* ITEMS */}
            <div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Purchased Items
              </h3>

              <div className="border border-gray-100 rounded-xl overflow-hidden">

                <table className="w-full text-sm">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-4 py-2 text-[10px] uppercase text-gray-400">
                        Item
                      </th>

                      <th className="text-right px-4 py-2 text-[10px] uppercase text-gray-400">
                        Qty
                      </th>

                      <th className="text-right px-4 py-2 text-[10px] uppercase text-gray-400">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {viewing.items.map((i, idx) => (

                      <tr key={idx}>

                        <td className="px-4 py-3 font-medium text-gray-700">
                          {i.name}
                        </td>

                        <td className="px-4 py-3 text-right text-gray-500">
                          {i.quantity}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold">
                          ₹{i.lineTotal.toFixed(2)}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>


            {/* TOTAL */}
            <div className="border-t pt-4 space-y-2">

              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{viewing.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Discount</span>
                <span className="text-green-600">
                  -₹{viewing.discount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax</span>
                <span>₹{viewing.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">

                <span className="font-bold text-gray-800">
                  Total
                </span>

                <span className="text-xl font-bold text-blue-600">
                  ₹{viewing.total.toFixed(2)}
                </span>

              </div>

            </div>

          </div>

        </Modal>

      )}

    </div>
  );
};

export default Sales;