//src/Components/SendMessageBox.tsx
import React, { useState, useContext,useId } from "react";
import { useRecipient } from "../contexts/RecipientContext";
import { MessageContext } from "../contexts/MessageContext";
import { SimplePool, Event, nip44, nip19, generateSecretKey, serializeEvent, getEventHash, getPublicKey,type EventTemplate, type UnsignedEvent, } from "nostr-tools";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import { useKeys } from "../contexts/KeyContext";
// import { minePowEvent } from "../utils/minePow";
import { getConversationKey, encrypt } from "nostr-tools/nip44";
import { finalizeEvent } from 'nostr-tools/pure';


const relays = [
  "wss://relay.damus.io",
  // "wss://nos.lol",
  // "wss://nostr.mom",
];

type Rumor = UnsignedEvent & { id: string };

const TWO_DAYS = 2 * 24 * 60 * 60;

const now = (): number => Math.round(Date.now() / 1000);
const randomNow = (): number => Math.round(now() - Math.random() * TWO_DAYS);

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

// Create a base Nostr event (Rumor)
const createRumor = (
  event: Partial<UnsignedEvent>,
  privateKey: Uint8Array
): Rumor => {
  const unsigned: UnsignedEvent = {
    created_at: now(),
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
      created_at: randomNow(),
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
      created_at: randomNow(),
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
      content: "Are you going to the party tonight?",
    },
    senderPrivBytes
  );
  const seal = createSeal(rumor1, senderPrivBytes, recipientPubHex);
  const wrap = createWrap(seal, recipientPubHex);
  return wrap;
  // const rumor: Omit<Event, 'id' | 'sig'> = {
  //   kind: 14,
  //   content: message,
  //   pubkey: getPublicKey(senderPrivBytes),
  //   tags: [["p", recipientPubHex]],
  //   created_at: Math.floor(Date.now() / 1000),
  // };

  // const rumorJson = JSON.stringify(rumor);
  // const rumorBytes = new TextEncoder().encode(rumorJson);
  // const sealConversationKey = getConversationKey(senderPrivBytes, recipientPubHex);
  // const encryptedRumor = await encrypt(bytesToHex(sealConversationKey), rumorBytes);

  // const unsignedSeal: Omit<Event, 'id' | 'sig'> = {
  //   kind: 13,
  //   pubkey: getPublicKey(senderPrivBytes),
  //   created_at: Math.floor(Date.now() / 1000),
  //   tags: [],
  //   content: encryptedRumor,
  // };
  // const signedSeal = finalizeEvent(unsignedSeal, senderPrivBytes);

  // const ephemeralPrivkey = generateSecretKey();
  // const ephemeralPubkey = getPublicKey(ephemeralPrivkey);
  // const sealJson = JSON.stringify(signedSeal);
  // const sealBytes = new TextEncoder().encode(sealJson);
  // const giftWrapConversationKey = getConversationKey(ephemeralPrivkey, recipientPubHex);
  // const encryptedSeal = await encrypt(bytesToHex(giftWrapConversationKey), sealBytes);

  // const unsignedGiftWrap: Omit<Event, 'id' | 'sig'> = {
  //   kind: 1059,
  //   pubkey: ephemeralPubkey,
  //   created_at: Math.floor(Date.now() / 1000),
  //   tags: [["p", recipientPubHex]],
  //   content: encryptedSeal,
  // };

  // const signedGiftWrap = finalizeEvent(unsignedGiftWrap, ephemeralPrivkey);
  //   return signedGiftWrap;
};



const SendMessages1: React.FC = () => {
  const { privkey, pubkey, setPrivkeyFromNsec } = useKeys();
  const [message, setMessage] = useState("");
  const { recipientPubKey } = useRecipient();
  const { addMessage } = useContext(MessageContext);
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

      const fullEvent = await giftWrapEvent(
        message,
        privkey,
        recipientPubHex
      );
      // const eventWithPow = await finalizeEvent(unsignedEvent, privkey, { difficulty: 28 });
      const ID = getEventHash(fullEvent);
      const getIndianTime = () => {
        const indianTime = new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return indianTime;
      };

      const Event = {
        id: ID ,
        pubkey: recipientPubHex,
        content: message,
        created_at: Date.now(),
        isIncoming : false
      };
      addMessage(Event);
      new SimplePool().publish(relays, fullEvent);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Type your message..."
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleSend}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900"
      >
        Send
      </button>
    </div>
  );
};

export default SendMessages1;