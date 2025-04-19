// @ts-ignore
// // src/components/ChatLog.tsx
import React, { useContext, useState } from "react";
import { MessageContext } from "../contexts/MessageContext";
import { useRecipient } from "../contexts/RecipientContext";
import { nip19,nip44 } from "nostr-tools";
import SendMessageBox from "./SendMessageBox";
import { UnsignedEvent} from "nostr-tools/wasm";
import { SimplePool, Filter, Event, kinds } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";
import { useEffect, useRef } from "react";
import { useKeys } from "../contexts/KeyContext"; 
import { getPublicKey } from 'nostr-tools'

type Rumor = UnsignedEvent & { id: string };

// Derive conversation key from private and public key
const nip44ConversationKey = (
  privateKey: Uint8Array,
  publicKey: string
): Uint8Array =>
  nip44.v2.utils.getConversationKey((privateKey), publicKey);

// Decrypt an event using NIP-44
const nip44Decrypt = (
  data: Event,
  privateKey: Uint8Array
): any => {
  const decrypted = nip44.v2.decrypt(
    data.content,
    nip44ConversationKey(privateKey, data.pubkey)
  );
  return JSON.parse(decrypted);
};

const relays = [
  "wss://relay.damus.io",
  // "wss://nostr-pub.wellorder.net",
  // "wss://relay.snort.social",
  // "wss://relay.nostr.band",
  // "wss://purplepag.es",

];

interface Message {
  id: string;
  content: string;
  created_at: number;
  pubkey: string;
  isIncoming: boolean;
  tags: string[][];
}

