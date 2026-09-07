import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
    // Busca em várias chaves comuns caso o nome varie
    const rawToken =
        localStorage.getItem('@FisaSaude:token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('@fisaSaude:token');

    if (rawToken) {
        // Remove aspas caso tenha sido salvo com JSON.stringify
        const cleanToken = rawToken.replace(/^"(.*)"$/, '$1').trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Sessão expirada ou não autenticada.');
            localStorage.removeItem('@FisaSaude:token');
            // Redireciona apenas se não estiver na página de login para evitar loop
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);