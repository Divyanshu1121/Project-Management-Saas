import React from 'react';
import ChatWindow from '../../components/common/ChatWindow';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';

const GlobalChatPage = () => {
    const { user } = useAuth();

    if (!user) return null;

    const roomId = `global_${user.companyId}`;

    return (
        <div style={{ padding: '2rem', height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.75rem', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={24} color="#2563eb" />
                    </div>
                    Global Chat
                </h2>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0' }}>
                    Connect with everyone in your company in real-time.
                </p>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                <ChatWindow
                    roomId={roomId}
                    isGlobal={true}
                    title="Company Wide Discussion"
                />
            </div>
        </div>
    );
};

export default GlobalChatPage;
