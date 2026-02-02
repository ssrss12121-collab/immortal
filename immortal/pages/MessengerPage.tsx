import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Smile, Image as ImageIcon, Phone, Video, MoreVertical, ChevronLeft, User, Circle, PhoneOff, History } from 'lucide-react';
import { UserProfile } from '../types';
import { getSocket } from '../utils/socket';
import PullToRefresh from '../components/PullToRefresh';

interface MessengerPageProps {
    user: UserProfile;
    onChatToggle?: (hidden: boolean) => void;
    onNavigate?: (tab: string) => void;
    activeChatUserId?: string | null;
    onChatHandled?: () => void;
}

import { chatApi } from '../utils/chat';
import { useCalling } from '../utils/useCalling';
import { getUserById } from '../utils/auth';

const MessengerPage: React.FC<MessengerPageProps> = ({ user, onChatToggle, onNavigate, activeChatUserId, onChatHandled }) => {
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const { callState, initiateCall, acceptCall, rejectCall, endCall } = useCalling();
    const [chats, setChats] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const socket = getSocket();
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial Load: Conversations
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const convos = await chatApi.getConversations();
                if (Array.isArray(convos)) {
                    setChats(convos.map(c => ({
                        ...c,
                        time: c.lastTime ? new Date(c.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'
                    })));
                }
            } catch (err) {
                console.error("Failed to load conversations", err);
            }
        };

        loadConversations();
    }, []);

    // Load History when chat selected
    useEffect(() => {
        if (!selectedChat?.id) return;

        const loadHistory = async () => {
            try {
                const history = await chatApi.getHistory({ targetUserId: selectedChat.id });
                if (Array.isArray(history)) {
                    setSelectedChat((prev: any) => {
                        if (!prev || prev.id !== selectedChat.id) return prev;
                        return {
                            ...prev,
                            messages: history.map(m => ({
                                ...m,
                                self: m.senderId === user.id,
                                time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }))
                        };
                    });

                    // Mark messages as read and update unread count
                    chatApi.markAsRead(selectedChat.id).then(() => {
                        setChats(prev => prev.map(c => 
                            c.id === selectedChat.id ? { ...c, unread: 0 } : c
                        ));
                    }).catch(err => console.error('Failed to mark as read:', err));
                }
            } catch (err) {
                console.error("History fetch failed", err);
            }
        };

        loadHistory();
    }, [selectedChat?.id]);

    // Handle External Chat Request (Add Friend by ID)
    useEffect(() => {
        if (!activeChatUserId) return;

        const initiateChatWithId = async () => {
            try {
                // Check if user is already in chats
                const existing = chats.find(c => c.id === activeChatUserId);
                if (existing) {
                    setSelectedChat({ ...existing, messages: [] });
                    onChatToggle?.(true);
                } else {
                    // Fetch user details
                    const targetUser = await getUserById(activeChatUserId);
                    if (targetUser) {
                        const newChat = {
                            id: targetUser.id || (targetUser as any)._id,
                            name: targetUser.ign || targetUser.name || 'Operative',
                            avatar: targetUser.avatarUrl || 'https://via.placeholder.com/150',
                            lastMsg: 'SECURE LINK ESTABLISHED',
                            time: 'NOW',
                            unread: 0,
                            isOnline: targetUser.isOnline,
                            messages: []
                        };

                        setChats(prev => [newChat, ...prev]);
                        setSelectedChat(newChat);
                        onChatToggle?.(true);
                    }
                }
                onChatHandled?.();
            } catch (err) {
                console.error("Failed to initiate external chat", err);
            }
        };

        initiateChatWithId();
    }, [activeChatUserId]);

    useEffect(() => {
        if (!socket) return;

        socket.on('user-status-change', (data: { userId: string, isOnline: boolean }) => {
            setChats(prev => prev.map(c => c.id === data.userId ? { ...c, isOnline: data.isOnline } : c));
        });

        socket.on('typing-indicator', (data: { userId: string, isTyping: boolean }) => {
            if (selectedChat?.id === data.userId) {
                setIsTyping(data.isTyping);
            }
        });

        socket.on('new-private-message', (data: any) => {
            const isSystem = data.senderName === 'System';
            const otherId = data.senderId === user.id ? data.receiverId : data.senderId;
            
            if (selectedChat?.id === otherId) {
                setSelectedChat((prev: any) => {
                    if (!prev || prev.id !== otherId) return prev;
                    if (data.senderId === user.id && !isSystem) return prev; // Avoid dupe for regular self messages

                    const exists = (prev.messages || []).some((m: any) => m.id === data.id || (m.tempId && m.tempId === data.tempId));
                    if (exists) return prev;

                    return {
                        ...prev,
                        messages: [...(prev.messages || []), { 
                            ...data, 
                            self: data.senderId === user.id, 
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        }]
                    };
                });
            }
            // Update last message in sidebar
            setChats(prev => {
                const existing = prev.find(c => c.id === otherId);
                if (existing) {
                    return prev.map(c => c.id === otherId ? { ...c, lastMsg: data.text, lastTime: new Date() } : c);
                } else {
                    // New conversation
                    chatApi.getConversations().then(res => {
                        if (Array.isArray(res)) {
                            setChats(res.map((c: any) => ({
                                ...c,
                                time: c.lastTime ? new Date(c.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'
                            })));
                        }
                    });
                    return prev;
                }
            });
        });

        socket.on('private-message-sent', (data: any) => {
            if (selectedChat?.id === data.receiverId) {
                setSelectedChat((prev: any) => {
                    if (!prev || prev.id !== data.receiverId) return prev;
                    
                    // Replace optimistic message if found
                    const hasMatch = (prev.messages || []).some((m: any) => m.tempId === data.tempId);
                    if (hasMatch) {
                        return {
                            ...prev,
                            messages: (prev.messages || []).map((m: any) => 
                                m.tempId === data.tempId ? { ...data, self: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : m
                            )
                        };
                    }
                    
                    // Fallback: If not found (rare), add as new but check for ID dupes
                    const idExists = (prev.messages || []).some((m: any) => m.id === data.id);
                    if (idExists) return prev;

                    return {
                        ...prev,
                        messages: [...(prev.messages || []), { ...data, self: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
                    };
                });
            }

            setChats(prev => {
                const existing = prev.find(c => c.id === data.receiverId);
                if (existing) {
                    return prev.map(c => c.id === data.receiverId ? { ...c, lastMsg: data.text, lastTime: new Date() } : c);
                } else {
                    chatApi.getConversations().then(res => {
                        if (Array.isArray(res)) {
                            setChats(res.map((c: any) => ({
                                ...c,
                                time: c.lastTime ? new Date(c.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'
                            })));
                        }
                    });
                    return prev;
                }
            });
        });

        socket.on('online-users-list', (users: any[]) => {
            setOnlineUsers(users.filter(u => u.id !== user.id));
        });

        socket.emit('get-online-users');

        return () => {
            socket.off('user-status-change');
            socket.off('typing-indicator');
            socket.off('new-private-message');
            socket.off('private-message-sent');
            socket.off('online-users-list');
        };
    }, [selectedChat?.id, socket, user.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);

    const emitTyping = (isTyping: boolean) => {
        if (!selectedChat) return;
        socket.emit('typing-status', { targetUserId: selectedChat.id, isTyping });
    };

    let typingTimeout: any;
    const handleInputChange = (val: string) => {
        setInputText(val);
        emitTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => emitTyping(false), 2000);
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedChat) return;

        const tempId = Date.now().toString();
        const newMsg = {
            id: tempId,
            tempId: tempId,
            text: inputText,
            senderId: user.id,
            senderName: user.ign || 'Operative',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            self: true,
            status: 'sending'
        };

        setSelectedChat((prev: any) => ({
            ...prev,
            messages: [...prev.messages, newMsg]
        }));

        socket.emit('send-private-message', {
            targetUserId: selectedChat.id,
            text: inputText,
            senderName: user.ign || 'Operative',
            tempId
        });

        setInputText('');
        emitTyping(false);
        setShowEmojiPicker(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChat) return;

        const tempId = Date.now().toString();
        // Optimistic UI with local preview
        const localUrl = URL.createObjectURL(file);

        const optMsg = {
            id: tempId,
            tempId,
            text: '',
            image: localUrl,
            senderId: user.id,
            senderName: user.ign || 'Operative',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            self: true,
            status: 'sending'
        };

        setSelectedChat((prev: any) => ({ ...prev, messages: [...prev.messages, optMsg] }));

        try {
            const uploadedFile = await chatApi.uploadFile(file);
            socket.emit('send-private-message', {
                targetUserId: selectedChat.id,
                text: '',
                image: uploadedFile.url,
                senderName: user.ign || 'Operative',
                tempId
            });
        } catch (err) {
            console.error("Upload failed", err);
            // Handle error (e.g., mark message as failed)
        }
    };

    const emojis = ['🔥', '🎮', '🎯', '🚀', '👑', '💀', '💯', '👍', '❤️', '😂'];

    const filteredChats = chats.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderMessage = (msg: any) => {
        if (msg.senderName === 'System') {
            const isMissed = msg.text.toLowerCase().includes('missed');
            return (
                <div className={`flex items-center gap-3 py-1 font-mono uppercase tracking-tighter ${isMissed ? 'text-red-500' : 'text-gaming-accent'}`}>
                    {isMissed ? <PhoneOff size={14} className="opacity-50" /> : <Phone size={14} className="animate-pulse" />}
                    <span className="text-[10px] font-black">{msg.text}</span>
                </div>
            );
        }

        const idRegex = /@\[ID:\s*(\w+)\]/g;
        const parts = msg.text.split(idRegex);

        return (
            <p className={`text-[11px] leading-relaxed ${msg.self ? 'font-medium italic' : ''}`}>
                {parts.map((part: string, i: number) => {
                    if (i % 2 === 1) {
                        return (
                            <button
                                key={i}
                                onClick={() => onNavigate?.('profile')}
                                className="text-white font-black underline decoration-gaming-accent/50 hover:text-gaming-accent transition-colors mx-1"
                            >
                                @{part}
                            </button>
                        );
                    }
                    return part;
                })}
            </p>
        );
    };

    return (
        <div className="flex flex-col h-full bg-black relative">
            {!selectedChat ? (
                <div className="flex flex-col h-full">
                    {/* Inbox Header */}
                    <div className="h-10 px-4 bg-[#0c0c12]/98 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h1 className="text-xs font-black uppercase italic tracking-tighter text-white">Messenger</h1>
                            <p className="text-[5px] text-gray-500 font-mono tracking-[0.2em] uppercase opacity-40">Neural Link Active</p>
                        </div>
                    </div>

                    {/* Online Bar */}
                    <div className="px-4 py-1 border-b border-white/5 bg-[#0c0c12]/20">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                            {onlineUsers.map(u => (
                                <div key={u.id} className="flex flex-col items-center gap-1 shrink-0 px-1 cursor-pointer active:scale-95 transition-all">
                                    <div className="relative">
                                        <div className="w-7 h-7 rounded-full border-2 border-gaming-accent p-0.5 shadow-[0_0_8px_rgba(0,223,130,0.2)]">
                                            <img src={u.avatar} className="w-full h-full rounded-full" alt="" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-gaming-accent rounded-full border-2 border-black"></div>
                                    </div>
                                    <span className="text-[6px] font-bold text-gray-600 uppercase truncate w-8 text-center">{u.name.split(' ')[0]}</span>
                                </div>
                            ))}
                            {onlineUsers.length === 0 && <span className="text-[7px] text-gray-800 font-mono uppercase tracking-widest pl-2">Syncing Signal...</span>}
                        </div>
                    </div>

                    {/* Search Operatives */}
                    <div className="px-4 py-1.5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" size={12} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="SEARCH..."
                                className="w-full bg-[#0c0c12] border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-[9px] text-white focus:border-gaming-accent/50 outline-none font-mono transition-all placeholder:text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto px-4 pb-32 space-y-3 scrollbar-hide">
                        {filteredChats.length === 0 ? (
                             <div className="py-20 text-center border border-white/5 bg-[#0c0c12]/20 rounded-2xl flex flex-col items-center gap-3">
                                <User size={32} className="text-gray-800" />
                                <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">No operatives in contact range.</p>
                             </div>
                        ) : filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => {
                                    setSelectedChat({ ...chat, messages: [] });
                                    onChatToggle?.(true);
                                }}
                                className="bg-[#0c0c12]/60 p-4 clip-corner-sm border border-white/5 flex items-center gap-4 hover:bg-[#12121e] transition-all cursor-pointer active:scale-95"
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 bg-black border border-white/10 rounded-xl overflow-hidden p-1 shadow-lg">
                                        <img src={chat.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${chat.id || 'User'}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    {chat.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border-2 border-[#0c0c12]">
                                            <Circle size={8} className="fill-gaming-accent text-gaming-accent animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1 gap-2">
                                        <h4 className="text-sm font-bold text-white uppercase truncate tracking-wide">{chat.name}</h4>
                                        <span className="text-[9px] text-gray-600 font-mono shrink-0">{chat.time}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 truncate">{chat.lastMsg}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <div className="w-5 h-5 bg-gaming-accent text-black text-[9px] font-black flex items-center justify-center rounded-lg shadow-lg shrink-0">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full bg-[#050508] z-50 animate-slide-up">
                    {/* Chat Header */}
                    <div className="px-4 py-2 bg-[#0c0c12]/98 border-b border-white/5 flex items-center justify-between pointer-events-auto z-10">
                        <div className="flex items-center gap-3">
                            <button onClick={() => {
                                setSelectedChat(null);
                                onChatToggle?.(false);
                            }} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="relative">
                                <img src={selectedChat.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${selectedChat.id || 'User'}`} className="w-8 h-8 rounded-lg border border-white/10" alt="" />
                                {selectedChat.isOnline && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-gaming-accent rounded-full border-2 border-black"></div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none">{selectedChat.name}</h3>
                                <p className="text-[7px] font-bold text-gaming-accent uppercase tracking-tighter mt-0.5 italic">
                                    {isTyping ? <span className="animate-pulse">TYPING...</span> : (selectedChat.isOnline ? 'ONLINE' : 'OFFLINE')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => initiateCall(selectedChat.id, selectedChat.name, 'audio')}
                                className="text-gray-400 hover:text-gaming-accent transition-colors"
                            >
                                <Phone size={18} />
                            </button>
                            <button
                                onClick={() => initiateCall(selectedChat.id, selectedChat.name, 'video')}
                                className="text-gray-400 hover:text-gaming-accent transition-colors"
                            >
                                <Video size={18} />
                            </button>
                            <button className="text-gray-400 hover:text-white transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 scrollbar-hide">
                        {(selectedChat.messages || []).map((msg: any) => {
                            const isSystem = msg.senderName === 'System';
                            return (
                                <div
                                    key={msg.id}
                                    className={`${isSystem ? 'flex flex-col items-center justify-center w-full my-6' : `flex ${msg.self ? 'justify-end' : 'justify-start'}`}`}
                                >
                                    {isSystem ? (
                                        <div className="bg-[#12121e]/95 border border-white/5 px-6 py-2 rounded-full shadow-2xl flex flex-col items-center gap-1">
                                            {renderMessage(msg)}
                                        </div>
                                    ) : (
                                        <div className={`max-w-[80%] ${msg.self ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                            {/* Sender info for received messages */}
                                            {!msg.self && (
                                                <div className="flex items-center gap-2 px-3">
                                                    <img
                                                        src={msg.senderAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${msg.senderId || 'User'}`}
                                                        className="w-5 h-5 rounded-full object-cover border border-white/10"
                                                        alt=""
                                                    />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{msg.senderName}</span>
                                                </div>
                                            )}
                                            
                                            {/* Message bubble */}
                                            <div className={`
                                                px-4 py-3 rounded-2xl relative
                                                ${msg.self 
                                                    ? 'bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white rounded-tr-sm shadow-[0_2px_8px_rgba(124,58,237,0.25)]' 
                                                    : 'bg-[#1a1a24] border border-white/10 text-gray-100 rounded-tl-sm shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                                                }
                                            `}>
                                                {/* Image if present */}
                                                {msg.image && (
                                                    <div className="mb-2 rounded-xl overflow-hidden border border-white/10 group/img relative">
                                                        <img src={msg.image} alt="Sent" className="max-w-full h-auto" />
                                                        <button
                                                            onClick={() => {
                                                                if (user.membership?.expiresAt && new Date(user.membership.expiresAt) > new Date()) {
                                                                    console.log('Converting to sticker...');
                                                                } else {
                                                                    alert('PREMIUM SUBSCRIPTION REQUIRED FOR STICKER MATURATION.');
                                                                }
                                                            }}
                                                            className="absolute bottom-2 right-2 bg-gaming-accent text-black text-[8px] font-black px-2 py-1 rounded-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                        >
                                                            SAV AS STICKER
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {/* Message text */}
                                                {msg.text && (
                                                    <div className={`text-[12px] leading-relaxed ${msg.self ? 'text-white' : 'text-gray-200'}`}>
                                                        {renderMessage(msg)}
                                                    </div>
                                                )}
                                                
                                                {/* Timestamp */}
                                                <div className={`text-[9px] mt-1 flex items-center gap-1 ${msg.self ? 'text-white/60 justify-end' : 'text-gray-500 justify-start'}`}>
                                                    <span className="font-medium">{msg.time}</span>
                                                    {msg.self && (
                                                        <span className="text-[10px]">✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-black border-t border-white/5 space-y-4">



                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <ImageIcon size={22} />
                            </button>

                            <div className="flex-1 relative">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-4 p-3 bg-[#12121e] border border-white/10 rounded-2xl flex flex-wrap gap-2 shadow-2xl animate-slide-up z-[60] max-w-[160px]">
                                        {emojis.map(e => (
                                            <button
                                                key={e}
                                                onClick={() => setInputText(prev => prev + e)}
                                                className="text-xl hover:scale-125 transition-transform"
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={e => handleInputChange(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="TRANSMIT MESSAGE..."
                                    className="w-full bg-[#0c0c12] border border-white/10 rounded-full py-4 pl-12 pr-4 text-[10px] text-white focus:border-gaming-accent outline-none font-mono uppercase tracking-[2px]"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowEmojiPicker(!showEmojiPicker);
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gaming-accent/60 hover:text-gaming-accent z-[70]"
                                >
                                    <Smile size={18} />
                                </button>
                            </div>

                            <button
                                onClick={handleSendMessage}
                                className="w-12 h-12 bg-gaming-accent rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,223,130,0.3)] hover:scale-105 active:scale-95 transition-all"
                            >
                                <Send size={20} className="-rotate-12" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessengerPage;
