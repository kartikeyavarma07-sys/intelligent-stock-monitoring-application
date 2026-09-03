const StatCard = ({ label, value, icon: Icon, accent = "text-primary-600", subtext }) => (
  <div className="card flex items-start justify-between">
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
    {Icon && (
      <div className={`p-2.5 rounded-lg bg-gray-50 ${accent}`}>
        <Icon size={20} />
      </div>
    )}
  </div>
);

export default StatCard;
