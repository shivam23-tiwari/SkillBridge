import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation } from '../types';
import { DataService } from '../services/store';
import { useAuth } from './AuthContext';

interface ChatContextType {
  isChatOpen: boolean;
  activeConversationId: string | null;
  conversations: Conversation[];
  unreadMessagesCount: number;
  openChat: (conversationId?: string) => void;
  closeChat: () => void;
  setActiveConversationId: (id: string | null) => void;
  refreshConversations: () => Promise<void>;
  startChatWithUser: (params: {
    recipientId: string;
    projectId?: string;
    projectTitle?: string;
    initialMessage: string;
  }) => Promise<Conversation>;
  acceptRequest: (conversationId: string) => Promise<void>;
  declineRequest: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const refreshConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      return;
    }
    try {
      const list = await DataService.getConversations(user.id);
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshConversations();
    const interval = setInterval(refreshConversations, 6000);
    return () => clearInterval(interval);
  }, [refreshConversations]);

  const openChat = useCallback((conversationId?: string) => {
    setIsChatOpen(true);
    if (conversationId) {
      setActiveConversationId(conversationId);
      if (user?.id) {
        DataService.markConversationRead(conversationId, user.id);
      }
    }
  }, [user?.id]);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const startChatWithUser = async (params: {
    recipientId: string;
    projectId?: string;
    projectTitle?: string;
    initialMessage: string;
  }): Promise<Conversation> => {
    if (!user) throw new Error('Authentication required');
    const conv = await DataService.createChatRequest({
      senderId: user.id,
      recipientId: params.recipientId,
      projectId: params.projectId,
      projectTitle: params.projectTitle,
      message: params.initialMessage,
    });
    await refreshConversations();
    setActiveConversationId(conv.id);
    setIsChatOpen(true);
    return conv;
  };

  const acceptRequest = async (conversationId: string) => {
    if (!user) return;
    await DataService.respondChatRequest(conversationId, user.id, true);
    await refreshConversations();
    setActiveConversationId(conversationId);
    setIsChatOpen(true);
  };

  const declineRequest = async (conversationId: string) => {
    if (!user) return;
    await DataService.respondChatRequest(conversationId, user.id, false);
    await refreshConversations();
  };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        activeConversationId,
        conversations,
        unreadMessagesCount,
        openChat,
        closeChat,
        setActiveConversationId,
        refreshConversations,
        startChatWithUser,
        acceptRequest,
        declineRequest,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
