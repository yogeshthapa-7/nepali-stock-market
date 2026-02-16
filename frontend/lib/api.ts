'use client';

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// API Base URL - change this to your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Token management
export const tokenService = {
    getToken: (): string | undefined => {
        return Cookies.get('token');
    },

    setToken: (token: string): void => {
        Cookies.set('token', token, { expires: 7, path: '/' });
    },

    removeToken: (): void => {
        Cookies.remove('token', { path: '/' });
    },

    // Initialize token from localStorage (for migration from localStorage to cookies)
    initTokenFromLocalStorage: (): void => {
        const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (localToken) {
            Cookies.set('token', localToken, { expires: 7, path: '/' });
            localStorage.removeItem('token');
        }
    },
};

// Request interceptor - add token to requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenService.getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            tokenService.removeToken();
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Types
export interface User {
    _id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    isVerified: boolean;
    profileImage?: string;
    createdAt: string;
}

export interface Stock {
    _id: string;
    symbol: string;
    name: string;
    company: string;
    price: number;
    previousClose: number;
    change: number;
    changePercent: number;
    marketCap: string;
    volume: number;
    peRatio: number;
    eps: number;
    dividendYield: number;
    description: string;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IPO {
    _id: string;
    symbol: string;
    name: string;
    company: string;
    status: 'upcoming' | 'open' | 'closed' | 'allotted';
    issuePrice: number;
    shares: number;
    sharesAvailable: number;
    minApplication: number;
    maxApplication: number;
    openDate: string;
    closeDate: string;
    description: string;
    image?: string;
    applications: Array<{
        userId: User;
        sharesApplied: number;
        status: 'pending' | 'allotted' | 'not_allotted';
        appliedDate: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface News {
    _id: string;
    title: string;
    content: string;
    summary: string;
    category: string;
    image?: string;
    featured: boolean;
    publishedAt: string;
    relatedStocks: Stock[];
    relatedIPOs: IPO[];
    createdAt: string;
    updatedAt: string;
}

export interface Portfolio {
    _id: string;
    userId: string;
    ownedStocks: Array<{
        stockId: Stock;
        quantity: number;
        averagePrice: number;
        boughtDate: string;
    }>;
    appliedIPOs: Array<{
        ipoId: IPO;
        sharesApplied: number;
        applicationDate: string;
        status: 'pending' | 'allotted' | 'not_allotted';
    }>;
    allottedIPOs: Array<{
        ipoId: IPO;
        sharesApplied: number;
        applicationDate: string;
        status: 'allotted';
    }>;
    notAllottedIPOs: Array<{
        ipoId: IPO;
        sharesApplied: number;
        applicationDate: string;
        status: 'not_allotted';
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface Watchlist {
    _id: string;
    userId: string;
    stocks: Array<{
        stockId: Stock;
        addedAt: string;
    }>;
    ipos: Array<{
        ipoId: IPO;
        addedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

// Auth API
export const authAPI = {
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
        const response = await api.post('/auth/login', { email, password });
        tokenService.setToken(response.data.token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    signup: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
        const response = await api.post('/auth/signup', { name, email, password });
        tokenService.setToken(response.data.token);
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    getCurrentUser: async (): Promise<{ user: User }> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } finally {
            tokenService.removeToken();
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
            }
        }
    },
};

// Stocks API
export const stocksAPI = {
    getAll: async (params?: { search?: string; symbol?: string; sort?: string }): Promise<{ stocks: Stock[]; count: number }> => {
        const response = await api.get('/stocks', { params });
        return response.data;
    },

    getBySymbol: async (symbol: string): Promise<{ stock: Stock }> => {
        const response = await api.get(`/stocks/${symbol}`);
        return response.data;
    },

    create: async (stock: Partial<Stock>): Promise<{ stock: Stock; message: string }> => {
        const response = await api.post('/stocks', stock);
        return response.data;
    },

    update: async (symbol: string, stock: Partial<Stock>): Promise<{ stock: Stock; message: string }> => {
        const response = await api.put(`/stocks/${symbol}`, stock);
        return response.data;
    },

    delete: async (symbol: string): Promise<{ message: string }> => {
        const response = await api.delete(`/stocks/${symbol}`);
        return response.data;
    },
};

// Users API (Admin only)
export const usersAPI = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    create: async (user: { name: string; email: string; password: string; role?: string }): Promise<User> => {
        const response = await api.post('/users', user);
        return response.data;
    },

    update: async (id: string, user: { name?: string; email?: string; role?: string; isVerified?: boolean }): Promise<User> => {
        const response = await api.put(`/users/${id}`, user);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },
};

// IPOs API
export const iposAPI = {
    getAll: async (params?: { status?: string; search?: string }): Promise<{ ipos: IPO[]; count: number }> => {
        const response = await api.get('/ipos', { params });
        return response.data;
    },

    getBySymbol: async (symbol: string): Promise<{ ipo: IPO }> => {
        const response = await api.get(`/ipos/${symbol}`);
        return response.data;
    },

    create: async (ipo: Partial<IPO>): Promise<{ ipo: IPO; message: string }> => {
        const response = await api.post('/ipos', ipo);
        return response.data;
    },

    update: async (symbol: string, ipo: Partial<IPO>): Promise<{ ipo: IPO; message: string }> => {
        const response = await api.put(`/ipos/${symbol}`, ipo);
        return response.data;
    },

    delete: async (symbol: string): Promise<{ message: string }> => {
        const response = await api.delete(`/ipos/${symbol}`);
        return response.data;
    },

    apply: async (symbol: string, sharesApplied: number): Promise<{ ipo: IPO; message: string }> => {
        const response = await api.post(`/ipos/${symbol}/apply`, { sharesApplied });
        return response.data;
    },
};

// News API
export const newsAPI = {
    getAll: async (params?: { category?: string; featured?: boolean; limit?: number; offset?: number }): Promise<{ news: News[]; count: number; total: number }> => {
        const response = await api.get('/news', { params });
        return response.data;
    },

    getById: async (id: string): Promise<{ news: News }> => {
        const response = await api.get(`/news/${id}`);
        return response.data;
    },

    create: async (news: Partial<News>): Promise<{ news: News; message: string }> => {
        const response = await api.post('/news', news);
        return response.data;
    },

    update: async (id: string, news: Partial<News>): Promise<{ news: News; message: string }> => {
        const response = await api.put(`/news/${id}`, news);
        return response.data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    },
};

// Portfolio API
export const portfolioAPI = {
    get: async (): Promise<{ portfolio: Portfolio }> => {
        const response = await api.get('/portfolio');
        return response.data;
    },

    getAppliedIPOs: async (): Promise<{ appliedIPOs: Portfolio['appliedIPOs'] }> => {
        const response = await api.get('/portfolio/ipos/applied');
        return response.data;
    },

    getAllottedIPOs: async (): Promise<{ allottedIPOs: Portfolio['allottedIPOs'] }> => {
        const response = await api.get('/portfolio/ipos/allotted');
        return response.data;
    },

    getNotAllottedIPOs: async (): Promise<{ notAllottedIPOs: Portfolio['notAllottedIPOs'] }> => {
        const response = await api.get('/portfolio/ipos/not-allotted');
        return response.data;
    },

    addStock: async (stockId: string, quantity: number, averagePrice: number): Promise<{ portfolio: Portfolio; message: string }> => {
        const response = await api.post('/portfolio/stocks/add', { stockId, quantity, averagePrice });
        return response.data;
    },
};

// Watchlist API
export const watchlistAPI = {
    get: async (): Promise<{ watchlist: Watchlist }> => {
        const response = await api.get('/watchlist');
        return response.data;
    },

    addStock: async (stockId: string): Promise<{ watchlist: Watchlist; message: string }> => {
        const response = await api.post('/watchlist/stocks/add', { stockId });
        return response.data;
    },

    removeStock: async (stockId: string): Promise<{ watchlist: Watchlist; message: string }> => {
        const response = await api.delete(`/watchlist/stocks/${stockId}`);
        return response.data;
    },

    addIPO: async (ipoId: string): Promise<{ watchlist: Watchlist; message: string }> => {
        const response = await api.post('/watchlist/ipos/add', { ipoId });
        return response.data;
    },

    removeIPO: async (ipoId: string): Promise<{ watchlist: Watchlist; message: string }> => {
        const response = await api.delete(`/watchlist/ipos/${ipoId}`);
        return response.data;
    },
};

// Helper function to check if user is admin
export const isAdmin = (user: User | null): boolean => {
    return user?.role === 'admin';
};

// Helper function to check if user is logged in
export const isAuthenticated = (): boolean => {
    return !!tokenService.getToken();
};

export default api;
