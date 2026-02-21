// utils/fetchInterceptor.ts
import { getUserId } from './userIdUtils';

// 保存原始的fetch方法
const originalFetch = window.fetch;

// 定义包装后的fetch函数
const interceptedFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // 获取用户ID
  const userId = getUserId();

  // 创建新的init对象以避免修改原始对象
  const modifiedInit = { ...init };

  // 添加x-user-id到请求头
  if (modifiedInit.headers) {
    // 如果headers是一个Headers对象，则使用append方法
    if (modifiedInit.headers instanceof Headers) {
      modifiedInit.headers.append('x-user-id', userId);
    } else if (Array.isArray(modifiedInit.headers)) {
      // 如果headers是数组形式
      modifiedInit.headers = [...modifiedInit.headers, ['x-user-id', userId]];
    } else {
      // 如果headers是普通对象
      modifiedInit.headers = {
        ...modifiedInit.headers,
        'x-user-id': userId
      };
    }
  } else {
    // 如果没有headers，创建一个新的对象
    modifiedInit.headers = {
      'x-user-id': userId
    };
  }

  // 调用原始的fetch方法
  return originalFetch(input, modifiedInit);
};

// 替换全局fetch方法
window.fetch = interceptedFetch;

// 导出取消拦截的方法（如果需要）
export const uninstallFetchInterceptor = () => {
  window.fetch = originalFetch;
};

// 导出拦截器状态（如果需要）
export const isInterceptorInstalled = () => {
  return window.fetch === interceptedFetch;
};