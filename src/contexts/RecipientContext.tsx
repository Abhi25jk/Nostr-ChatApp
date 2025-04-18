import React, { createContext, useContext, useState, ReactNode } from "react";

interface RecipientContextType {
  recipientPubKey: string;
  setRecipientPubKey: (key: string) => void;
}

export const RecipientContext = createContext<RecipientContextType>({
  recipientPubKey: "",
  setRecipientPubKey: () => {},
});

export const RecipientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recipientPubKey, setRecipientPubKey] = useState("");
  return (
    <RecipientContext.Provider value={{ recipientPubKey, setRecipientPubKey }}>
      {children}
    </RecipientContext.Provider>
  );
};

export const useRecipient = () => useContext(RecipientContext);
