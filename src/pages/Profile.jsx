import {
  FiUser,
  FiMail,
  FiShield,
  FiActivity,
  FiEdit,
  FiLogOut,
  FiLock
} from "react-icons/fi";
import ProfileCard from "../components/profile/ProfileCard";
import InfoRow from "../components/profile/InfoRow";
import Preference from "../components/profile/Preference";

export default function Profile() {
  return (
    <div className="p-6 bg-gray-50 h-full space-y-6">

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-xl shadow flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
          A
        </div>

        <div>
          <h2 className="text-xl font-semibold">Ashith K</h2>
          <p className="text-gray-500 flex items-center gap-2">
            <FiMail /> ashith@example.com
          </p>
          <p className="text-sm text-green-600 mt-1">● Online</p>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Account Info */}
        <ProfileCard title="Account Information" icon={<FiUser />}>
          <InfoRow label="Role" value="Admin" />
          <InfoRow label="Joined Channels" value="6" />
          <InfoRow label="Projects" value="2" />
          <button className="action-btn">
            <FiEdit /> Edit Profile
          </button>
        </ProfileCard>

        {/* Activity Summary */}
        <ProfileCard title="Activity Summary" icon={<FiActivity />}>
          <InfoRow label="Messages Sent" value="245" />
          <InfoRow label="Tasks Created" value="12" />
          <InfoRow label="Last Active" value="Today at 10:45 AM" />
        </ProfileCard>

        {/* Security */}
        <ProfileCard title="Security & Access" icon={<FiShield />}>
          <InfoRow label="Password" value="********" />
          <button className="action-btn">
            <FiLock /> Change Password
          </button>
          <button className="ps-5 action-btn text-red-500">
            <FiLogOut /> Logout
          </button>
        </ProfileCard>

        {/* Preferences */}
        <ProfileCard title="Preferences" icon={<FiUser />}>
          <Preference label="Email Notifications" />
          <Preference label="Push Notifications" />
        </ProfileCard>
      </div>
    </div>
  );
}