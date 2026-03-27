const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// ── Helper: notify all Leadership users in a company ──────────────────────
const notifyLeadership = async (companyId, { type, title, message, link, metadata }) => {
    const leaders = await User.find({ 
        companyId, 
        role: { $in: ['COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'] } 
    }).select('_id');
    await Promise.all(
        leaders.map(leader =>
            createNotification({ recipientId: leader._id, companyId, type, title, message, link, metadata })
        )
    );
};

// @desc    Request a leave
// @route   POST /api/leaves
// @access  Private
const requestLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;

        const isOwner = ['owner', 'COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'].includes(req.user.role);

        const leave = await LeaveRequest.create({
            userId: req.user._id,
            companyId: req.user.companyId,
            type: isOwner ? (type || 'OTHER') : type,
            startDate,
            endDate,
            reason: isOwner ? (reason || 'Leadership Notice') : reason,
            status: isOwner ? 'APPROVED' : 'PENDING',
            isInformOnly: isOwner,
            reviewNote: isOwner ? 'Auto approved - Owner notice' : undefined,
            approvedBy: isOwner ? req.user._id : undefined
        });

        const start = new Date(startDate).toDateString();
        const end = new Date(endDate).toDateString();

        if (isOwner) {
            // Owner already auto-approved, just inform HR
            const hrUsers = await User.find({ companyId: req.user.companyId, role: 'HR' }).select('_id');
            await Promise.all(hrUsers.map(hr => 
                createNotification({
                    recipientId: hr._id,
                    companyId: req.user.companyId,
                    type: 'LEAVE_REQUEST',
                    title: 'Leadership Leave Notice',
                    message: `Owner ${req.user.name} will be on leave (${start} → ${end})`,
                    link: '/hr/leaves',
                    metadata: { leaveId: leave._id },
                })
            ));
        } else if (req.user.role === 'HR') {
            // HR request needs Leadership approval
            await notifyLeadership(req.user.companyId, {
                type: 'LEAVE_REQUEST',
                title: 'HR Leave Request',
                message: `HR ${req.user.name} submitted a leave request (${start} → ${end})`,
                link: '/hr/leaves',
                metadata: { leaveId: leave._id },
            });
        } else {
            // Regular employee/manager request goes to HR
            const hrUsers = await User.find({ companyId: req.user.companyId, role: 'HR' }).select('_id');
            await Promise.all(hrUsers.map(hr => 
                createNotification({
                    recipientId: hr._id,
                    companyId: req.user.companyId,
                    type: 'LEAVE_REQUEST',
                    title: 'New Leave Request',
                    message: `${req.user.name} submitted a leave request (${start} → ${end})`,
                    link: '/hr/leaves',
                    metadata: { leaveId: leave._id },
                })
            ));
        }

        res.status(201).json(leave);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my leave requests
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all leave requests (for HR/CEO/Owner)
// @route   GET /api/leaves
// @access  Private (Leadership/HR)
const getCompanyLeaves = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ companyId: req.user.companyId })
            .populate('userId', 'name email empId role')
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id
// @access  Private (HR/Leadership)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, comment } = req.body;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await LeaveRequest.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        leave.status = status;
        leave.comment = comment;
        leave.approvedBy = req.user._id;

        await leave.save();

        res.json(leave);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Check for leave conflicts
// @route   GET /api/leaves/conflicts
// @access  Private (PM/HR/Leadership)
const checkConflicts = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        if (!userId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing parameters' });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const conflicts = await LeaveRequest.find({
            userId,
            status: 'APPROVED',
            startDate: { $lte: end },
            endDate: { $gte: start }
        });

        res.json({
            hasConflict: conflicts.length > 0,
            conflicts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get currently unavailable employees
// @route   GET /api/leaves/unavailable
// @access  Private
const getUnavailableEmployees = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const leaves = await LeaveRequest.find({
            companyId: req.user.companyId,
            status: 'APPROVED',
            startDate: { $lte: todayEnd },
            endDate: { $gte: todayStart }
        }).populate('userId', 'name email empId');

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get upcoming leaves (starting within next 7 days)
// @route   GET /api/leaves/upcoming
// @access  Private
const getUpcomingLeaves = async (req, res) => {
    try {
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const soon = new Date();
        soon.setDate(soon.getDate() + 7);
        soon.setHours(23, 59, 59, 999);

        const leaves = await LeaveRequest.find({
            companyId: req.user.companyId,
            status: 'APPROVED',
            startDate: { $gt: todayEnd, $lte: soon }
        }).populate('userId', 'name email empId')
            .sort({ startDate: 1 });

        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    requestLeave,
    getMyLeaves,
    getCompanyLeaves,
    updateLeaveStatus,
    checkConflicts,
    getUnavailableEmployees,
    getUpcomingLeaves
};
