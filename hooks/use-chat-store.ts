"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  isArchived?: boolean
  isPinned?: boolean
}

interface ChatStore {
  chats: Chat[]
  createChat: () => string
  deleteChat: (id: string) => void
  updateChatTitle: (id: string, title: string) => void
  addMessage: (chatId: string, message: Message) => void
  getCurrentChat: (chatId: string | null) => Chat | undefined
  archiveChat: (id: string) => void
  unarchiveChat: (id: string) => void
  pinChat: (id: string) => void
  unpinChat: (id: string) => void
  getActiveChats: () => Chat[]
  getArchivedChats: () => Chat[]
  clearAllChats: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],

      createChat: () => {
        const id = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newChat: Chat = {
          id,
          title: "New Chat",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isArchived: false,
          isPinned: false,
        }

        set((state) => ({
          chats: [newChat, ...state.chats],
        }))

        return id
      },

      deleteChat: (id: string) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
        }))
      },

      updateChatTitle: (id: string, title: string) => {
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === id ? { ...chat, title, updatedAt: Date.now() } : chat)),
        }))
      },

      addMessage: (chatId: string, message: Message) => {
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: Date.now(),
              }

              // Auto-generate title from first user message
              if (chat.title === "New Chat" && message.role === "user") {
                const cleanTitle = message.content.replace(/\n/g, " ").replace(/\s+/g, " ").trim()
                updatedChat.title = cleanTitle.slice(0, 60) + (cleanTitle.length > 60 ? "..." : "")
              }

              return updatedChat
            }
            return chat
          }),
        }))
      },

      getCurrentChat: (chatId: string | null) => {
        if (!chatId) return undefined
        return get().chats.find((chat) => chat.id === chatId)
      },

      archiveChat: (id: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, isArchived: true, updatedAt: Date.now() } : chat,
          ),
        }))
      },

      unarchiveChat: (id: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, isArchived: false, updatedAt: Date.now() } : chat,
          ),
        }))
      },

      pinChat: (id: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, isPinned: true, updatedAt: Date.now() } : chat,
          ),
        }))
      },

      unpinChat: (id: string) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, isPinned: false, updatedAt: Date.now() } : chat,
          ),
        }))
      },

      getActiveChats: () => {
        return get()
          .chats.filter((chat) => !chat.isArchived)
          .sort((a, b) => {
            // Pinned chats first, then by updatedAt
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            return b.updatedAt - a.updatedAt
          })
      },

      getArchivedChats: () => {
        return get()
          .chats.filter((chat) => chat.isArchived)
          .sort((a, b) => b.updatedAt - a.updatedAt)
      },

      clearAllChats: () => {
        set({ chats: [] })
      },
    }),
    {
      name: "copilot-chat-store",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Handle migration from version 0/1 to version 2
        if (version < 2) {
          // If the persisted state has chats, migrate them
          if (persistedState && persistedState.chats) {
            return {
              chats: persistedState.chats.map((chat: any) => ({
                ...chat,
                // Add missing properties with defaults
                isArchived: chat.isArchived ?? false,
                isPinned: chat.isPinned ?? false,
                updatedAt: chat.updatedAt ?? chat.createdAt ?? Date.now(),
              })),
            }
          }
        }
        return persistedState
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Failed to rehydrate chat store:", error)
          // Clear corrupted storage and start fresh
          localStorage.removeItem("copilot-chat-store")
        }
      },
    },
  ),
)
