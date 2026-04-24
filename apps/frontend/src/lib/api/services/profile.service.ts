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
  // 获取个人信息
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  // 更新个人信息
  async updateProfile(data: UpdateProfileRequest) {
    const response = await api.put('/profile', data);
    return response.data;
  },

  // 上传头像
  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 修改密码
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await api.put('/profile/password', data);
  },

  // 获取阅读统计
  async getReadingStats(): Promise<ReadingStats> {
    const response = await api.get('/profile/reading-stats');
    return response.data;
  },

  // 获取成就列表
  async getAchievements(): Promise<Achievement[]> {
    const response = await api.get('/profile/achievements');
    return response.data;
  },

  // 获取用户等级信息
  async getUserLevel(): Promise<UserLevel> {
    const response = await api.get('/profile/level');
    return response.data;
  },

  // 获取登录历史
  async getLoginHistory() {
    const response = await api.get('/profile/login-history');
    return response.data;
  },
};
