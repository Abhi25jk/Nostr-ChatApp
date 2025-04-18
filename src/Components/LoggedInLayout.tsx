// @ts-ignore
// src/Components/LoggedInLayout.tsx
import React from "react";
import { useState } from "react";
import { useRecipient } from "../contexts/RecipientContext";
import { useContactList } from "../contexts/ContactListContext";
import ChatLog from "./ChatLog";
import Profile from "./Profile";
import { nip19 } from "nostr-tools";

interface Props {
  userPub: string;
  onLogout: () => void;
}

const LoggedInLayout: React.FC<Props> = () => {
  const { recipientPubKey, setRecipientPubKey } = useRecipient();
  const [inputValue, setInputValue] = useState("");
  const { contacts, addContact } = useContactList();

  const handleInputChange = (input: string) => {
    setInputValue(input);
    if (!input.startsWith("npub") || input.length < 50) return;

    try {
      const { type, data } = nip19.decode(input);
      if (type === "npub" && typeof data === "string") {
        setRecipientPubKey(data);
        addContact(data);
        setInputValue(""); // Clear the input field after processing
      }
    } catch (err) {
      console.warn("Invalid npub key:", err);
    }
  };

  return (
    <div>
      <div className="flex h-screen">
        {/* Contacts Sidebar */}
        <div className="w-1/4 bg-gray-100 dark:bg-gray-800 border-r overflow-y-auto p-4">
          <button className="text-white font-bold mb-4" 
            onClick={() => setRecipientPubKey("")}
            >Chats</button>
            <div className="mb-4 text-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter recipient npub key"
              className="w-full px-3 py-2 border rounded shadow"
            />
            </div>

          {contacts.length === 0 ? (
            <div className="text-gray-500 text-sm">No contacts added.</div>
          ) : (
            <ul className="space-y-1">
              {contacts.map((pubkey) => (
                <li key={pubkey}>
                  <button
                    className={`text-white bg-gray-600 border-2 p-2 rounded-sm hover:underline ${
                      recipientPubKey === pubkey ? "font-bold" : ""
                    }`}
                    onClick={() => setRecipientPubKey(pubkey)}
                  >
                    {nip19.npubEncode(pubkey)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-500">
          <ChatLog />
        </div>
      </div>
    </div>
  );
};

export default LoggedInLayout;
