// utils/userIdUtils.ts
// 生成UUID并存储到localStorage
export const getUserId = (): string => {
  const userIdKey = 'x-user-id';
  let userId = localStorage.getItem(userIdKey);

  if (!userId) {
    // 生成一个新的UUID
    userId = generateUUID();
    localStorage.setItem(userIdKey, userId);
  }

  return userId;
};

// 生成UUID的函数
const generateUUID = (): string => {
  // 使用crypto API生成更安全的UUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 回退方案：手动生成UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};