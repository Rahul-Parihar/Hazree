"use client";

import React, { useState } from "react";
import {
  Search,
  Plus,
  MessageSquare,
  Send,
  User,
  Paperclip,
  Smile,
  X,
  CheckCheck,
} from "lucide-react";
import { useCustomerApp } from "@/context/CustomerAppContext";

interface MessageItem {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  timestamp: string;
  lastMessage: string;
  messages: MessageItem[];
}

export default function MessagesView() {
  const { activeEmployee, showToast } = useCustomerApp();
  const [searchContact, setSearchContact] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>("1");
  const [inputMessage, setInputMessage] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      name: "Shubham Parmar",
      timestamp: "3 weeks ago",
      lastMessage: "bizzjob password :- Bizzjob@2026",
      messages: [
        {
          id: "m1",
          sender: "them",
          text: "Hi Anand, can you share the test credentials for bizzjob app?",
          time: "10:14 AM",
        },
        {
          id: "m2",
          sender: "me",
          text: "Sure! Let me check the staging configuration.",
          time: "10:18 AM",
        },
        {
          id: "m3",
          sender: "them",
          text: "bizzjob password :- Bizzjob@2026",
          time: "10:20 AM",
        },
      ],
    },
    {
      id: "2",
      name: "Sanskar Jaiswal",
      timestamp: "2 months ago",
      lastMessage: "Test message",
      messages: [
        {
          id: "m4",
          sender: "them",
          text: "Test message",
          time: "03:45 PM",
        },
      ],
    },
    {
      id: "3",
      name: "Raj Verma",
      timestamp: "3 months ago",
      lastMessage: "API endpoint deployment ready for review.",
      messages: [
        {
          id: "m5",
          sender: "them",
          text: "API endpoint deployment ready for review.",
          time: "11:30 AM",
        },
      ],
    },
  ]);

  const activeConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConversationId) return;

    const newMsg: MessageItem = {
      id: String(Date.now()),
      sender: "me",
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversationId) {
          return {
            ...conv,
            lastMessage: newMsg.text,
            timestamp: "Just now",
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );

    setInputMessage("");
  };

  const handleStartNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    const newConv: Conversation = {
      id: String(Date.now()),
      name: newChatName.trim(),
      timestamp: "Just now",
      lastMessage: "Started new conversation",
      messages: [],
    };

    setConversations([newConv, ...conversations]);
    setSelectedConversationId(newConv.id);
    setNewChatName("");
    setIsNewChatModalOpen(false);
    showToast(`New conversation started with ${newConv.name}`, "success");
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 1. Action Header: + New Conversation (Right) */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsNewChatModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* 2. Main Two-Column Messages Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col md:flex-row min-h-[580px] h-[calc(100vh-230px)]">
        {/* Left Column: Contacts List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col shrink-0">
          {/* Search Header */}
          <div className="p-3.5 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Type to search contact"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
            {filteredConversations.map((conv) => {
              const isSelected = selectedConversationId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`w-full text-left p-4 flex items-start gap-3 transition-colors ${
                    isSelected
                      ? "bg-[#e8edf5]"
                      : "hover:bg-slate-50/80 bg-white"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                    <User className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {conv.name}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {conv.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Box or Empty Placeholder */}
        <div className="flex-1 flex flex-col bg-white">
          {!activeConversation ? (
            /* Empty State (Matching screenshot center speech bubble) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-400 stroke-[1.5]" />
              <p className="text-xs text-slate-400 font-medium">
                - Select a conversation to send a message -
              </p>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 flex flex-col h-full">
              {/* Chat Top Header */}
              <div className="p-3.5 px-6 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {activeConversation.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#f8fafc]/40">
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "me" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${
                        msg.sender === "me"
                          ? "bg-[#1a73e8] text-white rounded-br-xs shadow-xs"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2 shrink-0"
              >
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />

                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Start New Conversation</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartNewChat} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="e.g. Yash Bhatewara"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold shadow-sm"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
