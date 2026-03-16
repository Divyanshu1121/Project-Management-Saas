const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/sprints', require('./routes/sprintRoutes'));
app.use('/api/time-logs', require('./routes/timeLogRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/company', require('./routes/companyUserRoutes'));
app.use('/api/company', require('./routes/companyDashboardRoutes'));
app.use('/api/company/teams', require('./routes/companyTeamRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/employee', require('./routes/employeeRoutes'));
const Message = require('./models/Message');
const Task = require('./models/Task');
const Project = require('./models/Project');
const CommandService = require('./services/commandService');
const MentionService = require('./services/mentionService');
const { sendNotification } = require('./services/notificationService');
const http = require('http');
const { Server } = require('socket.io');

app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activity', require('./routes/activityLogRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    }
});

const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> { userId, userName, companyId, status }
const roomUsers = new Map();   // roomId -> Set of userIds

io.on('connection', (socket) => {
    socket.on('register_user', (userData) => {
        // userData can be userId or { userId, name, companyId }
        const userId = typeof userData === 'string' ? userData : userData.userId;
        const name = userData.name || 'Unknown';
        const companyId = userData.companyId;

        userSockets.set(userId, socket.id);
        socketUsers.set(socket.id, { userId, name, companyId, status: 'online' });
    });

    socket.on('join_room', (data) => {
        const roomId = typeof data === 'string' ? data : data.roomId;
        socket.join(roomId);

        const user = socketUsers.get(socket.id);
        if (user) {
            if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Set());
            roomUsers.get(roomId).add(user.userId);
            
            // Broadcast updated member list to room
            broadcastRoomMembers(roomId);
        }
    });

    const broadcastRoomMembers = async (roomId) => {
        const userIds = Array.from(roomUsers.get(roomId) || []);
        const User = require('./models/User');
        
        try {
            // Get user details and their current status
            const users = await User.find({ _id: { $in: userIds } }).select('name role');
            const membersWithStatus = users.map(u => {
                const sId = userSockets.get(u._id.toString());
                const detail = socketUsers.get(sId);
                return {
                    _id: u._id,
                    name: u.name,
                    role: u.role,
                    status: detail ? detail.status : 'offline'
                };
            });
            
            io.to(roomId).emit('room_members', membersWithStatus);
        } catch (err) {
            console.error('Error broadcasting members:', err);
        }
    };

    socket.on('send_message', async (data) => {
        const { roomId, sender, content, companyId, projectId, isGlobal, attachments, replyTo } = data;

        try {
            const parseResult = await CommandService.parse(content, companyId);

            if (parseResult.error) {
                socket.emit('error_message', { content: parseResult.error });
                return;
            }

            const mentionedUsernames = MentionService.extractUsernames(parseResult.content);
            const mentionedUserIds = await MentionService.resolveUserIds(mentionedUsernames, companyId);

            const newMessage = await Message.create({
                sender,
                companyId,
                projectId,
                recipient: parseResult.recipientId || null,
                content: parseResult.content,
                isGlobal: isGlobal || parseResult.type === 'PRIVATE',
                messageType: parseResult.type,
                mentions: mentionedUserIds,
                attachments: attachments || [],
                replyTo: replyTo || null
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender', 'name email')
                .populate('recipient', 'name email')
                .populate('mentions', 'name email')
                .populate({
                    path: 'replyTo',
                    populate: { path: 'sender', select: 'name' }
                });

            if (parseResult.type === 'PRIVATE' && parseResult.recipientId) {
                const recipientSocketId = userSockets.get(parseResult.recipientId.toString());

                socket.emit('receive_message', populatedMessage);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('receive_message', populatedMessage);
                }

                // Global notification for whisper
                if (parseResult.recipientId.toString() !== sender) {
                    await sendNotification(io, userSockets, {
                        recipientId: parseResult.recipientId,
                        companyId,
                        type: 'ACTIVITY',
                        title: 'New private message',
                        message: `${populatedMessage.sender.name} whispered to you`,
                        link: '/chat',
                        metadata: { messageId: newMessage._id }
                    });
                }
            } else if (parseResult.type === 'TASK_CREATE') {
                let effectiveProjectId = projectId;
                if (!effectiveProjectId) {
                    const firstProject = await Project.findOne({ companyId });
                    if (firstProject) effectiveProjectId = firstProject._id;
                }

                if (!effectiveProjectId) {
                    socket.emit('error_message', { content: 'Cannot create task: No project found for this company.' });
                    return;
                }

                const newTask = await Task.create({
                    title: parseResult.taskData.title,
                    assignedTo: parseResult.taskData.assignedTo,
                    deadline: parseResult.taskData.deadline,
                    companyId: companyId,
                    projectId: effectiveProjectId,
                    status: 'TODO',
                    priority: 'MEDIUM'
                });

                // Notify the assigned user
                if (parseResult.taskData.assignedTo) {
                    const senderUser = await require('./models/User').findById(sender).select('name');
                    await sendNotification(io, userSockets, {
                        recipientId: parseResult.taskData.assignedTo,
                        companyId,
                        type: 'TASK_ASSIGNED',
                        title: 'New task assigned to you',
                        message: `${senderUser?.name || 'Someone'} assigned you "${parseResult.taskData.title}"${parseResult.taskData.deadline ? ` — due ${new Date(parseResult.taskData.deadline).toDateString().replace(/^\w+ /, '')}` : ''}`,
                        link: '/employee/tasks',
                        metadata: { taskId: newTask._id },
                    });
                }

                const deadlineText = parseResult.taskData.deadline
                    ? ` by ${new Date(parseResult.taskData.deadline).toDateString().replace(/^\w+ /, '')}`
                    : '';
                const confirmationMsg = `✅ Task Created: "${parseResult.taskData.title}" assigned to ${parseResult.taskData.assigneeName}${deadlineText}`;

                const systemMessage = await Message.create({
                    sender,
                    companyId,
                    projectId: effectiveProjectId,
                    content: confirmationMsg,
                    isGlobal: true,
                    messageType: 'COMMAND'
                });

                const populatedSystemMsg = await Message.findById(systemMessage._id)
                    .populate('sender', 'name email');

                io.to(roomId).emit('receive_message', populatedSystemMsg);
            } else {
                io.to(roomId).emit('receive_message', populatedMessage);

                // Global notification for reply
                if (populatedMessage.replyTo && populatedMessage.replyTo.sender && populatedMessage.replyTo.sender._id.toString() !== sender) {
                    await sendNotification(io, userSockets, {
                        recipientId: populatedMessage.replyTo.sender._id,
                        companyId,
                        type: 'ACTIVITY',
                        title: 'New reply to your message',
                        message: `${populatedMessage.sender.name} replied to you: "${populatedMessage.content.substring(0, 40)}..."`,
                        link: '/chat',
                        metadata: { messageId: newMessage._id }
                    });
                }

                mentionedUserIds.forEach(async (mId) => {
                    const sid = userSockets.get(mId.toString());
                    if (mId.toString() !== sender) {
                        // Persist mention notification
                        await sendNotification(io, userSockets, {
                            recipientId: mId,
                            companyId,
                            type: 'MENTION',
                            title: 'You were mentioned in chat',
                            message: `${populatedMessage.sender.name} mentioned you: "${populatedMessage.content.substring(0, 80)}${populatedMessage.content.length > 80 ? '...' : ''}"`,
                            link: '/chat',
                            metadata: { messageId: newMessage._id },
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error_message', { content: 'Failed to send message.' });
        }
    });

    socket.on('typing', (data) => {
        const { roomId, userId, userName } = data;
        socket.to(roomId).emit('user_typing', { userId, userName });
    });

    socket.on('add_reaction', async (data) => {
        const { messageId, emoji, userId, roomId } = data;
        try {
            const message = await Message.findById(messageId);
            if (!message) return;

            // Check if reaction already exists
            const existingIndex = message.reactions.findIndex(
                r => r.user.toString() === userId && r.emoji === emoji
            );

            if (existingIndex >= 0) {
                // Remove reaction if it exists (toggle)
                message.reactions.splice(existingIndex, 1);
            } else {
                // Add the new reaction
                message.reactions.push({ emoji, user: userId });
            }

            await message.save();

            const populatedMessage = await Message.findById(messageId)
                .populate('sender', 'name email')
                .populate('recipient', 'name email')
                .populate('reactions.user', 'name'); // populating users who reacted

            io.to(roomId).emit('reaction_updated', {
                messageId,
                reactions: populatedMessage.reactions
            });

            // Notify message owner if someone else reacts
            if (populatedMessage.sender && populatedMessage.sender._id.toString() !== userId) {
                const latestReaction = populatedMessage.reactions[populatedMessage.reactions.length - 1];
                if (latestReaction && latestReaction.user._id.toString() === userId) {
                    await sendNotification(io, userSockets, {
                        recipientId: populatedMessage.sender._id,
                        companyId: populatedMessage.companyId,
                        type: 'ACTIVITY',
                        title: 'Reaction on your message',
                        message: `${latestReaction.user.name} reacted with ${latestReaction.emoji} to: "${populatedMessage.content.substring(0, 40)}..."`,
                        link: '/chat',
                        metadata: { messageId: populatedMessage._id }
                    });
                }
            }

        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    });

    socket.on('disconnect', () => {
        const user = socketUsers.get(socket.id);
        if (user) {
            // Only delete if this is the active socket for the user
            if (userSockets.get(user.userId) === socket.id) {
                userSockets.delete(user.userId);
            }
            socketUsers.delete(socket.id);

            // Remove from all rooms
            for (const [roomId, users] of roomUsers.entries()) {
                if (users.has(user.userId)) {
                    users.delete(user.userId);
                    broadcastRoomMembers(roomId);
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
