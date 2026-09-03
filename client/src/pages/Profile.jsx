import { useAuth } from "../context/AuthContext";
import { User, Mail, ShieldCheck } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-xl font-bold text-gray-800">Profile &amp; Settings</h1>
      <div className="card space-y-4">
        <Row icon={User} label="Name" value={user?.name} />
        <Row icon={Mail} label="Email" value={user?.email} />
        <Row icon={ShieldCheck} label="Role" value={user?.role} capitalize />
      </div>
      <p className="text-xs text-gray-400">
        Profile editing and password change can be added here in a future enhancement.
      </p>
    </div>
  );
};

const Row = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-center gap-3">
    <div className="bg-primary-50 text-primary-600 p-2 rounded-lg"><Icon size={16} /></div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-medium text-gray-800 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  </div>
);

export default Profile;
