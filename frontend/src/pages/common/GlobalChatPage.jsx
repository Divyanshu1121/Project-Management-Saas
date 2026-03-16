import React from 'react';
import ChatWindow from '../../components/common/ChatWindow';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare } from 'lucide-react';

const GlobalChatPage = () => {
    const { user } = useAuth();
    const [activeMembers, setActiveMembers] = React.useState([]);

    if (!user) return null;

    const roomId = `global_${user.companyId}`;

    return (
        <div style={{ height: 'calc(100vh - 56px)', margin: '-1.75rem -2rem', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
                {/* CENTER COLUMN: Main Conversation */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <ChatWindow
                        roomId={roomId}
                        isGlobal={true}
                        title="Global Chat"
                        onMembersUpdate={(list) => setActiveMembers(list)}
                    />
                </div>

                {/* RIGHT COLUMN: Active Members */}
                <div style={{ width: '280px', backgroundColor: '#f8fafc', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1.2rem', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b' }}>
                        Active Members
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeMembers.length === 0 && (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>
                                No active members
                            </div>
                        )}
                        {activeMembers.map(member => (
                            <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ 
                                        width: 32, height: 32, borderRadius: '50%', 
                                        backgroundColor: '#eff6ff', display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', 
                                        color: '#2563eb', fontWeight: 700, fontSize: '0.8rem',
                                        border: '1px solid #dbeafe'
                                    }}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ 
                                        position: 'absolute', bottom: 0, right: 0, 
                                        width: 10, height: 10, borderRadius: '50%', 
                                        backgroundColor: member.status === 'online' ? '#22c55e' : (member.status === 'idle' ? '#eab308' : '#cbd5e1'), 
                                        border: '2px solid white' 
                                    }}></div>
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {member.name} {member._id === user._id && '(You)'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>
                                        {member.status || 'offline'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalChatPage;
