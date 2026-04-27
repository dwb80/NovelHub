import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'avatars');

  constructor() {
    // 确保上传目录存在
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 验证头像文件
   * @param file 上传的文件
   */
  validateAvatar(file: Express.Multer.File): void {
    // 验证文件类型
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 JPG、PNG、GIF、WebP 格式的图片');
    }

    // 验证文件大小 (最大 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('图片大小不能超过 2MB');
    }
  }

  /**
   * 生成文件路径
   * @param userId 用户ID
   * @param originalName 原始文件名
   */
  generateFilePath(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const ext = originalName.split('.').pop();
    return `${userId}_${timestamp}.${ext}`;
  }

  /**
   * 获取完整的文件URL
   * @param filename 文件名
   */
  getFileUrl(filename: string): string {
    return `/uploads/avatars/${filename}`;
  }
}
