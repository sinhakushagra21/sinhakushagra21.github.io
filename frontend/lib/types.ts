export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  lowConfidence?: boolean;
  isStreaming?: boolean;
  scheduler?: boolean;
}

export interface Source {
  title: string;
  category: string;
  score: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
