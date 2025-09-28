"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Clock,
  Archive,
  MoreHorizontal,
  Pin,
  PinOff,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatSidebarProps {
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onCloseSidebar: () => void;
}

interface ChatGroup {
  title: string;
  chats: any[];
  isExpanded: boolean;
}

export function ChatSidebar({
  currentChatId,
  onChatSelect,
  onCloseSidebar,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      pinned: true,
      today: true,
      yesterday: true,
      thisweek: true,
      older: false,
    }
  );

  const {
    createChat,
    deleteChat,
    updateChatTitle,
    archiveChat,
    pinChat,
    unpinChat,
    getActiveChats,
  } = useChatStore();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const chats = getActiveChats();

  const groupChatsByTime = (chats: any[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups: ChatGroup[] = [];

    const pinnedChats = chats.filter((chat) => chat.isPinned);
    if (pinnedChats.length > 0) {
      groups.push({
        title: "Pinned",
        chats: pinnedChats,
        isExpanded: expandedGroups.pinned,
      });
    }

    const unpinnedChats = chats.filter((chat) => !chat.isPinned);

    const timeGroups: ChatGroup[] = [
      { title: "Today", chats: [], isExpanded: expandedGroups.today },
      { title: "Yesterday", chats: [], isExpanded: expandedGroups.yesterday },
      { title: "This Week", chats: [], isExpanded: expandedGroups.thisweek },
      { title: "Older", chats: [], isExpanded: expandedGroups.older },
    ];

    unpinnedChats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt || chat.createdAt);

      if (chatDate >= today) {
        timeGroups[0].chats.push(chat);
      } else if (chatDate >= yesterday) {
        timeGroups[1].chats.push(chat);
      } else if (chatDate >= thisWeek) {
        timeGroups[2].chats.push(chat);
      } else {
        timeGroups[3].chats.push(chat);
      }
    });

    groups.push(...timeGroups.filter((group) => group.chats.length > 0));
    return groups;
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const chatGroups = groupChatsByTime(filteredChats);

  const handleNewChat = () => {
    const newChatId = createChat();
    onChatSelect(newChatId);
    onCloseSidebar();
  };

  const handleChatSelect = (chatId: string) => {
    onChatSelect(chatId);
    onCloseSidebar();
  };

  const toggleGroup = (groupTitle: string) => {
    const key = groupTitle.toLowerCase().replace(" ", "");
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const startEditing = (chat: any) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      updateChatTitle(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  return (
    <motion.div
      ref={sidebarRef}
      className="flex flex-col h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="p-6 border-b border-emerald-100/50">
        <div className="hidden lg:flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-emerald-900 text-lg">MedicalAI</h1>
            <p className="text-xs text-emerald-600 font-medium">
              Healthcare Assistant
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
          >
            <Plus className="h-5 w-5" />
            New Medical Consultation
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
            <Input
              placeholder="Search medical conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-emerald-50/50 border-emerald-200/50 focus:border-emerald-400 focus:ring-emerald-400/20 h-10 rounded-xl"
            />
          </div>
        </motion.div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="py-4">
          <AnimatePresence>
            {chatGroups.map((group, groupIndex) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="mb-6"
              >
                <Button
                  variant="ghost"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full justify-start gap-2 h-9 px-3 mb-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                >
                  {group.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="uppercase tracking-wider">
                    {group.title}
                  </span>
                  <span className="ml-auto text-xs opacity-60 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {group.chats.length}
                  </span>
                </Button>

                <AnimatePresence>
                  {group.isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      {group.chats.map((chat, index) => (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className={cn(
                              "group flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-all duration-200",
                              "hover:bg-emerald-50 hover:shadow-sm hover:border-emerald-200/50 border border-transparent",
                              currentChatId === chat.id &&
                                "bg-emerald-100 shadow-sm border-emerald-200 ring-1 ring-emerald-200"
                            )}
                            onClick={() => handleChatSelect(chat.id)}
                          >
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {chat.isPinned && (
                                <Pin className="h-3 w-3 text-emerald-600" />
                              )}
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Stethoscope className="h-4 w-4 text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              {editingChatId === chat.id ? (
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit();
                                    if (e.key === "Escape") cancelEdit();
                                  }}
                                  className="h-7 text-sm px-2 py-1"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <p className="text-sm font-semibold truncate leading-tight text-slate-800">
                                    {chat.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-3 w-3 text-emerald-500" />
                                    <span className="text-xs text-emerald-600 font-medium">
                                      {chat.messages.length} messages
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-emerald-200"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(chat);
                                    }}
                                  >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      chat.isPinned
                                        ? unpinChat(chat.id)
                                        : pinChat(chat.id);
                                    }}
                                  >
                                    {chat.isPinned ? (
                                      <>
                                        <PinOff className="h-4 w-4 mr-2" />
                                        Unpin
                                      </>
                                    ) : (
                                      <>
                                        <Pin className="h-4 w-4 mr-2" />
                                        Pin
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      archiveChat(chat.id);
                                    }}
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteChat(chat.id);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredChats.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-slate-500 py-16 px-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold mb-2">
                No medical consultations yet
              </p>
              <p className="text-xs opacity-60">
                Start a new conversation to begin
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-emerald-100/50 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
        <div className="flex items-center justify-between text-xs text-emerald-600">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Powered by Gemini</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-medium">AI Online</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
