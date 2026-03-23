require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Company = require('../models/Company');
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const TimeLog = require('../models/TimeLog');
const LeaveRequest = require('../models/LeaveRequest');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

const MOCK_PASSWORD = 'Test@1234';

const SEED_USERS = [
    { name: 'Alice PM', email: 'pm.seed@example.com', role: 'PROJECT_MANAGER' },
    { name: 'Bob HR', email: 'hr.seed@example.com', role: 'HR' },
    { name: 'Charlie CTO', email: 'cto.seed@example.com', role: 'CTO' },
    { name: 'Diana COO', email: 'coo.seed@example.com', role: 'COO' },
    { name: 'Eva Dev', email: 'fe1.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Frank Dev', email: 'fe2.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Grace Dev', email: 'fe3.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Hank Dev', email: 'be1.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Ivy Dev', email: 'be2.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Jack Dev', email: 'be3.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Karen QA', email: 'qa1.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Leo QA', email: 'qa2.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Mia Designer', email: 'design1.seed@example.com', role: 'EMPLOYEE' },
    { name: 'Noah DevOps', email: 'devops1.seed@example.com', role: 'EMPLOYEE' },
];

const seedData = async () => {
    try {
        await connectDB();

        let companyId = process.argv[2];
        let company;

        if (companyId) {
            company = await Company.findById(companyId);
            if (!company) {
                console.error(`Company with ID ${companyId} not found.`);
                process.exit(1);
            }
        } else {
            // Target the company associated with the provided credentials
            const targetOwner = await User.findOne({ email: 'g@gmail.com' });
            if (targetOwner) {
                companyId = targetOwner.companyId;
                company = await Company.findById(companyId);
                console.log(`Target owner g@gmail.com found. Using their company: ${company?.name || 'Unknown'} (${companyId})`);
            } else {
                company = await Company.findOne();
                if (!company) {
                    console.error('No company found in the database. Please create one first.');
                    process.exit(1);
                }
                companyId = company._id;
                console.log(`Target owner g@gmail.com not found. Using first company found: ${company.name} (${companyId})`);
            }
        }

        const pmEmail = `pm.seed_${companyId.toString().substring(0, 5)}@example.com`;
        const existingPM = await User.findOne({ email: pmEmail, companyId });
        if (existingPM) {
            console.log('Seed data already exists for this company. Aborting to avoid duplicates.');
            process.exit(0);
        }

        let owner = await User.findOne({ companyId, role: { $in: ['owner', 'COMPANY_OWNER'] } });
        if (!owner) {
            owner = await User.findOne({ companyId });
        }
        if (!owner) {
            console.error('Company has no users. Cannot assign creator references.');
            process.exit(1);
        }

        console.log(`Seeding data for Company: ${company.name}`);

        const createdUsers = [];
        for (const u of SEED_USERS) {
            const uniqueEmail = u.email.replace('@', `_${companyId.toString().substring(0, 5)}@`);
            const user = await User.create({
                name: u.name,
                email: uniqueEmail,
                password: MOCK_PASSWORD,
                role: u.role,
                companyId: companyId,
                company: companyId,
                isActive: true,
                isEmailVerified: true
            });
            createdUsers.push(user);
        }
        console.log(`✅ Users: 14 created (Total 15 including owner)`);

        const emps = createdUsers.filter(u => u.role === 'EMPLOYEE');

        const frontendTeam = await Team.create({
            name: 'Frontend Team',
            companyId,
            createdBy: owner._id,
            members: [createdUsers[4]._id, createdUsers[5]._id, createdUsers[6]._id] // FE Devs
        });
        const backendTeam = await Team.create({
            name: 'Backend Team',
            companyId,
            createdBy: owner._id,
            members: [createdUsers[7]._id, createdUsers[8]._id, createdUsers[9]._id] // BE Devs
        });
        const qaTeam = await Team.create({
            name: 'QA Team',
            companyId,
            createdBy: owner._id,
            members: [createdUsers[10]._id, createdUsers[11]._id] // QA
        });

        console.log(`✅ Teams: 3 created`);

        const teams = [frontendTeam, backendTeam, qaTeam];

        const projectData = [
            { name: 'Website Redesign', status: 'COMPLETED', progress: 100 },
            { name: 'Mobile App V2', status: 'ACTIVE', progress: 45 },
            { name: 'Internal Dashboard', status: 'ACTIVE', progress: 15 },
            { name: 'AI Integration', status: 'PLANNING', progress: 0 },
            { name: 'Legacy Migration', status: 'ON_HOLD', progress: 30 }
        ];

        const createdProjects = [];
        for (const p of projectData) {
            const proj = await Project.create({
                name: p.name,
                description: `Description for ${p.name}`,
                companyId,
                createdBy: owner._id,
                status: p.status,
                progress: p.progress,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                teamAssigned: [teams[Math.floor(Math.random() * teams.length)]._id]
            });
            createdProjects.push(proj);
        }

        console.log(`✅ Projects: 5 created`);

        const activeProjects = createdProjects.filter(p => p.status === 'ACTIVE');
        const sprints = [];

        for (const proj of activeProjects) {
            sprints.push(await Sprint.create({
                name: 'Sprint 1',
                projectId: proj._id,
                startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                status: 'completed'
            }));
            sprints.push(await Sprint.create({
                name: 'Sprint 2',
                projectId: proj._id,
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'active'
            }));
            sprints.push(await Sprint.create({
                name: 'Sprint 3',
                projectId: proj._id,
                startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                status: 'planned'
            }));
        }
        console.log(`✅ Sprints: ${sprints.length} created`);

        const createdTasks = [];
        for (let i = 0; i < 30; i++) {
            const proj = createdProjects[i % createdProjects.length];
            let sprintId = null;
            if (proj.status === 'ACTIVE') {
                const projSprints = sprints.filter(s => s.projectId.toString() === proj._id.toString());
                sprintId = projSprints[Math.floor(Math.random() * projSprints.length)]._id;
            }

            const statuses = ['TODO', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'];
            const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

            const task = await Task.create({
                title: `Task ${i + 1} for ${proj.name}`,
                description: `Detailed description for task ${i + 1}`,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                projectId: proj._id,
                sprintId,
                companyId,
                teamId: frontendTeam._id,
                assignedTo: emps[Math.floor(Math.random() * emps.length)]._id,
                startDate: new Date(),
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                estimatedHours: Math.floor(Math.random() * 20) + 1,
                subtasks: [
                    { title: 'Subtask 1', isCompleted: false },
                    { title: 'Subtask 2', isCompleted: true }
                ]
            });
            createdTasks.push(task);
        }

        console.log(`✅ Tasks: 30 created`);

        let timeLogsCreated = 0;
        for (const emp of emps) {
            for (let i = 0; i < 3; i++) {
                await TimeLog.create({
                    userId: emp._id,
                    taskId: createdTasks[Math.floor(Math.random() * createdTasks.length)]._id,
                    date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                    duration: Math.floor(Math.random() * 240) + 60, // 1h to 5h in mins
                    description: 'Worked on task logic'
                });
                timeLogsCreated++;
            }
        }
        console.log(`✅ Time Logs: ${timeLogsCreated} created`);

        let leaveRequestsCreated = 0;
        const leaveScenarios = [
            { status: 'APPROVED', i: 5 },
            { status: 'PENDING', i: 3 },
            { status: 'REJECTED', i: 2 }
        ];

        for (const type of leaveScenarios) {
            for (let j = 0; j < type.i; j++) {
                await LeaveRequest.create({
                    userId: emps[Math.floor(Math.random() * emps.length)]._id,
                    companyId,
                    type: 'ANNUAL',
                    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
                    status: type.status,
                    reason: `Taking some personal time off (${type.status})`,
                    approvedBy: type.status === 'APPROVED' ? owner._id : null
                });
                leaveRequestsCreated++;
            }
        }
        console.log(`✅ Leave Requests: ${leaveRequestsCreated} created`);

        let activitiesCreated = 0;
        for (const proj of createdProjects) {
            for (let i = 0; i < 10; i++) {
                const actionTypes = ['TASK_CREATED', 'TASK_UPDATED', 'SPRINT_STARTED', 'GENERAL'];
                await ActivityLog.create({
                    userId: owner._id,
                    actionType: actionTypes[Math.floor(Math.random() * actionTypes.length)],
                    entityType: 'project',
                    projectId: proj._id,
                    companyId,
                    message: `Action happened in ${proj.name} [#${i}]`
                });
                activitiesCreated++;
            }
        }
        console.log(`✅ Activities: ${activitiesCreated} created`);

        let unreadNotifs = 0;
        for (let i = 0; i < 5; i++) {
            await Notification.create({
                recipient: owner._id,
                companyId,
                type: 'TASK_ASSIGNED',
                title: 'Seed Data Task',
                message: 'A mocked task was assigned internally.',
                isRead: false
            });
            unreadNotifs++;
        }

        const pm = createdUsers.find(u => u.role === 'PROJECT_MANAGER');
        if (pm) {
            for (let i = 0; i < 5; i++) {
                await Notification.create({
                    recipient: pm._id,
                    companyId,
                    type: 'GENERAL',
                    title: 'System Update',
                    message: 'Seed data initialization completed.',
                    isRead: false
                });
                unreadNotifs++;
            }
        }
        console.log(`✅ Notifications: ${unreadNotifs} created`);

        console.log('\n=======================================');
        console.log('🎉 SEEDING COMPLETED SUCCESSFULLY 🎉');
        console.log('=======================================');

        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
