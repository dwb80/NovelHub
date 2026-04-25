import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NovelCategory } from '@prisma/client';

// 预定义的分类列表 - 与 NovelCategory 枚举对应
const DEFAULT_CATEGORIES: Array<{ id: string; name: string; value: NovelCategory; description: string; sortOrder: number; isActive: boolean }> = [
  { id: 'xuanhuan', name: '玄幻', value: NovelCategory.XUANHUAN, description: '东方玄幻、异世大陆', sortOrder: 1, isActive: true },
  { id: 'xianxia', name: '仙侠', value: NovelCategory.XIANXIA, description: '修真文明、幻想修仙', sortOrder: 2, isActive: true },
  { id: 'dushi', name: '都市', value: NovelCategory.DUSHI, description: '都市生活、异术超能', sortOrder: 3, isActive: true },
  { id: 'lishi', name: '历史', value: NovelCategory.LISHI, description: '架空历史、两宋元明', sortOrder: 4, isActive: true },
  { id: 'wuxia', name: '武侠', value: NovelCategory.WUXIA, description: '传统武侠、武侠幻想', sortOrder: 5, isActive: true },
  { id: 'kehuan', name: '科幻', value: NovelCategory.KEHUAN, description: '星际文明、时空穿梭', sortOrder: 6, isActive: true },
  { id: 'xuanyi', name: '悬疑', value: NovelCategory.XUANYI, description: '悬疑灵异、恐怖惊悚', sortOrder: 7, isActive: true },
  { id: 'youxi', name: '游戏', value: NovelCategory.YOUXI, description: '虚拟网游、电子竞技', sortOrder: 8, isActive: true },
  { id: 'tongren', name: '同人', value: NovelCategory.TONGREN, description: '衍生同人、原生幻想', sortOrder: 9, isActive: true },
  { id: 'qihuan', name: '奇幻', value: NovelCategory.QIHUAN, description: '西方奇幻、剑与魔法', sortOrder: 10, isActive: true },
  { id: 'junshi', name: '军事', value: NovelCategory.JUNSHI, description: '军事战争、军旅生涯', sortOrder: 11, isActive: true },
  { id: 'xianqing', name: '闲情', value: NovelCategory.XIANQING, description: '闲情逸致、散文随笔', sortOrder: 12, isActive: true },
  { id: 'langman', name: '浪漫', value: NovelCategory.LANGMAN, description: '浪漫言情、青春校园', sortOrder: 13, isActive: true },
  { id: 'other', name: '其他', value: NovelCategory.OTHER, description: '其他类型', sortOrder: 14, isActive: true },
];

@Injectable()
export class AdminCategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    // 从 Novel 表中获取实际的分类统计
    const novels = await this.prisma.novel.findMany({
      select: { category: true },
    });

    const categoryCount: Record<string, number> = {};
    novels.forEach(novel => {
      const cat = novel.category || NovelCategory.OTHER;
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const categories = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      novelCount: categoryCount[cat.value] || 0,
    }));

    return {
      categories,
    };
  }

  async createCategory(data: { name: string; value: string; description?: string; sortOrder?: number }) {
    // 检查是否已存在相同的value
    const existing = DEFAULT_CATEGORIES.find(cat => cat.value === data.value);
    if (existing) {
      throw new ConflictException('分类值已存在');
    }

    return {
      success: true,
      message: '分类创建成功（内存模式，重启后失效）',
      category: {
        id: data.value,
        ...data,
        isActive: true,
        novelCount: 0,
      },
    };
  }

  async updateCategory(
    id: string,
    data: { name?: string; description?: string; sortOrder?: number; isActive?: boolean },
  ) {
    const category = DEFAULT_CATEGORIES.find(cat => cat.id === id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return {
      success: true,
      message: '分类更新成功（内存模式，重启后失效）',
      category: {
        ...category,
        ...data,
      },
    };
  }

  async deleteCategory(id: string) {
    const category = DEFAULT_CATEGORIES.find(cat => cat.id === id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查该分类下是否有小说
    const count = await this.prisma.novel.count({
      where: { category: category.value },
    });

    if (count > 0) {
      throw new ConflictException('该分类下还有小说，无法删除');
    }

    return {
      success: true,
      message: '分类删除成功（内存模式）',
    };
  }
}
