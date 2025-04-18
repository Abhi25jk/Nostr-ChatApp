import React, { createContext, useState, useContext, ReactNode } from "react";

interface ContactListContextType {
  contacts: string[];
  addContact: (pubkey: string) => void;
}

const ContactListContext = createContext<ContactListContextType>({
  contacts: [],
  addContact: () => {},
});

export const ContactListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<string[]>([]);
  
  const addContact = (pubkey: string) => {
    setContacts((prev) =>
      prev.includes(pubkey) ? prev : [...prev, pubkey]
    );
  };

  return (
    <ContactListContext.Provider value={{ contacts, addContact }}>
      {children}
    </ContactListContext.Provider>
  );
};

export const useContactList = () => useContext(ContactListContext);
