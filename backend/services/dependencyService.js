const Task = require('../models/Task');
const mongoose = require('mongoose');

// Helper to check for circular dependencies using DFS
const checkCircularDependency = async (taskId, newDependencyId) => {
    // If we're trying to make a task depend on itself
    if (taskId.toString() === newDependencyId.toString()) {
        return true; // Circular
    }

    const visited = new Set();
    const stack = [newDependencyId.toString()];

    while (stack.length > 0) {
        const currentId = stack.pop();

        if (currentId === taskId.toString()) {
            return true; // Cycle detected: the new dependency eventually relies on the current task
        }

        if (!visited.has(currentId)) {
            visited.add(currentId);
            const task = await Task.findById(currentId).select('dependencies');
            if (task && task.dependencies && task.dependencies.length > 0) {
                for (const dep of task.dependencies) {
                    stack.push(dep.toString());
                }
            }
        }
    }

    return false; // No cycle
};

const addDependency = async (taskId, dependencyId, companyId) => {
    const task = await Task.findOne({ _id: taskId, companyId });
    const dependency = await Task.findOne({ _id: dependencyId, companyId });

    if (!task) throw new Error('Task not found');
    if (!dependency) throw new Error('Dependency task not found');

    if (task.projectId.toString() !== dependency.projectId.toString()) {
        throw new Error('Dependencies must belong to the same project');
    }

    if (task.dependencies.includes(dependencyId)) {
        throw new Error('Dependency already exists');
    }

    const isCircular = await checkCircularDependency(taskId, dependencyId);
    if (isCircular) {
        throw new Error('Cannot add dependency: Circular dependency detected');
    }

    task.dependencies.push(dependencyId);
    await task.save();

    return task.populate('dependencies', 'title status');
};

const removeDependency = async (taskId, dependencyId, companyId) => {
    const task = await Task.findOne({ _id: taskId, companyId });

    if (!task) throw new Error('Task not found');

    task.dependencies = task.dependencies.filter(id => id.toString() !== dependencyId.toString());
    await task.save();

    return task.populate('dependencies', 'title status');
};

const checkDependenciesCompleted = async (taskId) => {
    const task = await Task.findById(taskId).populate('dependencies', 'status');
    if (!task || !task.dependencies || task.dependencies.length === 0) {
        return true; // No dependencies, so it's "ready"
    }

    // Task is blocked if any dependency is not APPROVED
    const isBlocked = task.dependencies.some(dep => dep.status !== 'APPROVED');
    return !isBlocked;
};

const getTaskDependencies = async (taskId, companyId) => {
    const task = await Task.findOne({ _id: taskId, companyId }).populate({
        path: 'dependencies',
        select: 'title status priority deadline'
    });
    if (!task) throw new Error('Task not found');
    return task.dependencies;
};

// Find tasks that are blocked by a specific task
const getDependentTasks = async (taskId) => {
    return await Task.find({ dependencies: taskId }).select('title status');
};

module.exports = {
    addDependency,
    removeDependency,
    checkCircularDependency,
    checkDependenciesCompleted,
    getTaskDependencies,
    getDependentTasks
};
