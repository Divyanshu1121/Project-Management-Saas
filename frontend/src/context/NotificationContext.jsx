import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/notifications?limit=50');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (err) {
            console.error('[NotificationContext] Fetch failed:', err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = useCallback(async (notifId) => {
        try {
            await api.patch(`/notifications/${notifId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notifId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('[NotificationContext] markAsRead failed:', err.message);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('[NotificationContext] markAllAsRead failed:', err.message);
        }
    }, []);

    const deleteNotification = useCallback(async (notifId) => {
        const wasUnread = notifications.find(n => n._id === notifId && !n.isRead);
        try {
            await api.delete(`/notifications/${notifId}`);
            setNotifications(prev => prev.filter(n => n._id !== notifId));
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('[NotificationContext] delete failed:', err.message);
        }
    }, [notifications]);

    const clearAll = useCallback(async () => {
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error('[NotificationContext] clearAll failed:', err.message);
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        const socket = io('http://localhost:5000', { withCredentials: true });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('register_user', user._id);
        });

        socket.on('new_notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            clearAll,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
