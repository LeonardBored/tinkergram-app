import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const getPosts = () => api.get('/posts');

export const getPost = (id) => api.get(`/posts/${id}`);

export const createPost = (postData) => api.post('/posts', postData);

export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);

export const deletePost = (id) => api.delete(`/posts/${id}`);

export const searchPosts = (query) => api.get(`/posts/search?q=${encodeURIComponent(query)}`);

export const checkHealth = () => api.get('/health');

export default api;
