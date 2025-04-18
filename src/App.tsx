// @ts-ignore
import React, { useState } from "react";
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
                <div className="pt-16"> 
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
