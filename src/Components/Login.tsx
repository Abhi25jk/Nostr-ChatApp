// // src/components/ChatLog.tsx
import React, { useState } from "react";
// import { Button, Input } from "@heroui/react";
import { getPublicKey } from "@noble/secp256k1";
import { nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";
import { useKeys } from "../contexts/KeyContext";

interface LoginProps {
  onLogin: (privateKey: string, publicKey: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { privkey, pubkey, setPrivkeyFromNsec,setUsernameFromLogin } = useKeys();
  const [privateKey, setPrivateKey] = useState("");


  const handleLogin = async () => {
    try {
      const { data, type } = nip19.decode(privateKey);
      if (type !== "nsec") throw new Error("Not a valid nsec key");
      setPrivkeyFromNsec(privateKey);
      const hexKey = bytesToHex(data); // decoded private key in hex
      const pubKey = await getPublicKey(hexKey);
      // Here, you need a helper to convert pubKey (which might be a Uint8Array) to hex:
      const pubKeyHex = pubKey instanceof Uint8Array
        ? Array.from(pubKey, (b) => b.toString(16).padStart(2, "0")).join("")
        : pubKey;
      onLogin(hexKey, pubKeyHex);
      // onLogin("abs","ans");
    } catch (error) {
      console.error("Invalid private key", error);
      alert("Invalid private key. Please check your input.");
    }
  };

  return (
  //   <div className="flex justify-center items-center h-screen w-screen bg-gray-100 dark:bg-gray-500">
  //   <div className="w-[600px] h-[300px] p-6 border rounded-2xl shadow-lg bg-white dark:bg-gray-400">
  //     <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
  //     <input className="border w-137 border-gray-900 rounded px-3 py-2 margin-bottom-30"
  //       value={privateKey}
  //       onChange={(e) => setPrivateKey(e.target.value)}
  //       placeholder="Paste your private key (nsec...)"
  //     />
  //     <div className = "flex justify-center mt-4">
  //     <button onClick={handleLogin} className="w-1/4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors mx-auto">
  //       Login
  //     </button>
  //     </div>
  //   </div>
  // </div>
  
  <div className="flex justify-center items-center h-screen w-screen bg-gray-100 dark:bg-gray-500">
  <div className="w-[600px] h-[350px] p-6 border rounded-2xl shadow-lg bg-green-300 dark:bg-green-300">
    <h2 className="text-3xl font-bold mb-6 mt-4 text-center">Login</h2>
    <input
      className="border w-137 border-gray-900 rounded px-3 py-2 margin-bottom-30 mt-4 bg-white "
      value={privateKey}
      onChange={(e) => setPrivateKey(e.target.value)}
      placeholder="Paste your private key (nsec...)"
    />
    <input
      className="border w-137 border-gray-900 rounded px-3 py-2 mt-6 bg-white"
      placeholder="Enter your username"
      onChange ={(e) => setUsernameFromLogin(e.target.value)}
    />
    
    <div className="flex justify-center mt-8">
      <button
        onClick={handleLogin}
        className="w-1/4 bg-gray-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors mx-auto"
      >
        Login
      </button>
    </div>
  </div>
</div>
  );
};

export default Login;
