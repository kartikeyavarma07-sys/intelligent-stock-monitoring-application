const EmptyState = ({ title = "Nothing here yet", subtitle }) => (
  <div className="text-center py-14 text-gray-400">
    <p className="font-medium">{title}</p>
    {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
  </div>
);

export default EmptyState;
