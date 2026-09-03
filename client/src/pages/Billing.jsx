import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [lastInvoice, setLastInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/products", {
          params: search ? { search } : {},
        });

        setProducts(res.data.data.slice(0, 8));
      } catch (err) {
        toast.error("Failed to load products");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const addToCart = (product) => {
    if (product.currentStock <= 0) {
      return toast.error("Out of stock");
    }

    setCart((prev) => {
      const existing = prev.find(
        (i) => i.product._id === product._id
      );

      if (existing) {
        if (existing.quantity >= product.currentStock) {
          toast.error("Not enough stock");
          return prev;
        }

        return prev.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { product, quantity: 1 }];
    });

    toast.success(`${product.name} added`);
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product._id !== id) return i;

          const newQty = i.quantity + delta;

          if (newQty > i.product.currentStock) {
            toast.error("Not enough stock");
            return i;
          }

          return { ...i, quantity: newQty };
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) =>
      prev.filter((i) => i.product._id !== id)
    );
  };

  const subtotal = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const tax =
    Math.round(
      subtotal * (Number(taxPercent) / 100) * 100
    ) / 100;

  const total = Math.max(
    0,
    subtotal - Number(discount || 0) + tax
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return toast.error("Cart is empty");
    }

    setSubmitting(true);

    try {
      const res = await api.post("/sales", {
        customerName: customerName || undefined,
        items: cart.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        discount: Number(discount || 0),
        tax,
        paymentMethod,
      });

      toast.success(
        `Sale recorded: ${res.data.data.invoiceNumber}`
      );

      setLastInvoice(res.data.data);
      setCart([]);
      setCustomerName("");
      setDiscount(0);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Checkout failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">

      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
          <Receipt size={14} />
          Point of Sale
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Billing
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create invoices and process customer purchases.
        </p>
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT SIDE */}
        <div className="xl:col-span-2 space-y-5">

          {/* PRODUCT SEARCH */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingCart size={19} />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Add Products
                </h2>

                <p className="text-xs text-gray-400">
                  Search and add products to your cart
                </p>
              </div>

            </div>


            {/* SEARCH */}
            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3.5 text-gray-400"
              />

              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-sm"
                placeholder="Search product by name or SKU..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            {/* PRODUCTS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">

              {products.map((p) => (

                <button
                  key={p._id}
                  onClick={() => addToCart(p)}
                  disabled={p.currentStock <= 0}
                  className="group text-left border border-gray-100 rounded-xl p-3 bg-gray-50 hover:bg-white hover:border-blue-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >

                  <div className="w-9 h-9 rounded-lg bg-white text-blue-600 flex items-center justify-center mb-3 shadow-sm">
                    <Receipt size={17} />
                  </div>

                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {p.name}
                  </p>

                  <p className="text-[11px] text-gray-400 mt-1">
                    {p.sku}
                  </p>

                  <div className="flex items-center justify-between mt-3">

                    <span className="text-sm font-bold text-blue-600">
                      ₹{p.price}
                    </span>

                    <span className="text-[10px] text-gray-400">
                      {p.currentStock} left
                    </span>

                  </div>

                </button>

              ))}

            </div>

          </div>


          {/* CART */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

              <div>
                <h2 className="font-bold text-gray-800">
                  Current Cart
                </h2>

                <p className="text-xs text-gray-400 mt-1">
                  {cart.length} product
                  {cart.length !== 1 ? "s" : ""} added
                </p>
              </div>

              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingCart size={17} />
              </div>

            </div>


            {cart.length === 0 ? (

              <div className="py-14 text-center">

                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                  <ShoppingCart size={25} />
                </div>

                <p className="text-sm font-semibold text-gray-500">
                  Your cart is empty
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Search for products above to begin
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                        Product
                      </th>

                      <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                        Price
                      </th>

                      <th className="text-center px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                        Quantity
                      </th>

                      <th className="text-right px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                        Amount
                      </th>

                      <th />

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {cart.map((i) => (

                      <tr
                        key={i.product._id}
                        className="hover:bg-blue-50/30"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Receipt size={16} />
                            </div>

                            <div>

                              <p className="font-semibold text-gray-800">
                                {i.product.name}
                              </p>

                              <p className="text-[11px] text-gray-400">
                                {i.product.sku}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4 text-right text-gray-500">
                          ₹{i.product.price}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-center gap-2">

                            <button
                              onClick={() =>
                                changeQty(
                                  i.product._id,
                                  -1
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              <Minus size={12} />
                            </button>

                            <span className="w-7 text-center font-semibold">
                              {i.quantity}
                            </span>

                            <button
                              onClick={() =>
                                changeQty(
                                  i.product._id,
                                  1
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center"
                            >
                              <Plus size={12} />
                            </button>

                          </div>

                        </td>

                        <td className="px-5 py-4 text-right font-bold text-gray-800">
                          ₹
                          {(
                            i.product.price *
                            i.quantity
                          ).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              removeItem(i.product._id)
                            }
                            className="text-gray-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={16} />
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>


        {/* CHECKOUT */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-fit overflow-hidden">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Receipt size={20} />
              </div>

              <div>
                <h2 className="font-bold">
                  Checkout
                </h2>

                <p className="text-xs text-blue-100">
                  Complete your transaction
                </p>
              </div>

            </div>

          </div>


          <div className="p-5 space-y-5">

            {/* CUSTOMER */}
            <div>

              <label className="text-xs font-semibold text-gray-500">
                Customer Name
              </label>

              <input
                className="input-field mt-1.5"
                placeholder="Optional"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
              />

            </div>


            {/* SUMMARY */}
            <div className="space-y-3">

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal
                </span>

                <span className="font-medium">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>


              <div className="flex items-center justify-between gap-3">

                <span className="text-sm text-gray-500">
                  Discount
                </span>

                <input
                  type="number"
                  min="0"
                  className="input-field w-28 text-right"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(e.target.value)
                  }
                />

              </div>


              <div className="flex items-center justify-between gap-3">

                <span className="text-sm text-gray-500">
                  Tax %
                </span>

                <input
                  type="number"
                  min="0"
                  className="input-field w-28 text-right"
                  value={taxPercent}
                  onChange={(e) =>
                    setTaxPercent(e.target.value)
                  }
                />

              </div>


              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Tax Amount
                </span>

                <span>
                  ₹{tax.toFixed(2)}
                </span>
              </div>

            </div>


            {/* TOTAL */}
            <div className="rounded-xl bg-slate-50 border border-gray-100 p-4">

              <div className="flex justify-between items-end">

                <span className="text-sm font-semibold text-gray-500">
                  Total Payable
                </span>

                <span className="text-2xl font-bold text-gray-900">
                  ₹{total.toFixed(2)}
                </span>

              </div>

            </div>


            {/* PAYMENT */}
            <div>

              <label className="text-xs font-semibold text-gray-500">
                Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2 mt-2">

                <PaymentButton
                  active={paymentMethod === "CASH"}
                  onClick={() =>
                    setPaymentMethod("CASH")
                  }
                  icon={Banknote}
                  label="Cash"
                />

                <PaymentButton
                  active={paymentMethod === "UPI"}
                  onClick={() =>
                    setPaymentMethod("UPI")
                  }
                  icon={Smartphone}
                  label="UPI"
                />

                <PaymentButton
                  active={paymentMethod === "CARD"}
                  onClick={() =>
                    setPaymentMethod("CARD")
                  }
                  icon={CreditCard}
                  label="Card"
                />

              </div>

            </div>


            {/* CHECKOUT BUTTON */}
            <button
              onClick={handleCheckout}
              disabled={submitting || cart.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >

              {submitting ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Complete Sale
                </>
              )}

            </button>

          </div>

        </div>

      </div>


      {/* LAST INVOICE */}
      {lastInvoice && (

        <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">

          <div className="bg-green-50 px-5 py-4 border-b border-green-100 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <h2 className="font-bold text-green-800">
                Sale Completed
              </h2>

              <p className="text-xs text-green-600">
                Invoice #{lastInvoice.invoiceNumber}
              </p>
            </div>

          </div>

          <div className="p-5">

            <div className="space-y-2">

              {lastInvoice.items.map((i, idx) => (

                <div
                  key={idx}
                  className="flex justify-between text-sm"
                >

                  <span className="text-gray-600">
                    {i.name} × {i.quantity}
                  </span>

                  <span className="font-medium">
                    ₹{i.lineTotal.toFixed(2)}
                  </span>

                </div>

              ))}

            </div>

            <div className="border-t mt-4 pt-4 flex justify-between">

              <span className="font-semibold text-gray-600">
                Total
              </span>

              <span className="text-xl font-bold text-gray-900">
                ₹{lastInvoice.total.toFixed(2)}
              </span>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


const PaymentButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition ${
      active
        ? "border-blue-500 bg-blue-50 text-blue-600 ring-2 ring-blue-500/10"
        : "border-gray-200 text-gray-500 hover:bg-gray-50"
    }`}
  >
    <Icon size={17} />
    {label}
  </button>
);

export default Billing;