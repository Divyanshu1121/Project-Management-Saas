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
const CommandService = require('./services/commandService');
const MentionService = require('./services/mentionService');
const http = require('http');
const { Server } = require('socket.io');

app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

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

// Map to track user socket IDs for private messaging
const userSockets = new Map(); // userId -> socketId

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('register_user', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User registered: ${userId} with socket ${socket.id}`);
    });

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        const { roomId, sender, content, companyId, projectId, isGlobal, attachments } = data;

        try {
            // Parse for commands/private messages
            const parseResult = await CommandService.parse(content, companyId);

            if (parseResult.error) {
                // Send error feedback ONLY to sender
                socket.emit('error_message', { content: parseResult.error });
                return;
            }

            // Handle Mentions
            const mentionedUsernames = MentionService.extractUsernames(parseResult.content);
            const mentionedUserIds = await MentionService.resolveUserIds(mentionedUsernames, companyId);

            // Save message to MongoDB
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
                // Targeted emission to sender and recipient
                const recipientSocketId = userSockets.get(parseResult.recipientId.toString());

                socket.emit('receive_message', populatedMessage); // To sender
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('receive_message', populatedMessage); // To recipient
                }
            } else {
                // Broadcast to everyone in the room (standard behavior)
                io.to(roomId).emit('receive_message', populatedMessage);

                // Notify mentioned users who are NOT the sender
                mentionedUserIds.forEach(mId => {
                    const sid = userSockets.get(mId.toString());
                    if (sid && mId.toString() !== sender) {
                        io.to(sid).emit('mention_received', {
                            message: populatedMessage,
                            senderName: populatedMessage.sender.name
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error_message', { content: 'Failed to send message.' });
        }
    });

    socket.on('disconnect', () => {
        // Remove socket from map
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
