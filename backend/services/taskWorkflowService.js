const Task = require('../models/Task');

const calculateProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.isCompleted).length;
    return Math.round((completed / subtasks.length) * 100);
};

const addStatusHistory = (task, userId, note = '') => {
    task.statusHistory.push({
        status: task.status,
        changedBy: userId,
        changedAt: new Date(),
        note
    });
};

module.exports = {
    calculateProgress,
    addStatusHistory,
};
