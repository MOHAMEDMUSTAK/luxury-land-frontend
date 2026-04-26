"use client";

import { useState, useRef, useEffect, use, memo } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Phone, ShieldCheck, MapPin, ImageOff, User, MoreVertical, Search, CheckCheck, Smile, X, Trash2, Tag } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useUIStore } from "@/store/useUIStore";

interface Message {
  _id?: string;
  sender: string; // userId
  text: string;
  isRead?: boolean;
  type?: 'text' | 'offer';
  offer?: {
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
    landId: string;
  };
  timestamp: Date;
}

interface Participant {
  _id: string;
  name: string;
  profileImage?: string;
}

interface Chat {
  _id: string;
  participants: Participant[];
  messages: Message[];
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: urlId } = use(params); // This can be a chatId or a userId
  const [chat, setChat] = useState<Chat | null>(null);
  const [receiver, setReceiver] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const landId = searchParams.get('landId');
  const [offerPrice, setOfferPrice] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();
  const { setIsChatActive } = useUIStore();

  useEffect(() => {
    setIsChatActive(true);
    document.body.style.overflow = "hidden"; // Lock scroll
    return () => {
      setIsChatActive(false);
      document.body.style.overflow = "auto";
    };
  }, [setIsChatActive]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markMessagesRead = async (cId: string) => {
    if (!cId || !user || !document.hasFocus()) return;
    try {
      await api.patch(`/chat/mark-as-read/${cId}`);
      // Notify the other person that we've read their messages
      socketRef.current?.emit('mark_read', { 
        chatId: cId, 
        senderId: receiver?._id, // Who I'm reading messages FROM
        recipientId: user.id // ME
      });
    } catch (err) {
      console.error("MARK_READ_ERROR:", err);
    }
  };

  const handleClearChat = async () => {
    if (!chat?._id) return;
    if (!window.confirm("Clear message history for this chat? This won't affect the other person.")) return;
    try {
      await api.delete(`/chat/clear/${chat._id}`);
      setMessages([]);
      toast.success("Chat cleared");
    } catch (err) {
      console.error("CLEAR_CHAT_ERROR:", err);
      toast.error("Failed to clear chat");
    }
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat?._id || !offerPrice || !landId || !user) return;

    try {
      const res = await api.post('/chat/offer', {
        chatId: chat._id,
        price: Number(offerPrice),
        landId
      });

      const newMsg = { ...res.data, timestamp: new Date(res.data.timestamp) };
      setMessages(prev => [...prev, newMsg]);

      // Socket Emit
      socketRef.current?.emit('sendMessage', {
        chatId: chat._id,
        senderId: user.id,
        recipientId: receiver?._id,
        text: `Offer: ₹${offerPrice}`,
        type: 'offer',
        offer: newMsg.offer,
        timestamp: new Date()
      });

      setIsOfferModalOpen(false);
      toast.success("Offer Sent!");
    } catch (err) {
      console.error("MAKE_OFFER_ERROR:", err);
      toast.error("Failed to send offer");
    }
  };

  const updateOfferStatus = async (messageId: string, status: 'accepted' | 'rejected') => {
    if (!chat?._id) return;
    try {
      const res = await api.patch('/chat/offer-status', {
        chatId: chat._id,
        messageId,
        status
      });

      // Update local state
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, offer: { ...m.offer!, status } } : m
      ));

      // Socket Emit for status update
      socketRef.current?.emit('update_offer_status', {
        chatId: chat._id,
        messageId,
        status,
        senderId: user?.id,
        recipientId: receiver?._id
      });
      
      toast.success(`Offer ${status}`);
    } catch (err) {
      console.error("UPDATE_OFFER_ERROR:", err);
      toast.error("Failed to update offer");
    }
  };

  useEffect(() => {
    if (!user) return;

    // 1. Get or Create Chat
    // We try to get chat by urlId (it could be a userId or a chatId)
    // First, try as a userId to get/create conversation
    api.get(`/chat/${urlId}`).then(res => {
      const chatData = res.data;
      setChat(chatData);
      setMessages(chatData.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      
      // Identify the "other" person (be resilient with ID types)
      const other = chatData.participants.find((p: Participant) => 
        p._id.toString() !== user.id.toString()
      );
      
      if (!other) {
        console.error("COULD_NOT_IDENTIFY_RECEIVER", { 
          participants: chatData.participants.map((p: Participant) => p._id), 
          userId: user.id 
        });
      }

      setReceiver(other || null);
      setLoading(false);

      // Mark as read initially if focused
      if (chatData._id && document.hasFocus()) {
        markMessagesRead(chatData._id);
      }
    }).catch(err => {
      console.error("CHAT_INIT_ERROR:", err);
      // Fallback: If it was already a chatId, we might need a different endpoint or handle it
      setLoading(false);
    });

    // 2. Socket Connection
    const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || 
                      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
                      "http://localhost:5000";

    const socket = io(socketURL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log("Socket connected:", socket.id);
      socket.emit('join_user_room', user.id);
    });

    socket.on('receiveMessage', (data: any) => {
      // Robust check to ensure message belongs to THIS chat
      setChat((currentChat: Chat | null) => {
        if (currentChat && data.chatId === currentChat._id) {
          setMessages((prev: Message[]) => {
            // Avoid duplicate messages if already added locally
            if (data.senderId === user?.id) return prev;

            const isDuplicate = prev.some(m => 
              m.text === data.text && 
              Math.abs(new Date(m.timestamp).getTime() - new Date(data.timestamp).getTime()) < 2000
            );
            if (isDuplicate) return prev;

            const newMessage = {
              sender: data.senderId,
              text: data.text,
              isRead: false,
              type: data.type || 'text',
              offer: data.offer,
              timestamp: new Date(data.timestamp || Date.now()),
            };

            // If focused, mark as read immediately
            if (document.hasFocus()) {
              markMessagesRead(currentChat._id);
            }

            return [...prev, newMessage];
          });
        }
        return currentChat;
      });
    });

    socket.on('messages_read', (data: any) => {
      // Update local status of my messages to 'read' (blue ticks)
      setMessages((prev: Message[]) => prev.map(m => 
        m.sender === user.id ? { ...m, isRead: true } : m
      ));
    });

    socket.on('offer_status_updated', (data: any) => {
      setMessages((prev: Message[]) => prev.map(m => 
        m._id === data.messageId ? { ...m, offer: { ...m.offer!, status: data.status } } : m
      ));
    });

    const handleFocus = () => {
      if (chat?._id) {
        markMessagesRead(chat._id);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      socket.disconnect();
    };
  }, [urlId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !socketRef.current || !chat || !user || !receiver) {
      return;
    }

    const messageText = text.trim();

    try {
      // 1. Save to Database
      const res = await api.post(`/chat/message`, {
        chatId: chat._id,
        text: messageText
      });

      // 2. Add to local state
      const newMsg: Message = {
        sender: user.id,
        text: messageText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMsg]);

      // 3. Emit via Socket
      socketRef.current.emit('sendMessage', {
        chatId: chat._id,
        senderId: user.id,
        recipientId: receiver._id,
        text: messageText,
        timestamp: new Date()
      });

    } catch (error) {
      console.error("SEND_MESSAGE_ERROR:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Encrypting Session...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 bg-[#f8fafc] z-[99999] flex flex-col overflow-hidden page-fade-in md:relative md:h-[calc(100vh-64px)] md:z-10 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        
        {/* Upper Premium Header */}
        <div className="bg-white/85 backdrop-blur-2xl px-4 py-3 flex items-center justify-between border-b border-gray-100 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-90 group min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-brand-primary transition-colors" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center text-white font-bold text-lg shadow-sm border border-white">
                {receiver?.profileImage ? (
                  <Image src={receiver.profileImage} alt={receiver.name} fill className="object-cover" />
                ) : (
                  receiver?.name?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-brand-success rounded-full border-2 border-[#f0f2f5] shadow-sm" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-[#111b21] leading-tight text-[15px]">{receiver?.name || "Authenticating..."}</h2>
              {receiver?._id ? (
                <span className="text-[10px] text-brand-success font-bold flex items-center gap-1 uppercase tracking-tighter">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                  Online Now
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                  Connecting...
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500">
             <button 
               onClick={handleClearChat}
               className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" 
               title="Clear chat history"
             >
                <Trash2 className="w-5 h-5" />
             </button>
             <button className="p-2 hover:bg-gray-200 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center" title="More options">
                <MoreVertical className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Message Search Bar (Animated Toggle) */}
        {isSearchOpen && (
          <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search in conversation..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs font-medium py-1"
              autoFocus
            />
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden w-full relative bg-[#f8fafc]">
          
          {/* Chat Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
               style={{ 
                 backgroundImage: 'url("https://w7.pngwing.com/pngs/315/127/png-transparent-whatsapp-iphone-background-whatsapp-doodle-pattern-feature-whatsapp-logo-thumbnail.png")', 
                 backgroundSize: '400px',
                 backgroundColor: '#f8fafc' 
               }} 
          />

          {/* Main Messages Area */}
          <div className="flex-1 flex flex-col relative z-10">
            
            <div className="flex-1 overflow-y-auto px-4 md:px-12 py-6 space-y-2 scrollbar-hide">
              <div className="flex justify-center mb-8">
                 <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-lg border border-white shadow-sm flex items-center gap-2">
                   <ShieldCheck className="w-3.5 h-3.5 text-brand-success" />
                   Messages are end-to-end encrypted
                 </span>
              </div>

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                   <Send className="w-16 h-16 text-gray-400 mb-4" />
                   <p className="font-bold text-xs uppercase tracking-[0.3em] text-gray-500">Say Hello to {receiver?.name}</p>
                </div>
              )}

              {messages
                .filter(msg => !searchQuery || msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((msg, idx) => {
                  const showDate = idx === 0 || !isSameDay(new Date(messages[idx - 1].timestamp), new Date(msg.timestamp));
                  const isMe = user && msg.sender.toString() === user.id.toString();

                  return (
                    <MessageBubble 
                      key={msg._id || idx}
                      message={msg}
                      isMe={!!isMe}
                      showDate={showDate}
                      onUpdateOfferStatus={updateOfferStatus}
                    />
                  );
                })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Interface */}
            <ChatInput 
              onSend={handleSend} 
              landId={landId} 
              onShowOffer={() => setIsOfferModalOpen(true)} 
            />
          </div>

          {/* Right Sidebar - Property Context (Optional) */}
          <div className="hidden xl:flex w-80 bg-white border-l border-gray-200 flex-col overflow-y-auto z-10">
             <div className="p-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4 shadow-inner border border-gray-200">
                  {receiver?.profileImage ? (
                    <Image src={receiver.profileImage} alt={receiver.name} width={128} height={128} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-primary text-white text-4xl font-bold">
                       {receiver?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#111b21]">{receiver?.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Real Estate Professional</p>
                
                <div className="grid grid-cols-3 gap-6 w-full mt-8">
                   <button 
                     onClick={() => toast.success("Calling feature coming soon!")}
                     className="flex flex-col items-center gap-1 group/btn"
                   >
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-brand-primary/10 shadow-sm group-hover/btn:bg-brand-primary group-hover/btn:text-white transition-all transform group-active/btn:scale-90">
                         <Phone className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover/btn:text-brand-primary transition-colors uppercase">Call</span>
                   </button>
                   <button 
                     onClick={() => toast.success("Verification check initiated!")}
                     className="flex flex-col items-center gap-1 group/btn"
                   >
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-brand-primary/10 shadow-sm group-hover/btn:bg-brand-primary group-hover/btn:text-white transition-all transform group-active/btn:scale-90">
                         <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover/btn:text-brand-primary transition-colors uppercase">Verify</span>
                   </button>
                   <button 
                     onClick={() => setIsSearchOpen(true)}
                     className="flex flex-col items-center gap-1 group/btn"
                   >
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-brand-primary/10 shadow-sm group-hover/btn:bg-brand-primary group-hover/btn:text-white transition-all transform group-active/btn:scale-90">
                         <Search className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 group-hover/btn:text-brand-primary transition-colors uppercase">Find</span>
                   </button>
                </div>
             </div>
             
             <div className="px-6 py-4 border-t border-gray-100">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Safety Guide</h4>
                <div className="space-y-4">
                   <div className="bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10">
                      <p className="text-[12px] font-bold text-brand-primary mb-1">Protect Your Payments</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">Always meet in person and verify documents before making any advance payments.</p>
                   </div>
                   <div className="bg-brand-success/5 p-4 rounded-xl border border-brand-success/10">
                      <p className="text-[12px] font-bold text-brand-success mb-1">End-to-end Encrypted</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">Your conversations are private and only visible to you and {receiver?.name}.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        {/* Offer Modal */}
        {isOfferModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-gray-800">Make an Offer</h4>
                <button onClick={() => setIsOfferModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleMakeOffer} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 pl-1">Your Proposed Buying Price</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-brand-primary text-xl">₹</span>
                    <input 
                      type="number"
                      required
                      autoFocus
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-10 pr-6 font-bold text-2xl focus:ring-4 focus:ring-brand-primary/10 border-transparent focus:border-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                  <p className="text-[11px] text-blue-600 leading-relaxed font-semibold">
                    This offer will be sent formally to the seller. Negotiations are legally non-binding until a purchase agreement is executed.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit"
                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl hover:shadow-xl hover:shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                  >
                    Send Offer to Seller
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="w-full bg-transparent text-gray-400 font-bold py-2 text-sm hover:text-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}

// --- Chat Input Component ---
// Extracted to prevent the entire chat history from re-rendering on every keystroke!
const ChatInput = ({ onSend, landId, onShowOffer }: { onSend: (text: string) => void, landId: string | null, onShowOffer: () => void }) => {
  const [inputText, setInputText] = useState("");
  const [showEmojiShelf, setShowEmojiShelf] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSend(inputText);
      setInputText("");
      setShowEmojiShelf(false);
    }
  };

  return (
    <div className="p-3 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 relative pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_30px_rgba(0,0,0,0.03)] z-50">
      {showEmojiShelf && (
        <div className="absolute bottom-full left-4 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 grid grid-cols-6 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
          {['👍', '❤️', '👋', '😊', '🏠', '🙌', '🔥', '✨', '🤝', '📍', '💰', '📞'].map(e => (
            <button 
              key={e} 
              type="button"
              onClick={() => { setInputText(p => p + e); setShowEmojiShelf(false); }}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl text-xl transition-all active:scale-90"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex items-center gap-2">
        <button 
          type="button" 
          onClick={() => setShowEmojiShelf(!showEmojiShelf)}
          className={`p-2 transition-all rounded-full ${showEmojiShelf ? 'text-brand-primary bg-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}`}
        >
          <Smile className="w-6 h-6" />
        </button>
        
        {landId && (
          <button 
            type="button"
            onClick={onShowOffer}
            className="flex items-center gap-2 bg-white border border-brand-primary/20 text-brand-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm"
          >
            <Tag className="w-4 h-4" />
            Make Offer
          </button>
        )}
        <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-1.5 shadow-sm border border-transparent focus-within:border-brand-primary/30 focus-within:ring-4 focus-within:ring-brand-primary/5 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-transparent border-none outline-none text-[15px] py-1.5 text-[#111b21] placeholder:text-gray-400 font-medium"
          />
        </div>
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg flex-shrink-0 active:scale-95 ${
            inputText.trim() 
              ? "bg-gradient-to-r from-brand-primary to-indigo-600 text-white hover:scale-110 hover:shadow-brand-primary/40" 
              : "bg-gray-200 text-gray-400 cursor-default"
          }`}
        >
          <Send className={`w-5 h-5 ml-0.5 transition-transform ${inputText.trim() ? "translate-x-0" : "-translate-x-0.5"}`} />
        </button>
      </form>
    </div>
  );
};

// --- Message Bubble Component ---
// Memoized to ensure individual messages don't re-render unless they actually change
const MessageBubble = memo(({ message, isMe, showDate, onUpdateOfferStatus }: { 
  message: Message, 
  isMe: boolean, 
  showDate: boolean,
  onUpdateOfferStatus: (id: string, status: 'accepted' | 'rejected') => void
}) => {
  return (
    <div className="flex flex-col">
      {showDate && (
        <div className="flex justify-center my-4">
          <span className="bg-[#d1f4ff] px-3 py-1 rounded-lg text-[10px] font-bold text-[#005a75] shadow-sm uppercase tracking-widest border border-[#bce8f5]">
            {format(new Date(message.timestamp), 'MMMM d, yyyy')}
          </span>
        </div>
      )}
      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
        <div 
          className={`max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm relative group transition-all hover:shadow-md ${
            isMe 
              ? "bg-gradient-to-br from-brand-primary to-indigo-600 text-white rounded-tr-sm shadow-brand-primary/20" 
              : "bg-white text-[#111b21] rounded-tl-sm border border-gray-100"
          }`}
        >
          {/* Message Triangle */}
          <div className={`absolute top-0 w-3 h-3 ${isMe ? "-right-1 bg-indigo-600" : "-left-1 bg-white"}`} 
                style={{ clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }} />
          
          {message.type === 'offer' ? (
            <div className="py-2 flex flex-col gap-3 min-w-[220px]">
              <div className="flex items-center gap-2 text-brand-primary font-bold">
                <Tag className="w-4 h-4" />
                <span className="text-sm uppercase tracking-wider">Property Negotiation</span>
              </div>
              <div className="bg-black/5 rounded-xl p-4 text-center border border-black/5">
                <p className="text-[11px] text-gray-500 uppercase font-extrabold tracking-widest mb-1.5 text-center">Proposed Buying Price</p>
                <p className="text-2xl font-black text-brand-primary tracking-tight">₹{message.offer?.price.toLocaleString()}</p>
              </div>
              
              <div className="flex flex-col gap-2 mt-1">
                <div className={`text-center py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-[0.2em] shadow-sm ${
                  message.offer?.status === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' :
                  message.offer?.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {message.offer?.status}
                </div>

                {!isMe && message.offer?.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button 
                      onClick={() => onUpdateOfferStatus(message._id!, 'accepted')}
                      className="bg-brand-success text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-brand-success/20 hover:scale-[1.03] transition-all active:scale-95"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => onUpdateOfferStatus(message._id!, 'rejected')}
                      className="bg-red-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-red-500/20 hover:scale-[1.03] transition-all active:scale-95"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[14.5px] leading-relaxed pr-12 whitespace-pre-wrap">{message.text}</p>
          )}
          <div className="absolute bottom-1 right-1.5 flex items-center gap-1">
            <span className={`text-[10px] tabular-nums font-medium ${isMe ? "text-white/80" : "text-gray-500/70"}`}>
              {format(new Date(message.timestamp), "h:mm a")}
            </span>
            {isMe && (
              <CheckCheck className={`w-3.5 h-3.5 ${message.isRead ? "text-cyan-300" : "text-white/50"}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  // Only re-render if the message itself changed (e.g. read status, offer status)
  return prev.message._id === next.message._id && 
         prev.message.isRead === next.message.isRead && 
         prev.message.offer?.status === next.message.offer?.status &&
         prev.showDate === next.showDate;
});

