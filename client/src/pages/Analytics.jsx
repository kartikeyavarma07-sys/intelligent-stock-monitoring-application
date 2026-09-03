import { useEffect, useState } from "react";
import api from "../services/api";

const Analytics = () => {
  const [sales, setSales] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [salesRes, invRes] = await Promise.all([api.get("/analytics/sales"), api.get("/analytics/inventory")]);
      setSales(salesRes.data.data);
      setInventory(invRes.data.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="py-14 text-center text-gray-400">Loading insights...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Insights &amp; Analytics</h1>

      {/* Sales insights */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Sales Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-xs text-gray-400">This Month</p>
            <p className="text-xl font-bold text-primary-700">₹{sales.thisMonthTotal.toLocaleString("en-IN")}</p>
            {sales.growthPercent !== null && (
              <p className={`text-xs mt-1 ${sales.growthPercent >= 0 ? "text-status-healthy" : "text-status-critical"}`}>
                {sales.growthPercent >= 0 ? "▲" : "▼"} {Math.abs(sales.growthPercent).toFixed(1)}% vs last month
              </p>
            )}
          </div>
          <ListCard title="Best Selling Products" items={sales.bestSelling} valueKey="unitsSold" valueLabel="units" />
          <ListCard title="Worst Selling Products" items={sales.worstSelling} valueKey="unitsSold" valueLabel="units" />
        </div>
      </section>

      {/* Inventory insights */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Inventory Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SimpleListCard title="Low Stock Products" items={inventory.lowStock} sub={(i) => `${i.currentStock} left`} />
          <SimpleListCard title="Critical Stock Products" items={inventory.criticalStock} sub={(i) => `${i.currentStock} left`} accent="text-status-critical" />
          <SimpleListCard title="Out of Stock Products" items={inventory.outOfStock} accent="text-status-critical" />
          <SimpleListCard title="Overstocked Products" items={inventory.overstocked} sub={(i) => `${i.currentStock} vs min ${i.minimumStock}`} />
        </div>
      </section>

      {/* Product classification */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Product Classification (by sales velocity)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VelocityCard title="Fast Moving" items={inventory.fastMoving} accent="text-status-healthy" />
          <VelocityCard title="Medium Moving" items={inventory.mediumMoving} accent="text-status-low" />
          <VelocityCard title="Slow Moving" items={inventory.slowMoving} accent="text-gray-500" />
        </div>
      </section>
    </div>
  );
};

const ListCard = ({ title, items, valueKey, valueLabel }) => (
  <div className="card">
    <p className="text-xs font-medium text-gray-500 mb-2">{title}</p>
    {items.length === 0 ? (
      <p className="text-sm text-gray-400">No data yet</p>
    ) : (
      <ul className="text-sm space-y-1">
        {items.slice(0, 5).map((i) => (
          <li key={i._id} className="flex justify-between">
            <span className="truncate">{i.name}</span>
            <span className="text-gray-400 flex-shrink-0 ml-2">{i[valueKey]} {valueLabel}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const SimpleListCard = ({ title, items, sub, accent = "text-gray-700" }) => (
  <div className="card">
    <p className={`text-xs font-medium mb-2 ${accent}`}>{title} ({items.length})</p>
    {items.length === 0 ? (
      <p className="text-sm text-gray-400">None — good news!</p>
    ) : (
      <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
        {items.map((i) => (
          <li key={i._id} className="flex justify-between">
            <span className="truncate">{i.name}</span>
            {sub && <span className="text-gray-400 flex-shrink-0 ml-2">{sub(i)}</span>}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const VelocityCard = ({ title, items, accent }) => (
  <div className="card">
    <p className={`text-xs font-medium mb-2 ${accent}`}>{title} ({items.length})</p>
    {items.length === 0 ? (
      <p className="text-sm text-gray-400">No products in this category</p>
    ) : (
      <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
        {items.map((i) => (
          <li key={i.product._id} className="flex justify-between">
            <span className="truncate">{i.product.name}</span>
            <span className="text-gray-400 flex-shrink-0 ml-2">{i.averageDailyDemand}/day</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default Analytics;
