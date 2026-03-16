import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, AtSign, Paperclip, File, X, Image as ImageIcon, Smile, CornerUpLeft, Copy } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Skeleton, TypingIndicator, ProgressLoader } from './Loaders';

const socket = io('http://localhost:5000', {
    withCredentials: true,
    autoConnect: false
});

const MessageBubble = ({ msg, isMe, isSystem, isPrivate, isCommand, user, onReply, onReact }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);

    const emojis = ['👍', '❤️', '😂', '🎉', '😢'];

    // Group reactions for rendering
    const groupedReactions = (msg.reactions || []).reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, meReacted: false };
        acc[r.emoji].count += 1;
        if (r.user === user._id || (r.user?._id === user._id)) acc[r.emoji].meReacted = true;
        return acc;
    }, {});

    const handleCopy = () => {
        navigator.clipboard.writeText(msg.content);
    };

    return (
        <div
            style={{
                alignSelf: (isSystem || isCommand) ? 'center' : (isMe ? 'flex-end' : 'flex-start'),
                maxWidth: (isSystem || isCommand) ? '100%' : '80%',
                display: 'flex', flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : ((isSystem || isCommand) ? 'center' : 'flex-start'),
                position: 'relative'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setShowEmojis(false); }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                marginBottom: '0.25rem', color: '#64748b', fontSize: '0.7rem'
            }}>
                {!isMe && !isSystem && !isCommand && <span style={{ fontWeight: 600 }}>{msg.sender?.name}</span>}
                {isPrivate && <span style={{ color: '#7c3aed', fontWeight: 700 }}>🔒 whisper</span>}
                {isCommand && <span style={{ color: '#16a34a', fontWeight: 700 }}>⚡ task bot</span>}
                {msg.createdAt && <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                    padding: '0.75rem 1rem', borderRadius: '1rem',
                    borderTopRightRadius: isMe ? '0.25rem' : '1rem',
                    borderTopLeftRadius: isMe ? '1rem' : '0.25rem',
                    backgroundColor: isSystem ? 'transparent' : (isCommand ? '#16a34a' : (isMe ? '#2563eb' : (isPrivate ? '#f5f3ff' : 'white'))),
                    color: isSystem ? (msg.isError ? '#ef4444' : '#64748b') : (isMe ? 'white' : (isCommand ? '#ffffff' : '#1e293b')),
                    boxShadow: (isSystem) ? 'none' : (isCommand ? '0 2px 8px rgba(22, 163, 74, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)'),
                    fontSize: isSystem ? '0.75rem' : '0.9rem', lineHeight: 1.5,
                    border: isSystem ? 'none' : (isCommand ? '1.5px solid #15803d' : (isPrivate ? '1.5px solid #ddd6fe' : (isMe ? 'none' : '1px solid #e2e8f0'))),
                    fontStyle: isSystem ? 'italic' : 'normal',
                    textAlign: (isSystem || isCommand) ? 'center' : 'left'
                }}>
                    {msg.replyTo && (
                        <div style={{
                            fontSize: '0.75rem',
                            padding: '0.4rem 0.6rem',
                            background: isMe ? 'rgba(0,0,0,0.1)' : '#f8fafc',
                            borderRadius: '0.5rem',
                            marginBottom: '0.5rem',
                            borderLeft: `3px solid ${isMe ? '#fff' : '#2563eb'}`,
                            opacity: 0.9
                        }}>
                            <div style={{ fontWeight: 700, fontSize: '0.65rem', marginBottom: '0.1rem' }}>
                                {msg.replyTo.sender?.name || 'User'}
                            </div>
                            <div style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '200px'
                            }}>
                                {msg.replyTo.content}
                            </div>
                        </div>
                    )}
                    {!isMe && isPrivate && (
                        <div style={{ fontSize: '0.65rem', marginBottom: '0.25rem', fontWeight: 700, color: '#6d28d9' }}>
                            Whisper to you:
                        </div>
                    )}
                    {isMe && isPrivate && msg.recipient && (
                        <div style={{ fontSize: '0.65rem', marginBottom: '0.25rem', fontWeight: 700, color: '#fff' }}>
                            Whispered to {msg.recipient.name}:
                        </div>
                    )}
                    {msg.content && msg.content.split(/(@\w+)/g).map((part, i) => {
                        if (part.startsWith('@')) {
                            const name = part.substring(1);
                            const isMentionedMe = name.toLowerCase() === user.name.toLowerCase();
                            return (
                                <span key={i} style={{
                                    color: isMe ? '#fff' : '#2563eb',
                                    fontWeight: 800,
                                    backgroundColor: isMentionedMe && !isMe ? '#dbeafe' : 'transparent',
                                    padding: isMentionedMe && !isMe ? '0 0.2rem' : 0,
                                    borderRadius: '0.2rem'
                                }}>
                                    {part}
                                </span>
                            );
                        }
                        return part;
                    })}

                    {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ marginTop: msg.content ? '0.5rem' : 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {msg.attachments.map((att, i) => {
                                const isImage = att.fileType?.startsWith('image/');
                                const fullUrl = `http://localhost:5000${att.url}`;

                                if (isImage) {
                                    return (
                                        <img
                                            key={i}
                                            src={fullUrl}
                                            alt={att.name}
                                            style={{
                                                maxWidth: '100%',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                maxHeight: '200px',
                                                objectFit: 'cover'
                                            }}
                                            onClick={() => window.open(fullUrl, '_blank')}
                                        />
                                    );
                                }

                                return (
                                    <a
                                        key={i}
                                        href={fullUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem',
                                            background: isMe ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                                            borderRadius: '0.4rem',
                                            textDecoration: 'none',
                                            color: isMe ? 'white' : '#1e293b',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        <File size={16} />
                                        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {att.name}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                    {/* Reactions Display */}
                    {Object.keys(groupedReactions).length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            {Object.entries(groupedReactions).map(([emoji, data]) => (
                                <button
                                    key={emoji}
                                    onClick={() => onReact(msg, emoji)}
                                    style={{
                                        padding: '0.15rem 0.5rem',
                                        background: data.meReacted ? (isMe ? 'rgba(255,255,255,0.3)' : '#dbeafe') : (isMe ? 'rgba(255,255,255,0.1)' : '#f1f5f9'),
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        border: data.meReacted ? (isMe ? '1px solid rgba(255,255,255,0.5)' : '1px solid #bfdbfe') : '1px solid transparent',
                                        cursor: 'pointer',
                                        color: isMe ? 'white' : '#1e293b'
                                    }}
                                >
                                    {emoji} <span style={{ fontWeight: 600 }}>{data.count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isHovered && !isSystem && !isCommand && (
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    [isMe ? 'right' : 'left']: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    padding: '0.2rem',
                    gap: '0.2rem',
                    zIndex: 50
                }}>
                    <div style={{ position: 'relative' }}>
                        <button title="React" onClick={() => setShowEmojis(!showEmojis)} style={{ padding: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '0.25rem', color: '#64748b' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Smile size={14} />
                        </button>
                        {showEmojis && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: '0.25rem',
                                    background: 'white',
                                    padding: '0.5rem',
                                    borderRadius: '2rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    border: '1px solid #e2e8f0',
                                    paddingBottom: '0.5rem' // Replaced marginBottom to create hit-area overlap
                                }}
                            >
                                {emojis.map(e => (
                                    <button
                                        key={e}
                                        onClick={(ev) => {
                                            ev.stopPropagation();
                                            onReact(msg, e);
                                            setShowEmojis(false);
                                            setIsHovered(false);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '1.25rem',
                                            cursor: 'pointer',
                                            padding: '0.2rem',
                                            transition: 'transform 0.1s'
                                        }}
                                        onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.2)'}
                                        onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button title="Reply" onClick={() => { onReply && onReply(msg); setIsHovered(false); }} style={{ padding: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '0.25rem', color: '#64748b' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <CornerUpLeft size={14} />
                    </button>
                    <button title="Copy" onClick={handleCopy} style={{ padding: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '0.25rem', color: '#64748b' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <Copy size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

const ChatWindow = ({ roomId, projectId = null, isGlobal = false, title = "Chat", onMembersUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [members, setMembers] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionSource, setSuggestionSource] = useState(null);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const lastTypeEmit = useRef(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/company/chat-members');
                const others = (res.data || [])
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(m => ({ ...m, status: m._id === user._id ? 'online' : 'offline' }));

                const mergedMembers = (() => {
                    const statusMap = new Map(members.map(p => [p._id, p.status]));
                    return others.map(m => ({ ...m, status: statusMap.get(m._id) || m.status }));
                })();

                setMembers(mergedMembers);
                if (onMembersUpdate) onMembersUpdate(mergedMembers);
            } catch {
            }
        };
        fetchMembers();
    }, [user._id, onMembersUpdate]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const endpoint = isGlobal ? '/chat/global' : `/chat/project/${projectId}`;
                const res = await api.get(endpoint);
                setMessages(res.data || []);
            } catch (err) {
                console.error('Error fetching chat history:', err);
            }
        };

        fetchHistory();

        socket.connect();
        socket.emit('register_user', {
            userId: user._id,
            name: user.name,
            companyId: user.companyId
        });
        socket.emit('join_room', roomId);

        socket.on('room_members', (updatedMembers) => {
            setMembers(prev => {
                const onlineMap = new Map(updatedMembers.map(m => [m._id, m.status]));
                const merged = prev.map(m => ({
                    ...m,
                    status: onlineMap.get(m._id) || 'offline'
                }));

                const existingIds = new Set(prev.map(p => p._id));
                const newMembers = updatedMembers.filter(m => !existingIds.has(m._id));

                const result = [...merged, ...newMembers];
                if (onMembersUpdate) onMembersUpdate(result);
                return result;
            });
        });

        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('error_message', (error) => {
            setMessages((prev) => [...prev, {
                _id: Date.now() + Math.random(),
                content: error.content,
                sender: { name: 'System' },
                isError: true,
                createdAt: new Date()
            }]);
        });

        socket.on('mention_received', (data) => {
            console.log(`Mention from ${data.senderName}: ${data.message.content}`);
        });

        socket.on('user_typing', (data) => {
            const { userId, userName } = data;
            setTypingUsers(prev => ({
                ...prev,
                [userId]: { userName, lastTypedAt: Date.now() }
            }));
        });

        socket.on('reaction_updated', (data) => {
            const { messageId, reactions } = data;
            setMessages((prev) => prev.map((msg) =>
                msg._id === messageId ? { ...msg, reactions } : msg
            ));
        });

        return () => {
            socket.off('receive_message');
            socket.off('error_message');
            socket.off('mention_received');
            socket.off('user_typing');
            socket.off('reaction_updated');
            socket.off('room_members');
            socket.disconnect();
        };
    }, [roomId, projectId, isGlobal, user._id]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setTypingUsers(prev => {
                const refreshed = {};
                Object.entries(prev).forEach(([id, info]) => {
                    if (now - info.lastTypedAt < 3000) {
                        refreshed[id] = info;
                    }
                });
                return Object.keys(refreshed).length === Object.keys(prev).length ? prev : refreshed;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);

    const handleInputChange = async (e) => {
        const val = e.target.value;
        setNewMessage(val);

        const now = Date.now();
        if (now - lastTypeEmit.current > 1000) {
            socket.emit('typing', {
                roomId,
                userId: user._id,
                userName: user.name
            });
            lastTypeEmit.current = now;
        }

        const lastAt = val.lastIndexOf('@');
        const lastSlash = val.lastIndexOf('/');
        const triggerIdx = Math.max(lastAt, lastSlash);

        if (triggerIdx === -1 || (triggerIdx > 0 && val[triggerIdx - 1] !== ' ' && triggerIdx !== 0)) {
            setSuggestions([]);
            setSuggestionSource(null);
            return;
        }

        const trigger = val[triggerIdx];
        setSuggestionSource(trigger);

        const query = val.substring(triggerIdx + 1).toLowerCase().trim();

        if (query.length === 0) {
            setSuggestions(members.slice(0, 6));
            setSelectedIdx(0);
            return;
        }

        try {
            const res = await api.get(`/chat/mentions/suggestions?query=${query}`);
            setSuggestions(res.data || []);
            setSelectedIdx(0);
        } catch (err) {
            const roleReadable = (role) => (role || '').replace(/_/g, ' ').toLowerCase();
            const filtered = members
                .filter(m =>
                    m.name.toLowerCase().includes(query) ||
                    roleReadable(m.role || '').includes(query)
                )
                .slice(0, 6);
            setSuggestions(filtered);
            setSelectedIdx(0);
        }
    };

    const applySuggestion = (member) => {
        const triggerIdx = newMessage.lastIndexOf(suggestionSource);
        const before = triggerIdx >= 0 ? newMessage.substring(0, triggerIdx) : '';
        setNewMessage(`${before}${suggestionSource}${member.name} `);
        setSuggestions([]);
        setSuggestionSource(null);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Tab' || e.key === 'Enter') {
            if (suggestions.length > 0) {
                e.preventDefault();
                applySuggestion(suggestions[selectedIdx]);
            }
        } else if (e.key === 'Escape') {
            setSuggestions([]);
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setUploadError(null);
        setUploadProgress(10);

        const progressInterval = setInterval(() => {
            setUploadProgress(prev => (prev < 90 ? prev + 5 : prev));
        }, 300);

        try {
            const uploaded = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('attachment', file);

                const res = await api.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                uploaded.push(res.data);
            }
            setUploadProgress(100);
            setTimeout(() => {
                setAttachments(prev => [...prev, ...uploaded]);
                setUploading(false);
                setUploadProgress(0);
                clearInterval(progressInterval);
            }, 400);
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Failed to upload file');
            setUploading(false);
            setUploadProgress(0);
            clearInterval(progressInterval);
        } finally {
            e.target.value = '';
        }
    };

    const removeAttachment = (idx) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && attachments.length === 0) || suggestions.length > 0) return;

        const messageData = {
            roomId,
            sender: user._id,
            content: newMessage.trim() || (attachments.length > 0 ? "" : ""),
            companyId: user.companyId,
            projectId,
            isGlobal,
            attachments: attachments,
            replyTo: replyingTo?._id || null
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
        setReplyingTo(null);
        setSuggestions([]);
        setAttachments([]);
    };

    const handleReact = (msg, emoji) => {
        socket.emit('add_reaction', {
            messageId: msg._id,
            emoji: emoji,
            userId: user._id,
            roomId: roomId
        });

        // Optimistic UI updates
        setMessages(prev => prev.map(m => {
            if (m._id === msg._id) {
                const currentReactions = m.reactions || [];
                const existIdx = currentReactions.findIndex(r => (r.user === user._id || r.user?._id === user._id) && r.emoji === emoji);
                let nextReactions = [...currentReactions];
                if (existIdx >= 0) {
                    nextReactions.splice(existIdx, 1);
                } else {
                    nextReactions.push({ emoji, user: user._id });
                }
                return { ...m, reactions: nextReactions };
            }
            return m;
        }));
    };

    const handleReply = (msg) => {
        setReplyingTo(msg);
        inputRef.current?.focus();
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'white',
            borderRadius: isGlobal ? '1rem 0 0 1rem' : '1rem',
            border: isGlobal ? 'none' : '1px solid #e2e8f0',
            borderRight: isGlobal ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: isGlobal ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '0.5rem',
                        backgroundColor: '#eff6ff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <MessageSquare size={20} color="#2563eb" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Real-time communication</p>
                    </div>
                </div>
                <span style={{
                    fontSize: '0.7rem', color: '#94a3b8', background: '#f8fafc',
                    padding: '0.25rem 0.5rem', borderRadius: '0.25rem'
                }}>
                    Tip: <b>/name</b> whisper · <b>@name</b> mention · <b>/assign</b> task
                </span>
            </div>

            <div style={{
                flex: 1, minHeight: 0, padding: '1.5rem', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                backgroundColor: '#f8fafc'
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => {
                            const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                            const isSystem = msg.sender?.name === 'System';
                            const isPrivate = msg.messageType === 'PRIVATE';
                            const isCommand = msg.messageType === 'COMMAND';

                            return (
                                <MessageBubble
                                    key={msg._id || index}
                                    msg={msg}
                                    isMe={isMe}
                                    isSystem={isSystem}
                                    isPrivate={isPrivate}
                                    isCommand={isCommand}
                                    user={user}
                                    onReply={handleReply}
                                    onReact={handleReact}
                                />
                            );
                        })}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fff', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, paddingBottom: '0.2rem', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                    <TypingIndicator users={Object.values(typingUsers).map(u => u.userName)} />
                </div>
                {suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute', bottom: '100%', left: '1.5rem', right: '1.5rem',
                        backgroundColor: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem', overflow: 'hidden',
                        boxShadow: '0 -4px 20px rgba(0,0,0,0.10)',
                        zIndex: 100
                    }}>
                        <div style={{
                            padding: '0.5rem 0.75rem', fontSize: '0.65rem', fontWeight: 700,
                            color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex', alignItems: 'center', gap: '0.35rem'
                        }}>
                            {suggestionSource === '@' ? <AtSign size={11} /> : <span style={{ fontSize: 14 }}>/</span>}
                            {suggestionSource === '@' ? 'Members' : 'Whisper'} — Tab or Enter to select
                        </div>
                        {suggestions.map((member, idx) => (
                            <div
                                key={member._id}
                                onMouseDown={() => applySuggestion(member)}
                                style={{
                                    padding: '0.6rem 1rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    backgroundColor: idx === selectedIdx ? '#eff6ff' : 'white',
                                    transition: 'background 0.1s'
                                }}
                                onMouseEnter={() => setSelectedIdx(idx)}
                            >
                                <div style={{
                                    width: 30, height: 30, borderRadius: '50%',
                                    backgroundColor: '#dbeafe', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, color: '#2563eb',
                                    flexShrink: 0
                                }}>
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                                        {member.name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                        {member.role || member.email}
                                    </div>
                                </div>
                                <div style={{
                                    marginLeft: 'auto', fontSize: '0.65rem', color: '#94a3b8',
                                    background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '0.25rem'
                                }}>
                                    {suggestionSource === '@' ? 'mention' : 'whisper'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {attachments.length > 0 && (
                    <div style={{
                        padding: '0.75rem 1.5rem', backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', flexWrap: 'wrap'
                    }}>
                        {attachments.map((att, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.4rem',
                                border: '1px solid #e2e8f0', fontSize: '0.75rem'
                            }}>
                                {att.fileType?.startsWith('image/') ? <ImageIcon size={14} color="#2563eb" /> : <File size={14} color="#64748b" />}
                                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</span>
                                <button onClick={() => removeAttachment(i)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {uploading && (
                    <div style={{ padding: '0.5rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                        <ProgressLoader progress={uploadProgress} label="Uploading attachments..." />
                    </div>
                )}

                {uploadError && (
                    <div style={{ padding: '0.5rem 1.5rem', color: '#ef4444', fontSize: '0.7rem', backgroundColor: '#fef2f2' }}>
                        {uploadError}
                    </div>
                )}

                {replyingTo && (
                    <div style={{
                        padding: '0.5rem 1.5rem',
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        color: '#64748b'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CornerUpLeft size={14} color="#64748b" />
                            <span>Replying to <strong>{replyingTo.sender?.name || 'User'}</strong>: {replyingTo.content.substring(0, 40)}{replyingTo.content.length > 40 ? '...' : ''}</span>
                        </div>
                        <button onClick={cancelReply} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                        type="file"
                        id="chat-file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="chat-file"
                        style={{
                            width: '40px', height: '40px', borderRadius: '0.625rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: uploading ? 'not-allowed' : 'pointer', color: '#64748b',
                            backgroundColor: '#f1f5f9', flexShrink: 0
                        }}
                    >
                        {uploading ? <div style={{ width: 16, height: 16, border: '2px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Paperclip size={20} />}
                    </label>

                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={uploading ? "Uploading file..." : "Type a message... @name to mention, /name to whisper"}
                        disabled={uploading}
                        style={{
                            flex: 1, padding: '0.65rem 1rem', borderRadius: '0.625rem',
                            border: `1px solid ${suggestionSource ? '#c4b5fd' : '#e2e8f0'}`,
                            fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                            backgroundColor: suggestionSource ? '#faf8ff' : 'white'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => {
                            e.target.style.borderColor = suggestionSource ? '#c4b5fd' : '#e2e8f0';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && attachments.length === 0) || suggestions.length > 0 || uploading}
                        style={{
                            width: '40px', height: '40px', borderRadius: '0.625rem',
                            backgroundColor: ((newMessage.trim() || attachments.length > 0) && suggestions.length === 0 && !uploading) ? '#2563eb' : '#f1f5f9',
                            color: ((newMessage.trim() || attachments.length > 0) && suggestions.length === 0 && !uploading) ? 'white' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none',
                            cursor: ((newMessage.trim() || attachments.length > 0) && suggestions.length === 0 && !uploading) ? 'pointer' : 'default',
                            transition: 'all 0.2s', flexShrink: 0
                        }}
                    >
                        <Send size={18} />
                    </button>
                    <style>{`
                        @keyframes spin { to { transform: rotate(360deg); } }
                        @keyframes typing-pulse {
                            0%, 100% { opacity: 0.4; transform: scale(0.8); }
                            50% { opacity: 1; transform: scale(1.1); }
                        }
                    `}</style>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
