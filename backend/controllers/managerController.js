const svc = require('../services/managerService');


const getProjects = async (req, res) => {
    try {
        const projects = await svc.getProjects(req.user.companyId);
        res.json(projects);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createProject = async (req, res) => {
    try {
        const project = await svc.createProject(req.body, req.user._id, req.user.companyId);
        res.status(201).json(project);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await svc.updateProject(req.params.id, req.user.companyId, req.body);
        res.json(project);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        await svc.deleteProject(req.params.id, req.user.companyId);
        res.json({ message: 'Project deleted' });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await svc.getTasks(req.user.companyId, req.query);
        res.json(tasks);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createTask = async (req, res) => {
    try {
        const task = await svc.createTask(req.body, req.user._id, req.user.companyId);
        res.status(201).json(task);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await svc.updateTask(req.params.id, req.user.companyId, req.body, req.user._id);
        res.json(task);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const approveTask = async (req, res) => {
    try {
        const task = await svc.approveTask(req.params.id, req.user.companyId, req.user._id);
        res.json(task);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const rejectTask = async (req, res) => {
    try {
        const { note } = req.body;
        const task = await svc.rejectTask(req.params.id, req.user.companyId, req.user._id, note);
        res.json(task);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await svc.deleteTask(req.params.id, req.user.companyId);
        res.json({ message: 'Task deleted' });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getTaskTimeLogs = async (req, res) => {
    try {
        const data = await svc.getTaskTimeLogs(req.params.id, req.user.companyId);
        res.json(data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

const getWorkload = async (req, res) => {
    try {
        const data = await svc.getWorkload(req.user.companyId);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};


const getEmployees = async (req, res) => {
    try {
        const employees = await svc.getEmployeesByTeam(req.query.teamId, req.user.companyId);
        res.json(employees);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = {
    getProjects, createProject, updateProject, deleteProject,
    getTasks, createTask, updateTask, deleteTask,
    getTaskTimeLogs, getWorkload, getEmployees,
    approveTask, rejectTask,
};
