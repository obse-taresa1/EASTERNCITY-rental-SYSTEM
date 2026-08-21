import { apiClient } from './apiClient.js';

/**
 * Community service providing wrapper functions for the backend community endpoints.
 */
export const communityService = {
  // Fetch a list of community posts with optional query parameters (filters, pagination)
  getPosts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = query ? `/api/community?${query}` : '/api/community';
    return apiClient.get(path);
  },

  // Fetch a single post with all related data (media, comments, likes, etc.)
  getPost: async (postId) => {
    return apiClient.get(`/api/community/${postId}`);
  },
  createPost: async (formData) => apiClient.post('/api/community', formData),

  // Increment view count for a post
  incrementViews: async (postId) => {
    return apiClient.post(`/api/community/${postId}/views`);
  },

  // Increment share count for a post
  incrementShares: async (postId) => {
    return apiClient.post(`/api/community/${postId}/shares`);
  },
  resolvePost: async (postId) => apiClient.post(`/api/community/${postId}/resolve`),

  // Like a post
  likePost: async (postId) => {
    return apiClient.post(`/api/community/${postId}/like`);
  },

  // Unlike (remove like) a post
  unlikePost: async (postId) => {
    return apiClient.post(`/api/community/${postId}/unlike`);
  },

  // Save a post for the current user
  savePost: async (postId) => {
    return apiClient.post(`/api/community/${postId}/save`);
  },

  // Unsave a post
  unsavePost: async (postId) => {
    return apiClient.post(`/api/community/${postId}/unsave`);
  },

  // Add a comment to a post
  addComment: async (postId, content) => {
    return apiClient.post(`/api/community/${postId}/comment`, { content });
  },

  // Fetch comments for a post (supports pagination)
  getComments: async (postId, page = 1, limit = 20) => {
    return apiClient.get(`/api/community/${postId}/comments?page=${page}&limit=${limit}`);
  },

  // Edit a comment
  editComment: async (commentId, content) => {
    return apiClient.put(`/api/community/comment/${commentId}`, { content });
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    return apiClient.delete(`/api/community/comment/${commentId}`);
  },

  // Upload media files for a post (expects FormData with files under "media")
  uploadMedia: async (postId, formData) => {
    return apiClient.post(`/api/community/${postId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
