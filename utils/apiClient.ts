// utils/apiClient.ts
import { getUserId } from './userIdUtils';

// 封装fetch请求，自动添加用户ID到请求头
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // 获取用户ID
  const userId = getUserId();

  // 设置请求头
  const headers = {
    ...options.headers,
    'x-user-id': userId,
  };

  // 发起请求
  return fetch(url, {
    ...options,
    headers,
  });
};

// 如果需要其他HTTP方法的便捷函数，可以在这里添加
export const get = (url: string, options: RequestInit = {}) => {
  return apiRequest(url, { ...options, method: 'GET' });
};

export const post = (url: string, options: RequestInit = {}) => {
  return apiRequest(url, { ...options, method: 'POST' });
};

export const put = (url: string, options: RequestInit = {}) => {
  return apiRequest(url, { ...options, method: 'PUT' });
};

export const del = (url: string, options: RequestInit = {}) => {
  return apiRequest(url, { ...options, method: 'DELETE' });
};