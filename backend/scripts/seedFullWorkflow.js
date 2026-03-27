require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
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

const { createCompany } = require('../services/companyService');

const MOCK_PASSWORD = 'Test@1234';

const SEED_USERS = [
    { name: 'Diana COO', email: 'coo@technova.com', role: 'COO' },
    { name: 'Charlie CTO', email: 'cto@technova.com', role: 'CTO' },
    { name: 'Bob HR', email: 'hr@technova.com', role: 'HR' },
    { name: 'Alice PM', email: 'pm@technova.com', role: 'PROJECT_MANAGER' },
    { name: 'Eve Startup PM', email: 'pm2@technova.com', role: 'PROJECT_MANAGER' },
    { name: 'Eva Dev', email: 'fe1@technova.com', role: 'EMPLOYEE' },
    { name: 'Frank Dev', email: 'fe2@technova.com', role: 'EMPLOYEE' },
    { name: 'Grace Dev', email: 'fe3@technova.com', role: 'EMPLOYEE' },
    { name: 'Hank Dev', email: 'be1@technova.com', role: 'EMPLOYEE' },
    { name: 'Ivy Dev', email: 'be2@technova.com', role: 'EMPLOYEE' },
    { name: 'Jack Dev', email: 'be3@technova.com', role: 'EMPLOYEE' },
    { name: 'Karen QA', email: 'qa1@technova.com', role: 'EMPLOYEE' },
    { name: 'Leo QA', email: 'qa2@technova.com', role: 'EMPLOYEE' },
    { name: 'Mia Designer', email: 'design1@technova.com', role: 'EMPLOYEE' },
    { name: 'Noah DevOps', email: 'devops1@technova.com', role: 'EMPLOYEE' },
];

