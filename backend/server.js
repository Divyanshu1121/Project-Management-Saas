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

const userSockets = new Map();

io.on('connection', (socket) => {
    socket.on('register_user', (userId) => {
        userSockets.set(userId, socket.id);
    });

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('send_message', async (data) => {
        const { roomId, sender, content, companyId, projectId, isGlobal, attachments } = data;

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
                attachments: attachments || []
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender', 'name email')
                .populate('recipient', 'name email')
                .populate('mentions', 'name email');

            if (parseResult.type === 'PRIVATE' && parseResult.recipientId) {
                const recipientSocketId = userSockets.get(parseResult.recipientId.toString());

                socket.emit('receive_message', populatedMessage);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('receive_message', populatedMessage);
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

                mentionedUserIds.forEach(async (mId) => {
                    const sid = userSockets.get(mId.toString());
                    if (mId.toString() !== sender) {
                        if (sid) {
                            io.to(sid).emit('mention_received', {
                                message: populatedMessage,
                                senderName: populatedMessage.sender.name
                            });
                        }
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

    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
