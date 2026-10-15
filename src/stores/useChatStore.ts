// ============================================================
// Chat Store — Zustand state for the AI tutor conversations
// ============================================================
import { create } from 'zustand';
import type { ChatMessage, ChatConversation, AiTutorContext, ChatState } from '../types/ai';

interface ChatActions {
  /** Create a new conversation */
  createConversation: (title: string) => string;
  /** Set the active conversation */
  setActiveConversation: (id: string | null) => void;
  /** Add a message to the active conversation */
  addMessage: (message: ChatMessage) => void;
  /** Update context for AI awareness */
  setContext: (context: Partial<AiTutorContext>) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error */
  setError: (error: string | null) => void;
}

const useChat = create<ChatState & ChatActions>((set, get) => ({
  // ---- State ----
  conversations: [],
  activeConversationId: null,
  context: {
    activeStructure: null,
    lastOperation: null,
    currentTopic: null,
    userLevel: 'beginner',
  },
  isLoading: false,
  error: null,

  // ---- Actions ----
  createConversation: (title: string) => {
    const id = crypto.randomUUID();
    const conversation: ChatConversation = {
      id,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: id,
    }));
    return id;
  },

  setActiveConversation: (id) =>
    set({ activeConversationId: id }),

  addMessage: (message) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : conv
      ),
    }));
  },

  setContext: (ctx) =>
    set((state) => ({
      context: { ...state.context, ...ctx },
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));

if (typeof window !== 'undefined') window.addEventListener('alvio-session-ended', () => useChat.setState({ conversations: [], activeConversationId: null, isLoading: false, error: null }));
export default useChat;