const ChatLog: React.FC = () => {
  const { messages,addMessage } = useContext(MessageContext);
  const { recipientPubKey } = useRecipient();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter((message) => {
    const isSentToRecipient = message.tags?.some((tag) => tag[0] === "p" && tag[1] === recipientPubKey);
    const isFromRecipient = message.pubkey === recipientPubKey;
    return isSentToRecipient || isFromRecipient;
  });
  const sortedMessages = filteredMessages.sort((a, b) => a.created_at - b.created_at);
  // Scroll to the bottom whenever filteredMessages changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredMessages]);

  const getIndianTimeFromUnix = (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000); // convert to milliseconds
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      // second: "2-digit",
    });
  };

  // const { addMessage } = useContext(MessageContext);
    const { privkey, pubkey } = useKeys();
    const [error, setError] = useState<string | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    console.log(error);
    console.log(isSubscribed);
    useEffect(() => {
      if (!privkey || !pubkey) {
        setError("Private key or public key missing");
        return;
      }
      console.log("senders pubkey->",recipientPubKey);
      const init = async () => {
        const pool = new SimplePool();
  
        try {
          console.log("Connecting to relays:", relays);
          const filter: Filter = {
            kinds: [kinds.GiftWrap], // 1059
            "#p": [pubkey],
            since: Math.floor(Date.now() / 1000) - 86400 * 2, // Last 2 days
          };

          const sub = pool.subscribeMany(
            relays,
            [filter],
            {
              onevent: async (giftWrapEvent: Event) => {
                try {
                  // let recipientPubHex = recipientPubKey;
                  //       if (recipientPubKey.startsWith('npub1')) {
                  //         const decoded = nip19.decode(recipientPubKey);
                  //         if (decoded.type !== 'npub') throw new Error('Invalid npub');
                  //         recipientPubHex = bytesToHex(decoded.data as unknown as Uint8Array);
                  //       }
                  // console.log(giftWrapEvent);
                  // if (giftWrapEvent.pubkey != recipientPubHex ) {
                  //   console.log("Ignoring message from unknown sender", giftWrapEvent.pubkey);
                  //   return;
                  // }
                  console.log("Received gift-wrap event:", giftWrapEvent);
                  if (!giftWrapEvent.content || !giftWrapEvent.pubkey) {
                    throw new Error("Invalid event structure");
                  }
                  // const senderPrivKeyBytes = hexToBytes(privkey);
                  const recipientPrivateKey = hexToBytes(privkey); // this should be the recipient's actual private key
                  
                  let unwrappedSeal, unsealedRumor;
                  try {
                     unwrappedSeal = nip44Decrypt(giftWrapEvent, recipientPrivateKey) as Event;
                  } catch (e) {
                    console.warn("Failed to unwrap outer layer:", e);
                    return;
                  }
                  
                  try {
                    unsealedRumor = nip44Decrypt(unwrappedSeal, recipientPrivateKey) as Rumor;
                  } catch (e) {
                    console.warn("Failed to decrypt inner message:", e);
                    return;
                  }

                  const decryptedContent = unsealedRumor; //await unwrapGiftWrap(giftWrapEvent, privkey);
                  const localId = unsealedRumor.id ;//|| giftWrapEvent.id || crypto.randomUUID();
                  
                  const message: Message = {
                    id: localId,
                    pubkey: recipientPubKey,//giftWrapEvent.pubkey,
                    content: decryptedContent.content, 
                    created_at: (giftWrapEvent.created_at),
                    isIncoming: true,
                    tags: giftWrapEvent.tags || [],
                  };
                  console.log("Adding message:", message);
                  addMessage(message);
                  // Scroll to the bottom of the chat
                  if (chatEndRef.current) {
                    chatEndRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                  // setRecipientPubKey(giftWrapEvent.pubkey);
                  // setRecipientPubKey(giftWrapEvent.pubkey);
                  // addContact(giftWrapEvent.pubkey);
                } catch (err) {
                    console.error("unwrapGiftWrap failed:", err);
                    console.log("GiftWrap event:", giftWrapEvent);
                    console.log(getPublicKey(hexToBytes(privkey)));
                    throw err;
                }
              },
          
              onclose : (reasons : string[]) =>
              {
                console.warn("subscription closed->",reasons);
                setIsSubscribed(false);
                // Retry connection after short delay
                setTimeout( () => {
                  console.log("Re-subscribing after closure...");
                  init();
                },3000);
              }
            }
          );
  
          setIsSubscribed(true);
          console.log("Subscription started");
  
          // Cleanup on unmount
          return () => {
            sub.close();
            pool.close(relays);
            // console.log("Subscription and pool closed");
            setIsSubscribed(false);
          };
        } catch (err) {
          // console.error("Subscription error:", err);
  
        }
      };
  
      init();
    }, [ recipientPubKey]);

  if(recipientPubKey === "") {
    return(
      // <div>
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-gray-800 text-center">Select a contact to start chatting.</div>
        </div>
      // </div>
    );
  }
  //
  else{
    return (
    <div className="p-2 h-screen flex flex-col">
      {/* Message Log */}
      <div className="overflow-y-auto flex-1 mb-2 "> {/* Limited height */}
       {sortedMessages.length === 0 ? (
        <div className="text-gray-500 text-center">No messages yet.</div>
         ) : (
        sortedMessages.map((message) => {
         const isSent = !message.isIncoming;

         return (
          <div
            key={message.id}
            className={`mb-2 p-2 max-w-[500px] rounded shadow ${
              isSent ? "ml-auto bg-blue-100 text-right" : "mr-auto bg-gray-100 text-left"
            }`}
           >
            {/* Label */}
            <div
              className={`text-xs font-semibold ${
                isSent ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {isSent ? "You" : "From"}
            </div>

            {/* Pubkey */}
            {!isSent && (
              <div className="text-xs text-gray-600 break-all">
                {nip19.npubEncode(message.pubkey)}
              </div>
            )}

            {/* Content */}
            <div className="text-base break-words">{message.content}</div>

            {/* Timestamp */}
            <div className="text-xs text-gray-400">
              {getIndianTimeFromUnix(message.created_at)}
            </div>
          </div>
          );
         })
       )}
       {/* Reference for scrolling */}
       <div ref={chatEndRef}></div>
     </div>

      {/* Send box - Sticky at bottom */}
      {recipientPubKey && (
      <div className="sticky bottom-4 rounded-full bg-gray-800 p-2">
        <SendMessageBox />
      </div>
    )}
      </div>
    );
    
  }
  
};

export default ChatLog;