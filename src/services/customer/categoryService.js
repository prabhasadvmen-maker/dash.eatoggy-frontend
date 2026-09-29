import axiosInstance from '../../utils/axiosConfig.js';

export const categoryService = {
  getCategories: () => axiosInstance.get('/api/categories'),
};
