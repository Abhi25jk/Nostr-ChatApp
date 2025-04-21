// @ts-ignore
import React, { useState, useContext,useId } from "react";
import { useRecipient } from "../contexts/RecipientContext";
import { MessageContext } from "../contexts/MessageContext";
import { SimplePool, Event, nip44, nip19, generateSecretKey, getEventHash, getPublicKey,type EventTemplate, type UnsignedEvent, } from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { useKeys } from "../contexts/KeyContext";
import { finalizeEvent } from 'nostr-tools/pure';
import Picker, { EmojiClickData } from "emoji-picker-react";

const relays = [
  "wss://relay.damus.io",
  // "wss://nostr-pub.wellorder.net",
  // "wss://relay.snort.social",
  // "wss://relay.nostr.band",
  // "wss://purplepag.es",
];

type Rumor = UnsignedEvent & { id: string };

// const TWO_DAYS = 2 * 12;

const now = (): number => Math.round(Date.now() / 1000);
// const randomNow = (): number => Math.round(now() - Math.random() * TWO_DAYS);

// Derive conversation key from private and public key
const nip44ConversationKey = (
  privateKey: Uint8Array,
  publicKey: string
): Uint8Array =>
  nip44.v2.utils.getConversationKey((privateKey), publicKey);

// Encrypt an event using NIP-44
const nip44Encrypt = (
  data: EventTemplate,
  privateKey: Uint8Array,
  publicKey: string
): string =>
  nip44.v2.encrypt(JSON.stringify(data), nip44ConversationKey(privateKey, publicKey));

// Create a base Nostr event (Rumor)
const createRumor = (
  event: Partial<UnsignedEvent>,
  privateKey: Uint8Array
): Rumor => {
  const unsigned: UnsignedEvent = {
    created_at: now(),//Math.floor(Date.now() / 1000),
    content: "",
    tags: [],
    kind: event.kind ?? 1,
    ...event,
    pubkey: getPublicKey(privateKey),
  };

  const id = getEventHash(unsigned);

  return { ...unsigned, id };
};

// Encrypt the rumor into a sealed event
const createSeal = (
  rumor: Rumor,
  privateKey: Uint8Array,
  recipientPublicKey: string
): Event => {
  return finalizeEvent(
    {
      kind: 13,
      content: nip44Encrypt(rumor, privateKey, recipientPublicKey),
      created_at:  Math.floor(Date.now() / 1000), // <-- fix here
      tags: [],
    },
    privateKey
  ) as Event;
};

// Encrypt the seal into a wrapped event using a random one-time key
const createWrap = (
  event: Event,
  recipientPublicKey: string
): Event => {
  const randomKey = generateSecretKey();

  return finalizeEvent(
    {
      kind: 1059,
      content: nip44Encrypt(event, randomKey, recipientPublicKey),
      created_at: now(),//Math.floor(Date.now() / 1000),
      tags: [["p", recipientPublicKey]],
    },
    randomKey
  ) as Event;
};

const giftWrapEvent = async (
  message: string,
  senderPriv: string,
  recipientPubHex: string,
): Promise<Event> => {
const senderPrivBytes = hexToBytes(senderPriv);
  const rumor1 = createRumor(
    {
      kind: 1,
      content: message,
    },
    senderPrivBytes
  );
  const seal = createSeal(rumor1, senderPrivBytes, recipientPubHex);
  const wrap = createWrap(seal, recipientPubHex);
  return wrap;
};



const SendMessageBox: React.FC = () => {
  const { privkey} = useKeys();
  const [message, setMessage] = useState("");
  const { recipientPubKey } = useRecipient();
  const { addMessage } = useContext(MessageContext);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };
  const handleSend = async () => {
    if (!recipientPubKey || !message.trim()) return;

    try {
      // Convert recipient pubkey to hex
      let recipientPubHex = recipientPubKey;
      if (recipientPubKey.startsWith('npub1')) {
        const decoded = nip19.decode(recipientPubKey);
        if (decoded.type !== 'npub') throw new Error('Invalid npub');
        recipientPubHex = bytesToHex(decoded.data as unknown as Uint8Array);
      }
      // console.log("Recipient Pub Hex:", recipientPubHex);
      const fullEvent = await giftWrapEvent(
        message,
        privkey,
        recipientPubHex
      );
      // const eventWithPow = await finalizeEvent(unsignedEvent, privkey, { difficulty: 28 });
      const ID = getEventHash(fullEvent);
    

      const Event = {
        id: ID ,
        pubkey: recipientPubHex,
        content: message,
        created_at: now(),
        isIncoming : false
      };
      console.log("Event:", );
      addMessage(Event);
      const pool = new SimplePool();
      // const pubs = 
      pool.publish(relays, fullEvent);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="rounded-full relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-12 right-1 z-10">
          <Picker onEmojiClick={onEmojiClick} />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center bg-gray-100 rounded-full p-2 shadow-md">
        <textarea
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          rows={1}
          placeholder="Type your message..."
          className="w-full bg-transparent rounded-2xl text-gray-700 placeholder-gray-400 border-none focus:outline-none resize-none p-2"
          style={{ minHeight: "40px", maxHeight: "100px" }} // Adjust height dynamically
          onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex items-center space-x-3 mx-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-white text-2xl hover:text-gray-300 focus:outline-none"
          >
            😊  
          </button>
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-3 py-1 rounded-2xl hover:bg-green-900 focus:outline-none"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageBox;