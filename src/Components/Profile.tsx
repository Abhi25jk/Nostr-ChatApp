// @ts-ignore
import React from "react";
import { useKeys } from "../contexts/KeyContext";
import { nip19 } from 'nostr-tools';
import { Clipboard} from "lucide-react";
interface ProfileProps {
  pubkey: string;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  const { username, pubkey } = useKeys();
  const npub = nip19.npubEncode(pubkey);
  const handleCopy = () => {
    navigator.clipboard.writeText(npub);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-green-500 text-black shadow-md">
      {/* Left: App Name */}
      <div className="text-2xl font-bold">ChatApp</div>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-6">
        {/* Username + Pubkey */}
        <div className="flex flex-col items-end text-right">
          <span className="font-semibold text-lg">{username}</span>
          <div className="flex items-center gap-2 text-xs text-gray-800">
            <span className="truncate max-w-[220px]" title={npub}>
             Public Key : {npub.slice(0, 8)}...{npub.slice(-5)}
            </span>
           <button
            onClick={handleCopy}
            className="hover:text-yellow-300 transition-colors text-white"
            title="Copy npub"
            >
            <Clipboard size={20} />
          </button>
            </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-lg shadow text-sm font-medium text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;