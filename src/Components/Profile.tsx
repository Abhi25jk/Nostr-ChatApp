import React from "react";
import { useKeys } from "../contexts/KeyContext";
import { nip19 } from 'nostr-tools';
import { ClipboardCopy } from "lucide-react";
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


  // return (
    
  //   <div className="flex items-center justify-between p-4 bg-green-300 text-black">
  //     {/* Left Section: App Name or Logo */}
  //     <div className="text-xl font-bold">ChatApp</div>

  //     {/* Center Section: User Info */}
  //     <div className="flex flex-col items-center">
  //       <div className="text-sm">Username: {username}</div>
  //       <div className="text-xs text-black break-all">Public Key: {nip19.npubEncode(pubkey)}</div>
  //     </div>

  //     {/* Right Section: Logout Button */}
  //     <button
  //       className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
  //       onClick={onLogout}
  //     >
  //       Logout
  //     </button>
  //   </div>

  // );
  return (
    <div className="flex items-center justify-between p-4 bg-green-500 text-black shadow-md">
      {/* Left: App Name */}
      <div className="text-2xl font-bold">ChatApp</div>

      {/* Right: User Info + Logout */}
      <div className="flex items-center gap-6">
        {/* Username + Pubkey */}
        <div className="flex flex-col items-end text-right">
          <span className="font-semibold text-lg">{username}</span>
          {/* <div className="flex items-center gap-2 text-xs text-gray-800">
            <span className="break-all max-w-[300px]">{npub}</span>
            <button
              onClick={handleCopy}
              className="hover:text-yellow-300 transition-colors text-white"
              title="Copy npub"
            >
              <ClipboardCopy size={14} />
            </button>
          </div> */}
          <div className="flex items-center gap-2 text-xs text-gray-800">
            <span className="truncate max-w-[220px]" title={npub}>
             Public Key : {npub.slice(0, 8)}...{npub.slice(-5)}
            </span>
           <button
            onClick={handleCopy}
            className="hover:text-yellow-300 transition-colors text-white"
            title="Copy npub"
            >
            <ClipboardCopy size={14} />
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

// import React from "react";
// import { useKeys } from "../contexts/KeyContext";

// interface ProfileProps {
//   pubkey: string;
//   onLogout: () => void;
// }

// const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
//   const { username, pubkey } = useKeys();

//   return (
//     <div className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-green-600 text-white z-50">
//       {/* Left Section: App Name or Logo */}
//       <div className="text-xl font-bold">ChatApp</div>

//       {/* Center Section: User Info */}
//       <div className="flex flex-col items-center">
//         <div className="text-sm">Username: {username}</div>
//         <div className="text-xs text-gray-200 break-all">Public Key: {pubkey}</div>
//       </div>

//       {/* Right Section: Logout Button */}
//       <button
//         className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//         onClick={onLogout}
//       >
//         Logout
//       </button>
//     </div>
//   );
// };

// export default Profile;