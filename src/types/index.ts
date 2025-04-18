export interface Message {
    id: string;
    pubkey: string;
    content: string;
    created_at: number;
    tags: string[][]; // 👈 Add this line!
  }
  