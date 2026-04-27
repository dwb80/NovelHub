import api from '@/lib/api';
import { ReadingStats, Achievement, UserLevel } from '@/types';

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  signature?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UploadAvatarResponse {
  avatarUrl: string;
}

export const ProfileService = {
  // 获取个人信息 - 使用 /readers/me
  async getProfile() {
    const response = await api.get('/readers/me');
    return response.data;
  },

  // 更新个人信息 - 使用 /readers/me
  async updateProfile(data: UpdateProfileRequest) {
    const response = await api.put('/readers/me', data);
    return response.data;
  },

  // 上传头像 - 使用 /upload/avatar
  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 修改密码 - 使用 /readers/password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.put('/readers/password', data);
  },

  // 获取阅读统计 - 使用 /readers/me/stats
  async getReadingStats(): Promise<ReadingStats> {
    const response = await api.get('/readers/me/stats');
    return response.data;
  },

  // 获取成就列表 - 使用 /readers/me/achievements (需要后端支持)
  async getAchievements(): Promise<Achievement[]> {
    const response = await api.get('/readers/me/achievements');
    return response.data;
  },

  // 获取用户等级信息 - 使用 /readers/me/level (需要后端支持)
  async getUserLevel(): Promise<UserLevel> {
    const response = await api.get('/readers/me/level');
    return response.data;
  },

  // 获取登录历史 - 使用 /readers/me/login-history (需要后端支持)
  async getLoginHistory() {
    const response = await api.get('/readers/me/login-history');
    return response.data;
  },
};
