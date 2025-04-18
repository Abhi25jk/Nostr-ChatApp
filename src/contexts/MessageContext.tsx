import React, { createContext, useState, ReactNode } from "react";

export interface Message {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  tags?: string[][];
  isIncoming: boolean;
}

interface MessageContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
}

export const MessageContext = createContext<MessageContextType>({
  messages: [],
  setMessages: () => {},
  addMessage: () => {},
});

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prev) => {
      if (prev.find((msg) => msg.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  return (
    <MessageContext.Provider value={{ messages, setMessages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
