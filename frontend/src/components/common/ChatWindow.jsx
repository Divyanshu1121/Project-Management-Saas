import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, AtSign } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const socket = io('http://localhost:5000', {
    withCredentials: true,
    autoConnect: false
});

const ChatWindow = ({ roomId, projectId = null, isGlobal = false, title = "Chat" }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [members, setMembers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const { user } = useAuth();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch workspace members for autocomplete
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get('/company/chat-members');
                const others = (res.data || [])
                    .filter(m => m._id !== user._id)
                    .sort((a, b) => a.name.localeCompare(b.name));
                setMembers(others);
            } catch {
                // silently fail — autocomplete is a progressive enhancement
            }
        };
        fetchMembers();
    }, [user._id]);

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
        socket.emit('register_user', user._id);
        socket.emit('join_room', roomId);

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

        return () => {
            socket.off('receive_message');
            socket.off('error_message');
            socket.disconnect();
        };
    }, [roomId, projectId, isGlobal, user._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle input change + autocomplete logic
    const handleInputChange = (e) => {
        const val = e.target.value;
        setNewMessage(val);

        // Check if current "word/phrase" being typed starts with /
        const slashIdx = val.lastIndexOf('/');
        if (slashIdx === -1 || (slashIdx > 0 && val[slashIdx - 1] !== ' ' && slashIdx !== 0)) {
            setSuggestions([]);
            return;
        }

        const query = val.substring(slashIdx + 1).toLowerCase().trim();

        if (query.length === 0) {
            // Show all members when just "/" is typed
            setSuggestions(members.slice(0, 6));
            setSelectedIdx(0);
            return;
        }

        const roleReadable = (role) =>
            (role || '').replace(/_/g, ' ').toLowerCase();

        const filtered = members
            .filter(m =>
                m.name.toLowerCase().includes(query) ||
                roleReadable(m.role).includes(query)
            )
            .slice(0, 6);

        setSuggestions(filtered);
        setSelectedIdx(0);
    };

    // Pick a suggestion — replaces everything after the last "/"
    const applySuggestion = (member) => {
        const slashIdx = newMessage.lastIndexOf('/');
        const before = slashIdx >= 0 ? newMessage.substring(0, slashIdx) : '';
        setNewMessage(`${before}/${member.name} `);
        setSuggestions([]);
        inputRef.current?.focus();
    };

    // Keyboard navigation for suggestions
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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || suggestions.length > 0) return;

        const messageData = {
            roomId,
            sender: user._id,
            content: newMessage.trim(),
            companyId: user.companyId,
            projectId,
            isGlobal
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
        setSuggestions([]);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '600px',
            backgroundColor: 'white',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            {/* Chat Header */}
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
                    Tip: <b>/name</b> for private whisper
                </span>
            </div>

            {/* Message List */}
            <div style={{
                flex: 1, padding: '1.5rem', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                backgroundColor: '#f8fafc'
            }}>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                        const isSystem = msg.sender?.name === 'System';
                        const isPrivate = msg.messageType === 'PRIVATE';

                        return (
                            <div key={msg._id || index} style={{
                                alignSelf: isSystem ? 'center' : (isMe ? 'flex-end' : 'flex-start'),
                                maxWidth: isSystem ? '100%' : '80%',
                                display: 'flex', flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : (isSystem ? 'center' : 'flex-start')
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    marginBottom: '0.25rem', color: '#64748b', fontSize: '0.7rem'
                                }}>
                                    {!isMe && !isSystem && <span style={{ fontWeight: 600 }}>{msg.sender?.name}</span>}
                                    {isPrivate && <span style={{ color: '#7c3aed', fontWeight: 700 }}>🔒 whisper</span>}
                                    {msg.createdAt && <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                </div>
                                <div style={{
                                    padding: '0.75rem 1rem', borderRadius: '1rem',
                                    borderTopRightRadius: isMe ? '0.25rem' : '1rem',
                                    borderTopLeftRadius: isMe ? '1rem' : '0.25rem',
                                    backgroundColor: isSystem ? 'transparent' : (isMe ? '#2563eb' : (isPrivate ? '#f5f3ff' : 'white')),
                                    color: isSystem ? (msg.isError ? '#ef4444' : '#64748b') : (isMe ? 'white' : '#1e293b'),
                                    boxShadow: isSystem ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                                    fontSize: isSystem ? '0.75rem' : '0.9rem', lineHeight: 1.5,
                                    border: isSystem ? 'none' : (isPrivate ? '1.5px solid #ddd6fe' : (isMe ? 'none' : '1px solid #e2e8f0')),
                                    fontStyle: isSystem ? 'italic' : 'normal',
                                    textAlign: isSystem ? 'center' : 'left'
                                }}>
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
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Autocomplete */}
            <div style={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fff', position: 'relative' }}>
                {/* Suggestions dropdown */}
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
                            <AtSign size={11} /> Members — Tab or Enter to select
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
                                    /whisper
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... or /name to whisper"
                        style={{
                            flex: 1, padding: '0.65rem 1rem', borderRadius: '0.625rem',
                            border: `1px solid ${newMessage.includes('/') ? '#c4b5fd' : '#e2e8f0'}`,
                            fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                            backgroundColor: newMessage.match(/^\/\S/) ? '#faf8ff' : 'white'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                        onBlur={(e) => {
                            e.target.style.borderColor = newMessage.includes('/') ? '#c4b5fd' : '#e2e8f0';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || suggestions.length > 0}
                        style={{
                            width: '40px', height: '40px', borderRadius: '0.625rem',
                            backgroundColor: (newMessage.trim() && suggestions.length === 0) ? '#2563eb' : '#f1f5f9',
                            color: (newMessage.trim() && suggestions.length === 0) ? 'white' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none',
                            cursor: (newMessage.trim() && suggestions.length === 0) ? 'pointer' : 'default',
                            transition: 'all 0.2s', flexShrink: 0
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
