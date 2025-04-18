import { createContext, useContext, useState, ReactNode } from "react";
import { getPublicKey, nip19 } from "nostr-tools";
import { bytesToHex } from "@noble/hashes/utils";

interface KeyContextType {
  privkey: string ;
  pubkey: string;
  username: string;
  setPrivkeyFromNsec: (nsec: string) => void;
  setUsernameFromLogin: (username: string) => void;
}

export const KeyContext = createContext<KeyContextType>({
  privkey: bytesToHex(nip19.decode("nsec1uvmv6z6yz78x5nj5dnwrg0yqnllgah9lsan6ljrvjw688adqchesqgygnu").data),
  pubkey: getPublicKey(nip19.decode("nsec1uvmv6z6yz78x5nj5dnwrg0yqnllgah9lsan6ljrvjw688adqchesqgygnu").data),
  username: "Abhi25jk",
  setPrivkeyFromNsec: () => {},
  setUsernameFromLogin: () => {},
});

export const useKeys = () => useContext(KeyContext);

export const KeyProvider = ({ children }: { children: ReactNode }) => {
  const [privkey, setPrivkey] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const setPrivkeyFromNsec = async (nsec: string) => {
    try {
      const decoded = nip19.decode(nsec);
      if (decoded.type !== "nsec") throw new Error("Invalid nsec format");
      const priv = (decoded.data as Uint8Array);
      const { getPublicKey } = await import("nostr-tools/pure");
      const pub = getPublicKey(priv);
      setPrivkey(bytesToHex(priv));

      setPubkey(pub);
    } catch (err) {
      console.error("Failed to decode private key:", err);
    }
  };

  // Set username from login;
  const setUsernameFromLogin = (username: string) => {
    setUsername(username);
  };
  return (
    <KeyContext.Provider value={{ privkey, pubkey, setPrivkeyFromNsec, username, setUsernameFromLogin }}>
      {children}
    </KeyContext.Provider>
  );
};
