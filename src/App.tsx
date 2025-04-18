// // pages/index.tsx (or src/App.tsx if using Vite/React)
// import React, { useState,useEffect } from "react";
// import ChatLog from "./Components/ChatLog";
// import Login from "./Components/Login";
// import Profile from "./Components/Profile";
// import { MessageProvider } from "./contexts/MessageContext";
// import { RecipientProvider } from "./contexts/RecipientContext";
// import { ContactListProvider } from "./contexts/ContactListContext";
// import { KeyProvider} from "./contexts/KeyContext";
// import Contact from "./Components/Contact";
// import { useContactList } from "./contexts/ContactListContext";
// import { useRecipient } from "./contexts/RecipientContext";
// import { nip19 } from "nostr-tools";
// import { useKeys } from "./contexts/KeyContext";
// const App: React.FC = () => {
//   const [userPriv, setUserPriv] = useState<string>("");
//   const [userPub, setUserPub] = useState<string>("");
//   const { contacts, addContact } = useContactList();
//    const { recipientPubKey, setRecipientPubKey } = useRecipient();
//   const handleLogin = (privateKey: string, publicKey: string) => {
//     setUserPriv(privateKey);
//     setUserPub(publicKey);
//   };

//   const handleLogout = () => {
//     setUserPriv("");
//     setUserPub("");
//   };

//   return (
//     <KeyProvider>
//     <MessageProvider>
//       <RecipientProvider>
//         <ContactListProvider>
//           <div >
//             {!userPriv ? (
//               <Login onLogin={handleLogin} />
//             ) : (
//               <div>
//                 <Profile pubkey={userPub} onLogout={handleLogout} />
//                 {/* <div>
//                   <ChatLog />
//                 </div> */}
//                  <div className="flex h-screen">
//                   {/* ContactLog on the left */}
//                   useEffect(() => {
//                     <div className="w-1/4 bg-gray-100 dark:bg-green-300 border-r overflow-y-auto">
//                     <div className="mb-4">
//                             <h2 className="text-sm font-bold mb-1">Contacts</h2>
//                             {contacts.length === 0 ? (
//                               <div className="text-gray-500 text-sm">No contacts added.</div>
//                             ) : (
//                               <ul className="space-y-1">
//                                 {contacts.map((pubkey) => (
//                                   <li key={pubkey}>
//                                     <button
//                                       className={`text-blue-600 hover:underline ${
//                                         recipientPubKey === pubkey ? "font-bold" : ""
//                                       }`}
//                                       onClick={() => setRecipientPubKey(pubkey)}
//                                     >
//                                       {nip19.npubEncode(pubkey)}
//                                     </button>
//                                   </li>
//                                 ))}
//                               </ul>
//                             )}
//                           </div>
//                 </div>
//                   }, [contacts]);
                  
                    

//                   {/* ChatLog on the right */}
//                     <div className="flex-1 bg-white dark:bg-gray-500">
//                       <ChatLog />
//                     </div>
//               </div>
//               </div>
//             )}
//           </div>
//         </ContactListProvider>
//       </RecipientProvider>
//     </MessageProvider>
//     </KeyProvider>
//   );
// };

// export default App;
// src/App.tsx or pages/index.tsx
import React, { useState } from "react";
import ChatLog from "./Components/ChatLog";
import Login from "./Components/Login";
import Profile from "./Components/Profile";
import { MessageProvider } from "./contexts/MessageContext";
import { RecipientProvider } from "./contexts/RecipientContext";
import { ContactListProvider } from "./contexts/ContactListContext";
import { KeyProvider } from "./contexts/KeyContext";
import LoggedInLayout from "./Components/LoggedInLayout";

const App: React.FC = () => {
  const [userPriv, setUserPriv] = useState<string>("");
  const [userPub, setUserPub] = useState<string>("");

  const handleLogin = (privateKey: string, publicKey: string) => {
    setUserPriv(privateKey);
    setUserPub(publicKey);
  };

  const handleLogout = () => {
    setUserPriv("");
    setUserPub("");
  };

  return (
    <KeyProvider>
      <MessageProvider>
        <RecipientProvider>
          <ContactListProvider>
            <div>
              {!userPriv ? (
                <Login onLogin={handleLogin} />
              ) : (
                <div>
                {/* Fixed navbar */}
                <div className="fixed top-0 left-0 w-full z-50">
                  <Profile pubkey={userPub} onLogout={handleLogout} />
                </div>
              
                {/* Content below navbar */}
                <div className="pt-16"> {/* Adjust this padding to match your Profile component height */}
                  <LoggedInLayout userPub={userPub} onLogout={handleLogout} />
                </div>
              </div>
              )}
            </div>
          </ContactListProvider>
        </RecipientProvider>
      </MessageProvider>
    </KeyProvider>
  );
};

export default App;
