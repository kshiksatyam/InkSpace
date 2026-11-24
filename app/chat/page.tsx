"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import {
  Search,
  SquarePen,
  Send,
  Loader2,
  MoreVertical,
  ChevronLeft,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

interface Chat {
  id: string;
  participant: Participant;
  lastMessage: {
    text: string;
    createdAt: string;
    senderId: string;
    read: boolean;
  } | null;
  unread: boolean;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

function formatChatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  
  // If today, show time (e.g., 7:15 pm)
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  }

  // If this year, show month/day (e.g., 6/28)
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // Otherwise show full date
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id;
  const { openModal } = useAuthModal();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "direct" | "unread">("all");
  
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all chats
  const fetchChats = useCallback(async (silent = false) => {
    if (!silent) setLoadingChats(true);
    try {
      const res = await fetch("/api/chats");
      if (!res.ok) throw new Error("Failed to load chats");
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load chats");
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // Fetch messages for active chat
  const fetchMessages = useCallback(async (chatId: string, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
      
      // Update unread count local state
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread: false } : c));
    } catch (err) {
      console.error(err);
      toast.error("Could not load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Initialize chats
  useEffect(() => {
    if (status === "authenticated") {
      fetchChats();
      // Periodically refresh chat list
      const interval = setInterval(() => fetchChats(true), 10000);
      return () => clearInterval(interval);
    }
  }, [status, fetchChats]);

  // Handle active chat changes & polling messages
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    if (activeChat) {
      fetchMessages(activeChat.id);
      
      // Poll active chat messages every 3 seconds for mock real-time feeling
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(activeChat.id, true);
      }, 3000);
    } else {
      setMessages([]);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activeChat, fetchMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!activeChat || !inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistic message addition
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      chatId: activeChat.id,
      senderId: currentUserId!,
      text: textToSend,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await fetch(`/api/chats/${activeChat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend }),
      });

      if (!res.ok) throw new Error("Failed to send");
      const savedMsg = await res.json();
      
      // Replace optimistic message
      setMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m));
      
      // Refresh chat list immediately to update preview
      fetchChats(true);

      // Trigger automatic AI-like simulated response if messaging the mock accounts for better UX
      if (
        ["arisa", "stoic", "courtney", "inkspace"].includes(
          activeChat.participant.username
        )
      ) {
        setTimeout(async () => {
          try {
            // Trigger automated reply endpoint or create direct reply
            await fetch(`/api/chats/${activeChat.id}/reply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ triggerText: textToSend }),
            });
            fetchMessages(activeChat.id, true);
            fetchChats(true);
          } catch (e) {
            console.error("Auto-reply error:", e);
          }
        }, 2500);
      }

    } catch (err) {
      console.error(err);
      toast.error("Message failed to send");
      // Remove optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // Compose new chat placeholder function
  const handleNewChat = () => {
    toast.info("Subscriber chat compose panel: Choose from followers or search readers.");
  };

  // Filter chats based on query and tab selection
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participant.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "unread") return chat.unread;
    if (filterTab === "direct") return chat.participant.username !== "inkspace"; // Mocking Direct chats as anything except main announcements
    return true;
  });

  if (status === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0f0f0f] h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#CBA6F7]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f0f0f] text-center p-6 h-screen">
        <MessageSquare className="h-16 w-16 text-[#333] mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Connect with your subscribers</h2>
        <p className="text-[#666] max-w-sm mb-6 text-sm">
          Keep conversations going. Send messages, share drafts, and build a closer connection with your audience.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => openModal("login")}
            className="bg-[#CBA6F7] hover:bg-[#b48fe8] text-[#1a1025] font-semibold px-5 py-2.5 rounded-full text-sm transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => openModal("register")}
            className="border border-white/10 hover:bg-white/5 text-white font-medium px-5 py-2.5 rounded-full text-sm transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-screen bg-[#0f0f0f] overflow-hidden">
      
      {/* LEFT PANE: Chat List */}
      <div className={`w-full md:w-[340px] border-r border-white/5 flex flex-col h-full bg-[#0f0f0f] shrink-0 ${activeChat ? "hidden md:flex" : "flex"}`}>
        
        {/* Search & Compose */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#555]" />
              <input
                type="text"
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161616] border border-white/5 hover:border-white/10 focus:border-[#CBA6F7]/30 text-white rounded-lg pl-9 pr-4 py-2 text-sm placeholder-[#555] outline-none transition-all"
              />
            </div>
            <button
              onClick={handleNewChat}
              className="h-9 w-9 bg-[#161616] border border-white/5 hover:border-white/10 hover:text-[#CBA6F7] rounded-lg flex items-center justify-center text-[#888] transition-colors cursor-pointer"
              title="New Chat"
            >
              <SquarePen className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-[#161616]/50 p-0.5 rounded-lg border border-white/5">
            {(["all", "direct", "unread"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer capitalize ${
                  filterTab === tab
                    ? "bg-[#222] text-white"
                    : "text-[#666] hover:text-[#aaa]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chats Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {loadingChats ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#444]" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-sm text-[#555]">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = activeChat?.id === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-white/[0.06]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Left element: Avatar & Unread indicator */}
                  <div className="relative shrink-0">
                    <UserAvatar
                      name={chat.participant.name}
                      image={chat.participant.image}
                      className="h-10 w-10 border border-white/5"
                    />
                    {chat.unread && (
                      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-[#CBA6F7] rounded-full border-2 border-[#0f0f0f]" />
                    )}
                  </div>

                  {/* Center & Right element: Text & Meta info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <h4 className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-[#ddd]"}`}>
                        {chat.participant.name}
                      </h4>
                      {chat.lastMessage && (
                        <span className="text-[10px] text-[#555] shrink-0 font-medium ml-1">
                          {formatChatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-xs truncate ${chat.unread ? "text-white font-medium" : "text-[#777]"}`}>
                      {chat.lastMessage ? chat.lastMessage.text : "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Chat View */}
      <div className={`flex-1 flex flex-col h-full bg-[#0d0d0d] ${!activeChat ? "hidden md:flex" : "flex"}`}>
        {activeChat ? (
          <>
            {/* Chat Room Header */}
            <div className="h-16 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-[#0f0f0f]/80 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button for mobile view */}
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-[#888] hover:text-white mr-1 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <UserAvatar
                  name={activeChat.participant.name}
                  image={activeChat.participant.image}
                  className="h-9 w-9 border border-white/5"
                />

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate leading-snug">
                    {activeChat.participant.name}
                  </h3>
                  <p className="text-[10px] text-[#666] truncate font-medium">
                    @{activeChat.participant.username} • Subscriber Chat
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-white/5 text-[#888] hover:text-white transition-colors cursor-pointer">
                  <MoreVertical className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Chat Room Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-[#444]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageSquare className="h-10 w-10 text-[#222] mb-3" />
                  <p className="text-sm text-[#444]">No messages in this chat yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isSelf = message.senderId === currentUserId;
                    
                    // Grouping style tweaks
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const isConsecutive = prevMsg?.senderId === message.senderId;

                    return (
                      <div
                        key={message.id}
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"} ${isConsecutive ? "mt-1" : "mt-3"}`}
                      >
                        {!isSelf && !isConsecutive && (
                          <span className="text-[10px] text-[#555] font-semibold mb-1 ml-1">
                            {activeChat.participant.name}
                          </span>
                        )}
                        
                        <div
                          className={`max-w-[75%] px-3.5 py-2 text-sm rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                            isSelf
                              ? "bg-[#CBA6F7] text-[#1a1025] rounded-tr-sm font-medium"
                              : "bg-[#181818] border border-white/5 text-white rounded-tl-sm"
                          }`}
                        >
                          {message.text}
                        </div>
                        
                        <span className="text-[9px] text-[#444] mt-0.5 px-1 font-medium">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[#0f0f0f]/80 border-t border-white/5 flex gap-2 items-center shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeChat.participant.name}...`}
                disabled={sending}
                className="flex-1 bg-[#161616] border border-white/5 hover:border-white/10 focus:border-[#CBA6F7]/30 text-white rounded-xl px-4 py-2.5 text-sm placeholder-[#555] outline-none transition-all disabled:opacity-55"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="h-10 w-10 bg-[#CBA6F7] disabled:bg-[#333] disabled:text-[#666] hover:bg-[#b48fe8] text-[#1a1025] rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </button>
            </form>
          </>
        ) : (
          /* Placeholder Pane */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0d0d0d]">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#CBA6F7]/10 border border-[#CBA6F7]/20">
              <MessageSquare className="h-6 w-6 text-[#CBA6F7]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No chat selected</h3>
            <p className="text-xs text-[#555] max-w-[240px] leading-relaxed">
              Select a subscriber or community thread from the list on the left to start chatting.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
