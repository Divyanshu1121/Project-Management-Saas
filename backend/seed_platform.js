const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'c:/Users/Hp/Desktop/Internship/Project Management/backend/.env' });

// Models
const Company = require('c:/Users/Hp/Desktop/Internship/Project Management/backend/models/Company');
const User = require('c:/Users/Hp/Desktop/Internship/Project Management/backend/models/User');
const Team = require('c:/Users/Hp/Desktop/Internship/Project Management/backend/models/Team');
const Project = require('c:/Users/Hp/Desktop/Internship/Project Management/backend/models/Project');
const Task = require('c:/Users/Hp/Desktop/Internship/Project Management/backend/models/Task');
const Sprint = require('c:/Users/Hp/Desktop/Internship/Project Management/backend/models/Sprint');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data (OPTIONAL - but helpful for clean state)
        // await Company.deleteMany({});
        // await User.deleteMany({ role: { $ne: 'SUPER_ADMIN' } });
        // await Team.deleteMany({});
        // await Project.deleteMany({});
        // await Task.deleteMany({});
        // await Sprint.deleteMany({});

        // 1. Create Company
        let company = await Company.findOne({ name: 'Innovatech Corp' });
        if (!company) {
            company = await Company.create({
                name: 'Innovatech Corp',
                email: 'contact@innovatech.com',
                subscriptionPlan: 'PREMIUM',
                isActive: true
            });
            console.log('Created Company:', company.name);
        }

        // 2. Create Project Manager
        let pm = await User.findOne({ email: 'pm@innovatech.com' });
        if (!pm) {
            pm = await User.create({
                name: 'Mark Manager',
                email: 'pm@innovatech.com',
                password: 'password123',
                role: 'PROJECT_MANAGER',
                companyId: company._id
            });
            console.log('Created PM:', pm.email);
        }

        // 3. Create Employees
        const employeeData = [
            { name: 'Alice Developer', email: 'alice@innovatech.com', role: 'EMPLOYEE', empId: 'EMP001' },
            { name: 'Bob Designer', email: 'bob@innovatech.com', role: 'EMPLOYEE', empId: 'EMP002' },
            { name: 'Charlie QA', email: 'charlie@innovatech.com', role: 'EMPLOYEE', empId: 'EMP003' }
        ];

        const employees = [];
        for (const data of employeeData) {
            let emp = await User.findOne({ email: data.email });
            if (!emp) {
                emp = await User.create({
                    ...data,
                    password: 'password123',
                    companyId: company._id
                });
                console.log('Created Employee:', emp.email);
            }
            employees.push(emp);
        }

        // 4. Create Team
        let team = await Team.findOne({ name: 'Frontend Squad', companyId: company._id });
        if (!team) {
            team = await Team.create({
                name: 'Frontend Squad',
                description: 'Core frontend team using React',
                companyId: company._id,
                managerId: pm._id,
                members: employees.map(e => e._id)
            });
            console.log('Created Team:', team.name);

            // Assign team to employees
            for (const emp of employees) {
                emp.teamId = team._id;
                await emp.save();
            }
        }

        // 5. Create Project
        let project = await Project.findOne({ name: 'Project Phoenix', companyId: company._id });
        if (!project) {
            project = await Project.create({
                name: 'Project Phoenix',
                description: 'A revolutionary new SaaS platform',
                companyId: company._id,
                createdBy: pm._id,
                status: 'ACTIVE',
                startDate: new Date(),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                teamAssigned: [team._id]
            });
            console.log('Created Project:', project.name);
        }

        // 6. Create Tasks
        const taskData = [
            { title: 'Design Landing Page', status: 'APPROVED', priority: 'HIGH', assignedTo: employees[1]._id },
            { title: 'Setup Authentication', status: 'IN_PROGRESS', priority: 'URGENT', assignedTo: employees[0]._id },
            { title: 'API Integration', status: 'TODO', priority: 'MEDIUM', assignedTo: employees[0]._id },
            { title: 'Unit Testing', status: 'TODO', priority: 'LOW', assignedTo: employees[2]._id }
        ];

        const tasks = [];
        for (const data of taskData) {
            let t = await Task.findOne({ title: data.title, projectId: project._id });
            if (!t) {
                t = await Task.create({
                    ...data,
                    projectId: project._id,
                    companyId: company._id,
                    teamId: team._id,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
                console.log('Created Task:', t.title);
            }
            tasks.push(t);
        }

        // Update project progress
        const approvedCount = tasks.filter(t => t.status === 'APPROVED').length;
        project.progress = Math.round((approvedCount / tasks.length) * 100);
        await project.save();

        // 7. Create Sprint
        let sprint = await Sprint.findOne({ name: 'Sprint 1 - Foundation', projectId: project._id });
        if (!sprint) {
            sprint = await Sprint.create({
                name: 'Sprint 1 - Foundation',
                goal: 'Establish the core architecture and basic UI',
                projectId: project._id,
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            });
            console.log('Created Sprint:', sprint.name);

            // Assign first 3 tasks to sprint
            for (let i = 0; i < 3; i++) {
                tasks[i].sprintId = sprint._id;
                await tasks[i].save();
            }
            console.log('Assigned tasks to sprint');
        }

        console.log('\n--- Seeding Complete ---');
        console.log('Login credentials:');
        console.log('Email: pm@innovatech.com | Password: password123 (Project Manager)');
        console.log('Email: alice@innovatech.com | Password: password123 (Employee)');
        console.log('---');

    } catch (err) {
        console.error('Seeding Error:', err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

seed();
