
export enum ModuleType {
  CHAT = 'chat',
  IMAGE = 'image',
  AFFICHE = 'affiche',
  SCOLAIRE = 'scolaire',
  TRANSLATOR = 'translator',
  WALLET = 'wallet',
  ADMIN = 'admin'
}

export interface UserProfile {
  id: string;
  email: string;
  tokens: number;
  role: 'user' | 'admin';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  tokens: number;
  transaction_id: string;
  status: 'pending' | 'completed';
  created_at: string;
}
