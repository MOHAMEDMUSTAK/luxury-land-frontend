"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, MoreVertical, Phone, ShieldCheck, CheckCheck, Trash2, Tag } from "lucide-react";
import { format } from "date-fns";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import { useUIStore } from "@/store/useUIStore";

interface Message {
  _id?: string;
  sender: string;
  text: string;
  type?: 'text' | 'offer';
  offer?: {
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
    landId: string;
  };
  isRead?: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  landId?: string;
  initialPrice?: number;
}

export default function ChatBox({ isOpen, onClose, receiverId, receiverName, landId, initialPrice }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  
  // Offer System State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState(initialPrice?.toString() || "");
  const { setIsChatActive } = useUIStore();

  useEffect(() => {
    if (isOpen) {
      setIsChatActive(true);
      document.body.style.overflow = "hidden"; // Lock scroll
    } else {
      setIsChatActive(false);
      document.body.style.overflow = "auto"; // Unlock scroll
    }
    // Cleanup on unmount
    return () => {
      setIsChatActive(false);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, setIsChatActive]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markMessagesRead = async (id: string) => {
    if (!id || !user || !document.hasFocus()) return;
    try {
      await api.patch(`/chat/mark-as-read/${id}`);
      socketRef.current?.emit('mark_read', { 
        chatId: id, 
        senderId: receiverId, // Who I'm reading messages FROM
        recipientId: user.id // ME
      });
    } catch (err) {
      console.error("MARK_READ_ERROR:", err);
    }
  };

  const handleClearChat = async () => {
    if (!chatId) return;
    if (!window.confirm("Clear message history for this chat? This won't affect the other person.")) return;
    try {
      await api.delete(`/chat/clear/${chatId}`);
      setMessages([]);
    } catch (err) {
      console.error("CLEAR_CHAT_ERROR:", err);
    }
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !offerPrice || !landId || !user) return;

    try {
      const res = await api.post('/chat/offer', {
        chatId,
        price: Number(offerPrice),
        landId
      });

      const newMsg = { ...res.data, timestamp: new Date(res.data.timestamp) };
      setMessages(prev => [...prev, newMsg]);

      // Socket Emit
      socketRef.current?.emit('sendMessage', {
        chatId,
        senderId: user.id,
        recipientId: receiverId,
        text: `Offer: ₹${offerPrice}`,
        type: 'offer',
        offer: newMsg.offer,
        timestamp: new Date()
      });

      setIsOfferModalOpen(false);
    } catch (err) {
      console.error("MAKE_OFFER_ERROR:", err);
    }
  };

  const updateOfferStatus = async (messageId: string, status: 'accepted' | 'rejected') => {
    if (!chatId) return;
    try {
      const res = await api.patch('/chat/offer-status', {
        chatId,
        messageId,
        status
      });

      // Update local state
      setMessages(prev => prev.map(m => 
        m._id === messageId ? { ...m, offer: { ...m.offer!, status } } : m
      ));

      // Socket Emit for status update
      socketRef.current?.emit('update_offer_status', {
        chatId,
        messageId,
        status,
        senderId: user?.id,
        recipientId: receiverId
      });
    } catch (err) {
      console.error("UPDATE_OFFER_ERROR:", err);
    }
  };

  useEffect(() => {
    if (!isOpen || !user || !receiverId) return;

    // 1. Get or Create Chat session
    api.get(`/chat/${receiverId}`).then(res => {
      const id = res.data._id;
      setChatId(id);
      setMessages(res.data.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      
      // Mark as read on open if we have messages from them
      markMessagesRead(id);
    }).catch(err => console.error("CHAT_BOX_INIT_ERROR:", err));

    // 2. Socket Connection
    const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || 
                      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
                      "http://localhost:5000";
                      
    const socket = io(socketURL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_user_room', user.id);
    });

    socket.on('receiveMessage', (data: any) => {
      // Only add if it's from the current chat
      if (data.chatId === chatId || data.senderId === receiverId) {
        setMessages((prev: Message[]) => [...prev, {
          sender: data.senderId,
          text: data.text,
          isRead: false,
          timestamp: new Date(data.timestamp || Date.now()),
        }]);

        // If chat is open and window is focused, mark the new message as read immediately
        if (isOpen && chatId && document.hasFocus()) {
          markMessagesRead(chatId);
        }
      }
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

    // Add focus listener to mark messages read when user returns to window
    const handleFocus = () => {
      if (isOpen && chatId) {
        markMessagesRead(chatId);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      socket.disconnect();
    };
  }, [isOpen, receiverId, user, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current || !chatId || !user) return;

    const messageText = inputText.trim();
    setInputText("");

    try {
      // 1. Save to DB
      await api.post(`/chat/message`, { chatId, text: messageText });

      // 2. Local State
      const newMsg = { sender: user.id, text: messageText, isRead: false, timestamp: new Date() };
      setMessages((p: Message[]) => [...p, newMsg]);

      // 3. Socket Emit
      socketRef.current.emit('sendMessage', {
        chatId,
        senderId: user.id,
        recipientId: receiverId,
        text: messageText,
        timestamp: new Date()
      });
    } catch (err) {
      console.error("CHAT_BOX_SEND_ERROR:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[9999] w-full h-full sm:h-[600px] sm:max-h-[85vh] sm:max-w-[400px] bg-[#f0f2f5] border-none sm:border border-gray-200 rounded-none sm:rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className="bg-[#f0f2f5] p-4 flex items-center justify-between border-b border-gray-200 shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold shadow-sm border border-white overflow-hidden ring-2 ring-white/50">
            {receiverName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-[#111b21] leading-tight">{receiverName}</h3>
            <span className="text-[10px] font-bold text-brand-success flex items-center gap-1 uppercase tracking-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span> {receiverName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleClearChat}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all active:scale-90" 
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-90" title="Close Chat">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative bg-[#e5ddd5]">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ 
                 backgroundImage: 'url("https://w7.pngwing.com/pngs/315/127/png-transparent-whatsapp-iphone-background-whatsapp-doodle-pattern-feature-whatsapp-logo-thumbnail.png")',
                 backgroundSize: '300px'
               }} 
          />
          
          <div className="flex justify-center mb-6 relative z-10">
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-brand-success" />
                End-to-End Encrypted
             </span>
          </div>

          {messages.map((msg, i) => {
            const isMe = user && msg.sender.toString() === user.id.toString();
            return (
                <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} relative z-10 mb-1`}>
                  <div className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm text-[14px] relative group transition-all hover:shadow-md ${isMe ? "bg-[#dcf8c6] text-[#111b21] rounded-tr-none" : "bg-white text-[#111b21] rounded-tl-none border border-gray-100"}`}>
                    
                    {msg.type === 'offer' ? (
                      <div className="py-2 flex flex-col gap-2 min-w-[180px]">
                        <div className="flex items-center gap-2 text-brand-primary font-bold">
                          <Tag className="w-4 h-4" />
                          <span>Property Offer</span>
                        </div>
                        <div className="bg-black/5 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Proposed Price</p>
                          <p className="text-xl font-black text-brand-primary">₹{msg.offer?.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 mt-1">
                          <div className={`text-center py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                            msg.offer?.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            msg.offer?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            Status: {msg.offer?.status}
                          </div>

                          {!isMe && msg.offer?.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <button 
                                onClick={() => updateOfferStatus(msg._id!, 'accepted')}
                                className="bg-brand-success text-white py-1.5 rounded-lg font-bold text-xs hover:scale-105 transition-transform"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => updateOfferStatus(msg._id!, 'rejected')}
                                className="bg-red-500 text-white py-1.5 rounded-lg font-bold text-xs hover:scale-105 transition-transform"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="pr-12 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}

                    {/* Triangle */}
                    <div className={`absolute top-0 w-2.5 h-2.5 ${isMe ? "-right-2 bg-[#dcf8c6]" : "-left-2 bg-white"}`} 
                         style={{ clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }} />
                    
                    <div className="absolute bottom-1 right-1.5 flex items-center gap-1">
                       <span className="text-[9px] text-gray-500/70 font-bold">{format(msg.timestamp, "h:mm a")}</span>
                       {isMe && (
                         <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? "text-blue-500" : "text-gray-400"}`} />
                       )}
                    </div>
                  </div>
                </div>
            );
          })}
          <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-[#f0f2f5] border-t border-gray-200 flex flex-col gap-2 relative z-20 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        
        {landId && (
          <button 
            onClick={() => setIsOfferModalOpen(true)}
            className="w-full bg-white border border-brand-primary/20 text-brand-primary py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <Tag className="w-3.5 h-3.5" />
            Make a Price Offer
          </button>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-xl flex items-center px-4 py-2 border border-transparent focus-within:border-brand-primary/30 focus-within:ring-4 focus-within:ring-brand-primary/5 transition-all shadow-sm">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message"
              className="flex-1 bg-transparent text-[14px] outline-none font-medium text-[#111b21] placeholder:text-gray-400"
            />
          </div>
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg flex-shrink-0 active:scale-95 ${
              inputText.trim() 
                ? "bg-brand-primary text-white hover:scale-110" 
                : "bg-gray-300 text-gray-500 cursor-default"
            }`}
          >
            <Send className={`w-5 h-5 ml-0.5 transition-transform ${inputText.trim() ? "translate-x-0" : "-translate-x-0.5"}`} />
          </button>
        </form>
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-[300px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-gray-800">Make an Offer</h4>
              <button onClick={() => setIsOfferModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleMakeOffer} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Your Proposed Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-primary">₹</span>
                  <input 
                    type="number"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-gray-50 border border-ui-border rounded-xl py-3 pl-8 pr-4 font-bold text-lg focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                  This offer will be sent to the seller for approval. Negotiations are legally non-binding until a formal agreement is signed.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-brand-primary/20 hover:scale-[1.02] transition-all active:scale-95"
              >
                Send Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
