import { api } from './api.js';

export const auth = {
    login: async (email, password) => {
        const data = await api.post('/auth/login', { email, password });
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data._id,
                name: data.name,
                email: data.email,
                role: data.role || 'user' // Assuming backend returns role, if not default to user
            }));
        }
        return data;
    },
    register: async (name, email, password, role, store) => {
        return await api.post('/auth/register', { name, email, password, role, store });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    },
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
    checkAuth: () => {
        if (!localStorage.getItem('token')) {
            window.location.href = '/index.html';
        }
    }
};
