const API_URL = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    get: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },
    post: async (endpoint, body) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },
    patch: async (endpoint, body) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        return handleResponse(res);
    },
    delete: async (endpoint) => {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    }
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Error en la petición');
    }
    return data;
};
