import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  Package,
  IndianRupee,
  ShoppingBag,
  TrendingDown,
  AlertTriangle,
  PackageX,
  RefreshCw,
  ArrowUpRight,
  Boxes,
  Activity,
} from "lucide-react";

import api from "../services/api";
import StatCard from "../components/StatCard";

const COLORS = {
  HEALTHY: "#22c55e",
  LOW: "#f59e0b",
  CRITICAL: "#ef4444",
  OUT_OF_STOCK: "#7f1d1d",
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const [dash, alertRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/analytics/alerts"),
      ]);

      setData(dash.data.data);
      setAlerts(alertRes.data.data);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const { summary, charts } = data;

  const stockPie = Object.entries(charts.stockOverview).map(
    ([status, count]) => ({
      name: status.replaceAll("_", " "),
      originalName: status,
      value: count,
    })
  );

  return (
    <div className="space-y-6 pb-8">

      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 md:p-8 text-white shadow-lg">

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-2">
              <Activity size={16} />
              <span>Inventory Management System</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold">
              Inventory Dashboard
            </h1>

            <p className="text-blue-100 mt-2 text-sm md:text-base">
              Monitor stock, sales and replenishment in one place.
            </p>
          </div>

          <button
            onClick={load}
            className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm px-5 py-3 rounded-xl font-medium transition-all duration-200"
          >
            <RefreshCw size={17} />
            Refresh Data
          </button>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -right-12 -top-16 w-52 h-52 rounded-full bg-white/10" />
        <div className="absolute right-24 -bottom-20 w-44 h-44 rounded-full bg-white/10" />
      </div>


      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard
          label="Total Products"
          value={summary.totalProducts}
          icon={Package}
        />

        <StatCard
          label="Inventory Value"
          value={`₹${summary.totalInventoryValue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
        />

        <StatCard
          label="Today's Sales"
          value={`₹${summary.todaysSales.toLocaleString("en-IN")}`}
          icon={ShoppingBag}
          subtext={`${summary.todaysSalesCount} orders today`}
        />

        <StatCard
          label="Total Sales"
          value={`₹${summary.totalSales.toLocaleString("en-IN")}`}
          icon={TrendingDown}
          subtext={`${summary.totalSalesCount} total orders`}
        />

      </div>


      {/* STOCK HEALTH */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Low Stock
              </p>

              <h2 className="text-3xl font-bold text-amber-500 mt-2">
                {summary.lowStockCount}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Products need attention
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 text-amber-500 group-hover:scale-110 transition">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>


        <div className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Out of Stock
              </p>

              <h2 className="text-3xl font-bold text-red-500 mt-2">
                {summary.outOfStockCount}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Immediate action required
              </p>
            </div>

            <div className="p-3 rounded-xl bg-red-50 text-red-500 group-hover:scale-110 transition">
              <PackageX size={24} />
            </div>
          </div>
        </div>


        <div className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Replenishments
              </p>

              <h2 className="text-3xl font-bold text-orange-500 mt-2">
                {summary.pendingReplenishments}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Pending recommendations
              </p>
            </div>

            <div className="p-3 rounded-xl bg-orange-50 text-orange-500 group-hover:scale-110 transition">
              <Boxes size={24} />
            </div>
          </div>
        </div>

      </div>


      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-500">
                <AlertTriangle size={18} />
              </div>

              <div>
                <h2 className="font-bold text-gray-800">
                  Stock Alerts
                </h2>

                <p className="text-xs text-gray-400">
                  Items requiring your attention
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1 rounded-full">
              {alerts.length} Alerts
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {alerts.slice(0, 6).map((alert, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition"
              >
                <span className="text-lg">
                  {alert.icon}
                </span>

                <span className="text-sm text-gray-600">
                  {alert.message}
                </span>

                <ArrowUpRight
                  size={15}
                  className="ml-auto text-gray-300"
                />
              </div>
            ))}
          </div>

        </div>
      )}


      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* DAILY SALES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-800">
                Daily Sales
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Last 7 days performance
              </p>
            </div>

            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingDown size={18} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={charts.dailySales}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(date) => date.slice(5)}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>


        {/* MONTHLY SALES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-800">
                Monthly Revenue
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Last 6 months
              </p>
            </div>

            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <IndianRupee size={18} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={charts.monthlySales}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                }}
              />

              <Bar
                dataKey="total"
                fill="#4f46e5"
                radius={[7, 7, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* TOP PRODUCTS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-800">
                Top Selling Products
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Best performing products
              </p>
            </div>

            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <ShoppingBag size={18} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={270}>
            <BarChart
              data={charts.topProducts}
              layout="vertical"
              margin={{ left: 20 }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />

              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                }}
              />

              <Bar
                dataKey="unitsSold"
                fill="#8b5cf6"
                radius={[0, 7, 7, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* STOCK OVERVIEW */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-800">
                Stock Health
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Current inventory status
              </p>
            </div>

            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Package size={18} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={270}>
            <PieChart>

              <Pie
                data={stockPie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                label
              >

                {stockPie.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[entry.originalName]}
                  />
                ))}

              </Pie>

              <Tooltip />

              <Legend
                wrapperStyle={{
                  fontSize: 11,
                }}
              />

            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;