export interface User {
  is_authenticated: boolean;
  id: string;
  email: string;
  name: string;
  is_verified:boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface DetectedDisease {
  is_leaf:boolean;
  detected:boolean;
  name: string;
  confidence: number;
  description: string;
  message: string;
}