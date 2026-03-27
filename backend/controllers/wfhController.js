const WFHRequest = require('../models/WFHRequest');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// ── Helper: notify all HR users in a company ──────────────────────────────
const notifyHR = async (companyId, { type, title, message, link, metadata }) => {
    const hrUsers = await User.find({ companyId, role: 'HR' }).select('_id');
    await Promise.all(
        hrUsers.map(hr =>
            createNotification({ recipientId: hr._id, companyId, type, title, message, link, metadata })
        )
    );
};

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

// ── POST /api/wfh/request ─────────────────────────────────────────────────
// Employee submits a WFH request
const submitWFHRequest = async (req, res) => {
    try {
        const { startDate, endDate, workLocation, customLocation, reason, workPlan } = req.body;

        if (workLocation === 'other' && !customLocation?.trim()) {
            return res.status(400).json({ message: 'Custom location is required when work location is "other"' });
        }

        const isOwner = ['owner', 'COMPANY_OWNER', 'CEO', 'CTO', 'CFO', 'COO'].includes(req.user.role);

        const wfh = await WFHRequest.create({
            employee: req.user._id,
            company: req.user.companyId,
            startDate,
            endDate,
            workLocation: isOwner ? (workLocation || 'home') : workLocation,
            customLocation: workLocation === 'other' ? customLocation : undefined,
            reason: isOwner ? (reason || 'Leadership Notice') : reason,
            workPlan: isOwner ? (workPlan || 'Leadership Notice') : workPlan,
            status: isOwner ? 'approved' : 'pending',
            isInformOnly: isOwner,
            reviewNote: isOwner ? 'Auto approved - Owner notice' : undefined,
            reviewedBy: isOwner ? req.user._id : undefined
        });

        const populatedWfh = await WFHRequest.findById(wfh._id)
            .populate('employee', 'name email empId role');

        // Notify HR or Leadership
        const start = new Date(startDate).toDateString();
        const end = new Date(endDate).toDateString();
        
        if (isOwner) {
            // Owner already auto-approved, just inform HR
            await notifyHR(req.user.companyId, {
                type: 'WFH_REQUEST',
                title: 'Leadership WFH Notice',
                message: `Owner ${populatedWfh.employee.name} will be WFH (${start} → ${end})`,
                link: '/hr/wfh',
                metadata: { wfhId: wfh._id },
            });
        } else if (req.user.role === 'HR') {
            // HR request needs Leadership approval
            await notifyLeadership(req.user.companyId, {
                type: 'WFH_REQUEST',
                title: 'HR WFH Request',
                message: `HR ${populatedWfh.employee.name} requested WFH (${start} → ${end})`,
                link: '/hr/wfh',
                metadata: { wfhId: wfh._id },
            });
        } else {
            // Regular employee/manager request goes to HR
            await notifyHR(req.user.companyId, {
                type: 'WFH_REQUEST',
                title: 'New WFH Request',
                message: `${populatedWfh.employee.name} submitted a WFH request (${start} → ${end})`,
                link: '/hr/wfh',
                metadata: { wfhId: wfh._id },
            });
        }

        res.status(201).json(populatedWfh);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ── GET /api/wfh/my-requests ──────────────────────────────────────────────
// Employee views their own WFH request history
const getMyWFHRequests = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const query = { employee: req.user._id };

        if (status) query.status = status;
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        const requests = await WFHRequest.find(query)
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ── GET /api/wfh/company-requests ────────────────────────────────────────
// HR sees all WFH requests for the company
const getCompanyWFHRequests = async (req, res) => {
    try {
        const { status, startDate, endDate, employee } = req.query;
        const query = { company: req.user.companyId };

        if (status) query.status = status;
        if (employee) query.employee = employee;
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        const requests = await WFHRequest.find(query)
            .populate('employee', 'name email empId role')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ── PATCH /api/wfh/:id/review ─────────────────────────────────────────────
// HR approves or rejects a WFH request
const reviewWFHRequest = async (req, res) => {
    try {
        const { status, reviewNote } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
        }

        const wfh = await WFHRequest.findById(req.params.id)
            .populate('employee', 'name email empId');

        if (!wfh) return res.status(404).json({ message: 'WFH request not found' });
        if (wfh.company.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (wfh.status !== 'pending') {
            return res.status(400).json({ message: 'Can only review pending requests' });
        }

        wfh.status = status;
        wfh.reviewedBy = req.user._id;
        wfh.reviewNote = reviewNote || '';
        await wfh.save();

        // Notify the employee
        const reviewer = await User.findById(req.user._id).select('name');
        const start = new Date(wfh.startDate).toDateString();
        const end = new Date(wfh.endDate).toDateString();
        await createNotification({
            recipientId: wfh.employee._id,
            companyId: req.user.companyId,
            type: status === 'approved' ? 'WFH_APPROVED' : 'WFH_REJECTED',
            title: `WFH Request ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`,
            message: `${reviewer.name} ${status} your WFH request (${start} → ${end})${reviewNote ? ': ' + reviewNote : ''}`,
            link: '/employee/wfh',
            metadata: { wfhId: wfh._id },
        });

        res.json(wfh);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ── PATCH /api/wfh/:id/cancel ─────────────────────────────────────────────
// Employee cancels their own pending WFH request
const cancelWFHRequest = async (req, res) => {
    try {
        const wfh = await WFHRequest.findById(req.params.id);

        if (!wfh) return res.status(404).json({ message: 'WFH request not found' });
        if (wfh.employee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (wfh.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending requests can be cancelled' });
        }

        wfh.status = 'cancelled';
        await wfh.save();

        res.json(wfh);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ── GET /api/wfh/calendar ─────────────────────────────────────────────────
// Returns approved WFH + leave data combined, grouped by date
// Query params: scope=mine|company|team, year, month
const getWFHCalendar = async (req, res) => {
    try {
        const { scope = 'company', year, month } = req.query;

        // Build date range filter
        let dateFilter = {};
        if (year && month) {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            dateFilter = { startDate: { $lte: end }, endDate: { $gte: start } };
        }

        // Build WFH query
        const wfhQuery = { status: 'approved', ...dateFilter };
        if (scope === 'mine') {
            wfhQuery.employee = req.user._id;
        } else {
            wfhQuery.company = req.user.companyId;
        }

        // Build Leave query
        const leaveQuery = { status: 'APPROVED', ...dateFilter };
        if (scope === 'mine') {
            leaveQuery.userId = req.user._id;
        } else {
            leaveQuery.companyId = req.user.companyId;
        }

        const [wfhRequests, leaveRequests] = await Promise.all([
            WFHRequest.find(wfhQuery).populate('employee', 'name email empId'),
            LeaveRequest.find(leaveQuery).populate('userId', 'name email empId'),
        ]);

        // Transform WFH events
        const wfhEvents = wfhRequests.map(w => ({
            id: w._id,
            type: 'wfh',
            employee: w.employee,
            startDate: w.startDate,
            endDate: w.endDate,
            workLocation: w.workLocation,
            customLocation: w.customLocation,
            reason: (scope === 'mine' || ['HR', 'COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'].includes(req.user.role)) ? w.reason : undefined,
            workPlan: (scope === 'mine' || ['HR', 'COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'].includes(req.user.role)) ? w.workPlan : undefined,
            isInformOnly: w.isInformOnly
        }));

        // Transform Leave events
        const leaveEvents = leaveRequests.map(l => ({
            id: l._id,
            type: 'leave',
            employee: l.userId,
            startDate: l.startDate,
            endDate: l.endDate,
            leaveType: l.type,
            reason: (scope === 'mine' || ['HR', 'COMPANY_OWNER', 'owner', 'CEO', 'CTO', 'CFO', 'COO'].includes(req.user.role)) ? l.reason : undefined,
            isInformOnly: l.isInformOnly
        }));

        res.json({ wfhEvents, leaveEvents });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ── GET /api/wfh/today-status ─────────────────────────────────────────────
// Returns today's WFH + leave status per employee (used by PM workload)
const getTodayStatuses = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const dateFilter = { startDate: { $lte: todayEnd }, endDate: { $gte: todayStart } };

        const [wfhToday, leavesToday] = await Promise.all([
            WFHRequest.find({ company: req.user.companyId, status: 'approved', ...dateFilter })
                .select('employee workLocation customLocation'),
            LeaveRequest.find({ companyId: req.user.companyId, status: 'APPROVED', ...dateFilter })
                .select('userId'),
        ]);

        // Build a map: employeeId -> { status, location }
        const statusMap = {};
        leavesToday.forEach(l => {
            statusMap[l.userId.toString()] = { status: 'on_leave', workLocation: null };
        });
        wfhToday.forEach(w => {
            // WFH takes precedence display only if not already on leave
            if (!statusMap[w.employee.toString()]) {
                statusMap[w.employee.toString()] = {
                    status: 'wfh',
                    workLocation: w.workLocation,
                    customLocation: w.customLocation,
                };
            }
        });

        res.json(statusMap);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    submitWFHRequest,
    getMyWFHRequests,
    getCompanyWFHRequests,
    reviewWFHRequest,
    cancelWFHRequest,
    getWFHCalendar,
    getTodayStatuses,
};