const seedData = async () => {
    try {
        await connectDB();
        console.log('--- Starting TechNova Data Seeding ---');

        // 1. Simulate Public Signup (Owner & Company Creation)
        const companySignupData = {
            name: 'TechNova Solutions',
            companySize: '11-50',
            industry: 'Technology',
            website: 'https://technova.example.com',
            country: 'United States',
            city: 'San Francisco',
            isActive: true,
            plan: 'pro',
            isTrialActive: true,
            isEmailVerified: true
        };

        const ownerSignupData = {
            name: 'Alex CEO',
            email: 'admin@technova.com',
            password: 'Admin@123', // Admin logic allows simple passwords
            phone: '+1 555-0199',
            ownerRole: 'CEO'
        };

        let companyResponse;
        try {
            console.log('[Step 1] Simulating Public Signup...');
            companyResponse = await createCompany(companySignupData, ownerSignupData);
            console.log('✅ Company created successfully:', companyResponse.company.companyName);
            console.log('✅ Owner created successfully:', companyResponse.owner.email);
        } catch (error) {
            console.error('Error creating company. It might already exist.');
            // If already exists, delete the old one to allow a fresh seed
            if (error.message === 'Company already exists' || error.message.includes('already registered')) {
                console.log('Cleaning up existing "TechNova Solutions" data to do a fresh seed...');
                const existingCompany = await Company.findOne({ name: 'TechNova Solutions' });
                if (existingCompany) {
                    const { deleteCompany } = require('../services/companyService');
                    await deleteCompany(existingCompany._id);
                    console.log('Cleanup done. Retrying signup...');
                    companyResponse = await createCompany(companySignupData, ownerSignupData);
                } else {
                    const existingUser = await User.findOne({ email: 'admin@technova.com' });
                    if (existingUser) await User.findByIdAndDelete(existingUser._id);
                    companyResponse = await createCompany(companySignupData, ownerSignupData);
                }
            } else {
                throw error;
            }
        }

        const companyId = companyResponse.company._id;
        const ownerId = companyResponse.owner._id;

        // Fetch full owner object to get references
        const owner = await User.findById(ownerId);

        // 2. Create Members
        console.log('\n[Step 2] Hiring Employees & Staff...');
        const createdUsers = [];
        for (const u of SEED_USERS) {
            const user = await User.create({
                name: u.name,
                email: u.email,
                password: MOCK_PASSWORD,
                role: u.role,
                companyId: companyId,
                company: companyId,
                isActive: true,
                isEmailVerified: true
            });
            createdUsers.push(user);
        }
        console.log(`✅ Hired ${createdUsers.length} staff members (Executives, PMs, Employees).`);

        const hr = createdUsers.find(u => u.role === 'HR');
        const pms = createdUsers.filter(u => u.role === 'PROJECT_MANAGER');
        const emps = createdUsers.filter(u => u.role === 'EMPLOYEE');

        // 3. Create Teams
        console.log('\n[Step 3] Building Teams...');
        const teamsList = [
            { name: 'Frontend Team', members: emps.slice(0, 3) },
            { name: 'Backend Team', members: emps.slice(3, 6) },
            { name: 'QA Team', members: emps.slice(6, 8) },
            { name: 'Design & Product', members: emps.slice(8, 9) },
            { name: 'Platform Engineering', members: emps.slice(9, 10) }
        ];

        const createdTeams = [];
        for (const t of teamsList) {
            const team = await Team.create({
                name: t.name,
                companyId,
                createdBy: owner._id, // Owner creates teams
                members: t.members.map(m => m._id)
            });
            createdTeams.push(team);
        }
        console.log(`✅ ${createdTeams.length} Teams built and populated.`);

        // 4. Create Projects
        console.log('\n[Step 4] Initializing Projects...');
        const projectData = [
            { name: 'NextGen E-Commerce', status: 'ACTIVE', progress: 45, teamIndex: [0, 1] },
            { name: 'Mobile App Refactor', status: 'ACTIVE', progress: 70, teamIndex: [0, 2] },
            { name: 'Internal HR Panel', status: 'COMPLETED', progress: 100, teamIndex: [1] },
            { name: 'AI Feature R&D', status: 'PLANNING', progress: 0, teamIndex: [4] },
            { name: 'Legacy Data Migration', status: 'ON_HOLD', progress: 15, teamIndex: [1] }
        ];

        const createdProjects = [];
        for (const p of projectData) {
            // PMs create projects
            const creator = pms[Math.floor(Math.random() * pms.length)];
            const teamAssigned = p.teamIndex.map(i => createdTeams[i]._id);

            const proj = await Project.create({
                name: p.name,
                description: `A highly anticipated ${p.name} initiative.`,
                companyId,
                createdBy: creator._id,
                status: p.status,
                progress: p.progress,
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                teamAssigned: teamAssigned
            });
            createdProjects.push(proj);
        }
        console.log(`✅ ${createdProjects.length} Projects launched by PMs.`);

        // 5. Create Sprints
        console.log('\n[Step 5] Planning Sprints...');
        const activeProjects = createdProjects.filter(p => p.status === 'ACTIVE');
        const sprints = [];

        for (const proj of activeProjects) {
            // Completed sprint
            sprints.push(await Sprint.create({
                name: 'Sprint 1 - Foundation',
                projectId: proj._id,
                startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                status: 'completed'
            }));
            // Active sprint
            sprints.push(await Sprint.create({
                name: 'Sprint 2 - Core Features',
                projectId: proj._id,
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'active'
            }));
            // Future sprint
            sprints.push(await Sprint.create({
                name: 'Sprint 3 - Polish',
                projectId: proj._id,
                startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                status: 'planned'
            }));
        }
        console.log(`✅ Organized ${sprints.length} Sprints for Active Projects.`);

        // 6. Create Tasks
        console.log('\n[Step 6] Assigning Tasks to Employees...');
        const createdTasks = [];
        let tIndex = 1;
        for (const proj of createdProjects) {
            const isProjectActive = proj.status === 'ACTIVE';
            const projSprints = sprints.filter(s => s.projectId.toString() === proj._id.toString());

            // Generate 8 tasks per project
            for (let i = 0; i < 8; i++) {
                let sprintId = null;
                let status = 'TODO';

                if (isProjectActive) {
                    const randomSprint = projSprints[Math.floor(Math.random() * projSprints.length)];
                    sprintId = randomSprint._id;
                    if (randomSprint.status === 'completed') status = 'APPROVED';
                    else if (randomSprint.status === 'active') status = ['IN_PROGRESS', 'SUBMITTED', 'TODO'][Math.floor(Math.random() * 3)];
                } else if (proj.status === 'COMPLETED') {
                    status = 'APPROVED';
                }

                const assignedEmployee = emps[Math.floor(Math.random() * emps.length)];
                // Find team employee is in
                const empTeam = createdTeams.find(t => t.members.includes(assignedEmployee._id));

                const task = await Task.create({
                    title: `${isProjectActive ? 'Implement' : 'Review'} feature flow ${tIndex++}`,
                    description: `Detailed technical specs and UI requirements for this ticket.`,
                    status: status,
                    priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)],
                    projectId: proj._id,
                    sprintId,
                    companyId,
                    teamId: empTeam ? empTeam._id : null,
                    assignedTo: assignedEmployee._id,
                    startDate: new Date(),
                    deadline: new Date(Date.now() + (Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000),
                    estimatedHours: Math.floor(Math.random() * 16) + 4,
                    subtasks: [
                        { title: 'Write unit tests', isCompleted: status === 'APPROVED' },
                        { title: 'Code review', isCompleted: status === 'APPROVED' }
                    ]
                });
                createdTasks.push(task);
            }
        }
        console.log(`✅ ${createdTasks.length} Tasks defined and assigned.`);

        // 7. Create TimeLogs
        console.log('\n[Step 7] Employees Logging Time...');
        let timeLogsCreated = 0;
        for (const task of createdTasks.filter(t => t.status !== 'TODO' && t.status !== 'PLANNING')) {
            // 2 time logs per worked-on task
            for (let i = 0; i < 2; i++) {
                await TimeLog.create({
                    userId: task.assignedTo,
                    taskId: task._id,
                    date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
                    duration: Math.floor(Math.random() * 180) + 60, // 1-4 hours
                    description: 'Progressed on core module logic.'
                });
                timeLogsCreated++;
            }
        }
        console.log(`✅ ${timeLogsCreated} Time Logs recorded.`);

        // 8. Create Leave Requests
        console.log('\n[Step 8] Employees Requesting Leave...');
        let leaveRequestsCreated = 0;
        const hrId = hr ? hr._id : owner._id;

        for (let i = 0; i < 3; i++) {
            await LeaveRequest.create({
                userId: emps[Math.floor(Math.random() * emps.length)]._id,
                companyId,
                type: 'ANNUAL',
                startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
                status: 'APPROVED',
                reason: 'Family vacation',
                approvedBy: hrId
            });
            leaveRequestsCreated++;
        }
        await LeaveRequest.create({
            userId: emps[0]._id,
            companyId,
            type: 'SICK',
            startDate: new Date(),
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
            reason: 'Feeling unwell'
        });
        leaveRequestsCreated++;
        console.log(`✅ ${leaveRequestsCreated} Leave Requests filed & processed by HR.`);

        // 9. Generate Activity Feed & Notifications
        console.log('\n[Step 9] Simulating Platform Activities & Notifications...');
        let activitiesCreated = 0;
        for (const proj of createdProjects) {
            await ActivityLog.create({
                userId: proj.createdBy,
                actionType: 'PROJECT_CREATED',
                entityType: 'project',
                projectId: proj._id,
                companyId,
                message: `Project "${proj.name}" was launched.`
            });
            activitiesCreated++;
        }
        console.log(`✅ Generated ${activitiesCreated} Activity Logs.`);

        let notifsCreated = 0;
        for (const u of createdUsers) {
            await Notification.create({
                recipient: u._id,
                companyId,
                type: 'GENERAL',
                title: 'Welcome to TechNova',
                message: 'Your account was created via public signup workflow.',
                isRead: false
            });
            notifsCreated++;

            if (u.role === 'EMPLOYEE') {
                await Notification.create({
                    recipient: u._id,
                    companyId,
                    type: 'TASK_ASSIGNED',
                    title: 'New Task Assignment',
                    message: 'You have been assigned to multiple tasks in the current sprint.',
                    isRead: false
                });
                notifsCreated++;
            }
        }
        console.log(`✅ Pushed ${notifsCreated} Real-time Notifications to all users.`);

        console.log('\n======================================================');
        console.log('🎉 TECHNOVA SIMULATED WORKFLOW SEED COMPLETED SUCCESSFULLY 🎉');
        console.log('------------------------------------------------------');
        console.log('You can now log in using:');
        console.log('-> Admin/CEO: admin@technova.com / Admin@123');
        console.log(`-> PM: pm@technova.com / ${MOCK_PASSWORD}`);
        console.log(`-> HR: hr@technova.com / ${MOCK_PASSWORD}`);
        console.log(`-> Dev: fe1@technova.com / ${MOCK_PASSWORD}`);
        console.log('======================================================\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error executing full workflow seed:', error);
        process.exit(1);
    }
};

seedData();
