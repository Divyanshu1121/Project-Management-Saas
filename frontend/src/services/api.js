import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const sprintApi = {
    create: (data) => api.post('/sprints', data),
    getAll: (projectId) => api.get(`/sprints/project/${projectId}`),
    getActive: (projectId) => api.get(`/sprints/project/${projectId}/active`),
    start: (id) => api.patch(`/sprints/${id}/start`),
    complete: (id) => api.patch(`/sprints/${id}/complete`),
    assignTask: (taskId, sprintId) => api.patch(`/sprints/tasks/${taskId}/assign`, { sprintId }),
    removeTask: (taskId) => api.patch(`/sprints/tasks/${taskId}/remove`)
};

export const taskDependencyApi = {
    get: (taskId) => api.get(`/manager/tasks/${taskId}/dependencies`),
    add: (taskId, dependencyId) => api.post(`/manager/tasks/${taskId}/dependencies`, { dependencyId }),
    remove: (taskId, dependencyId) => api.delete(`/manager/tasks/${taskId}/dependencies/${dependencyId}`)
};

export default api;
