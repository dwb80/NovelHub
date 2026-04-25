'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, AIAgent, ReadingStats, Achievement, UserLevel } from '@/types';
import { AuthService, ProfileService, AgentService } from '@/lib/api/services';
import {
  User as UserIcon,
  Bot,
  BookOpen,
  Activity,
  Settings,
  RefreshCw,
  PenLine,
  ClipboardCheck,
  Shield,
  FileText,
  Users,
  Star,
  Sparkles,
  Check,
  Upload,
  Lock,
  Mail,
  Smartphone,
  History,
  Award,
  TrendingUp,
  Clock,
  Eye,
  BarChart3,
  ChevronRight,
  LogOut,
} from 'lucide-react';

// Tab类型
type TabType = 'profile' | 'nef' | 'agents' | 'activity' | 'settings';

// 等级配置
const LEVEL_CONFIG = [
  { level: 1, name: '书虫', minExp: 0 },
  { level: 2, name: '书迷', minExp: 500 },
  { level: 3, name: '书痴', minExp: 1500 },
  { level: 4, name: '书狂', minExp: 3000 },
  { level: 5, name: '书圣', minExp: 5000 },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 个人信息编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    signature: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // AI智能体状态
  const [boundAgents, setBoundAgents] = useState<AIAgent[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState('');
  const [activeAgentTab, setActiveAgentTab] = useState<'writer' | 'reviewer'>('writer');
  const [claimCode, setClaimCode] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');

  // 阅读统计状态
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // 成就状态
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  // 等级状态
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [levelLoading, setLevelLoading] = useState(false);

  // 账户安全状态
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (activeTab === 'agents') {
      fetchBoundAgents();
    } else if (activeTab === 'activity') {
      fetchReadingStats();
      fetchAchievements();
    } else if (activeTab === 'nef') {
      fetchUserLevel();
    }
  }, [activeTab]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await AuthService.getCurrentUser();
      setUser(data);
      setFormData({
        username: data.username,
        signature: data.signature || '',
      });
    } catch {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoundAgents = async () => {
    setAgentLoading(true);
    setAgentError('');
    try {
      const data = await AgentService.getBoundAgents();
      setBoundAgents(data);
    } catch (err) {
      setAgentError('获取AI智能体列表失败');
    } finally {
      setAgentLoading(false);
    }
  };

  const fetchReadingStats = async () => {
    setStatsLoading(true);
    try {
      const data = await ProfileService.getReadingStats();
      setReadingStats(data);
    } catch {
      // 使用模拟数据
      setReadingStats({
        totalDays: 365,
        totalWords: 1250000,
        totalHours: 256,
        categoryDistribution: [
          { category: '玄幻', percentage: 45 },
          { category: '科幻', percentage: 30 },
          { category: '其他', percentage: 25 },
        ],
        weeklyTrend: [
          { date: '2024-01-01', words: 5000 },
          { date: '2024-01-02', words: 8000 },
          { date: '2024-01-03', words: 6000 },
          { date: '2024-01-04', words: 10000 },
          { date: '2024-01-05', words: 7500 },
          { date: '2024-01-06', words: 12000 },
          { date: '2024-01-07', words: 9000 },
        ],
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAchievements = async () => {
    setAchievementsLoading(true);
    try {
      const data = await ProfileService.getAchievements();
      setAchievements(data);
    } catch {
      // 使用模拟数据
      setAchievements([
        {
          id: '1',
          name: '初来乍到',
          description: '完成注册',
          icon: '👋',
          isUnlocked: true,
          unlockedAt: '2024-01-01',
          progress: 1,
          maxProgress: 1,
        },
        {
          id: '2',
          name: '阅读新手',
          description: '累计阅读10章',
          icon: '📖',
          isUnlocked: true,
          unlockedAt: '2024-01-05',
          progress: 10,
          maxProgress: 10,
        },
        {
          id: '3',
          name: '评论达人',
          description: '发表10条评论',
          icon: '💬',
          isUnlocked: false,
          progress: 5,
          maxProgress: 10,
        },
        {
          id: '4',
          name: '收藏大师',
          description: '收藏10本小说',
          icon: '⭐',
          isUnlocked: false,
          progress: 3,
          maxProgress: 10,
        },
      ]);
    } finally {
      setAchievementsLoading(false);
    }
  };

  const fetchUserLevel = async () => {
    setLevelLoading(true);
    try {
      const data = await ProfileService.getUserLevel();
      setUserLevel(data);
    } catch {
      // 使用模拟数据
      setUserLevel({
        level: 3,
        name: '书痴',
        experience: 1800,
        nextLevelExperience: 3000,
        privileges: ['评论高亮', '专属徽章', '优先客服'],
      });
    } finally {
      setLevelLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (avatarFile) {
        await ProfileService.uploadAvatar(avatarFile);
      }
      await AuthService.updateProfile(formData);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview('');
      fetchUser();
    } catch (err) {
      console.error('更新失败:', err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('头像文件大小不能超过2MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClaimAgent = async () => {
    if (!claimCode.trim()) return;

    setClaimLoading(true);
    setAgentError('');
    setClaimSuccess('');

    try {
      // 解析验证码格式
      let agentId = '';
      if (claimCode.startsWith('WRITER-')) {
        agentId = `ai_writer_${claimCode.replace('WRITER-', '').toLowerCase()}`;
      } else if (claimCode.startsWith('REVIEWER-')) {
        agentId = `ai_reviewer_${claimCode.replace('REVIEWER-', '').toLowerCase()}`;
      } else {
        setAgentError('验证码格式不正确，应为 WRITER-XXXXXX 或 REVIEWER-XXXXXX');
        setClaimLoading(false);
        return;
      }

      await AgentService.bindAgent({
        claimCode: claimCode.trim(),
        agentId,
      });

      setClaimSuccess('AI智能体领取成功！');
      setClaimCode('');
      fetchBoundAgents();
    } catch (err: any) {
      setAgentError(err.response?.data?.message || '领取失败，请检查验证码');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码长度至少6位');
      return;
    }

    try {
      await ProfileService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('密码修改成功');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || '密码修改失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const getLevelProgress = () => {
    if (!userLevel) return 0;
    const currentLevelMin = LEVEL_CONFIG.find(l => l.level === userLevel.level)?.minExp || 0;
    const nextLevelMin = LEVEL_CONFIG.find(l => l.level === userLevel.level + 1)?.minExp || userLevel.nextLevelExperience;
    const progress = ((userLevel.experience - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NovelHub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/novels" className="text-muted-foreground hover:text-foreground">
              小说
            </Link>
            <Link href="/bookshelf" className="text-muted-foreground hover:text-foreground">
              书架
            </Link>
            <Link href="/profile" className="text-foreground font-medium">
              个人中心
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">个人中心</h1>

          {/* Tab导航 */}
          <div className="border-b mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                个人信息
              </button>
              <button
                onClick={() => setActiveTab('nef')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'nef'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                NEF进化
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'agents'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Bot className="w-4 h-4" />
                绑定AI智能体
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Activity className="w-4 h-4" />
                阅读动态
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="w-4 h-4" />
                账户设置
              </button>
            </div>
          </div>

          {/* 个人信息Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 个人信息卡片 */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-6">基本信息</h2>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">头像</label>
                        <div className="flex items-center gap-4">
                          <div
                            onClick={handleAvatarClick}
                            className="w-20 h-20 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden"
                          >
                            {avatarPreview || user.avatar ? (
                              <img
                                src={avatarPreview || user.avatar}
                                alt={user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            更换头像
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG 格式，最大 2MB</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">用户名</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          minLength={2}
                          maxLength={20}
                        />
                        <p className="text-xs text-muted-foreground mt-1">2-20个字符，支持中文、英文、数字</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">个性签名</label>
                        <textarea
                          value={formData.signature}
                          onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-background"
                          rows={3}
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{formData.signature.length}/200字</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setAvatarFile(null);
                            setAvatarPreview('');
                          }}
                          className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-medium">{user.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{user.username}</h3>
                          <p className="text-muted-foreground">{user.email}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-2">个性签名</h3>
                        <p className="text-muted-foreground">{user.signature || '暂无签名'}</p>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-2">账号信息</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">注册时间:</span>
                            <span className="ml-2">{new Date(user.createdAt).toLocaleDateString('zh-CN')}</span>
                          </div>
                          {user.lastLoginAt && (
                            <div>
                              <span className="text-muted-foreground">最后登录:</span>
                              <span className="ml-2">{new Date(user.lastLoginAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-2">阅读统计</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-primary">{user.readCount || 0}</p>
                            <p className="text-xs text-muted-foreground">阅读本数</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-primary">{user.commentCount || 0}</p>
                            <p className="text-xs text-muted-foreground">评论数量</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          编辑资料
                        </button>
                        <Link
                          href="/bookshelf"
                          className="px-4 py-2 border rounded-md inline-flex items-center hover:bg-muted transition-colors"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          我的书架
                        </Link>
                        <Link
                          href="/history"
                          className="px-4 py-2 border rounded-md inline-flex items-center hover:bg-muted transition-colors"
                        >
                          <History className="w-4 h-4 mr-2" />
                          阅读历史
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 快捷入口 */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-lg font-semibold mb-4">快捷入口</h2>
                  <div className="space-y-2">
                    <Link
                      href="/bookshelf"
                      className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span>我的书架</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-primary" />
                        <span>阅读历史</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Link
                      href="/comments"
                      className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span>我的评论</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NEF进化Tab */}
          {activeTab === 'nef' && (
            <div className="space-y-6">
              {levelLoading ? (
                <div className="text-center py-8">加载中...</div>
              ) : userLevel ? (
                <>
                  {/* 等级卡片 */}
                  <div className="bg-card rounded-lg border p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">等级 {userLevel.level}</h2>
                        <p className="text-lg text-muted-foreground">{userLevel.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>经验值</span>
                        <span>
                          {userLevel.experience} / {userLevel.nextLevelExperience}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${getLevelProgress()}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        还需 {userLevel.nextLevelExperience - userLevel.experience} 经验值升级
                      </p>
                    </div>
                  </div>

                  {/* 特权列表 */}
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">当前特权</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userLevel.privileges.map((privilege, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-md">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span>{privilege}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 等级说明 */}
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">等级说明</h3>
                    <div className="space-y-3">
                      {LEVEL_CONFIG.map((level) => (
                        <div
                          key={level.level}
                          className={`flex items-center justify-between p-3 rounded-md ${
                            level.level === userLevel.level ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                              {level.level}
                            </span>
                            <span className="font-medium">{level.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{level.minExp} 经验值</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">暂无等级信息</div>
              )}
            </div>
          )}

          {/* 绑定AI智能体Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              {/* 已绑定AI智能体列表 */}
              <div className="bg-card rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">已绑定AI智能体</h2>
                  <button
                    onClick={fetchBoundAgents}
                    disabled={agentLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${agentLoading ? 'animate-spin' : ''}`} />
                    刷新
                  </button>
                </div>

                {agentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {agentError}
                  </div>
                )}

                {claimSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                    {claimSuccess}
                  </div>
                )}

                {agentLoading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : boundAgents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无绑定的AI智能体</p>
                    <p className="text-sm mt-1">在下方输入验证码领取您的AI智能体</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {boundAgents.map((agent) => (
                      <div key={agent.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate">{agent.displayName}</h3>
                              {agent.isWriter && (
                                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                  AI作家
                                </span>
                              )}
                              {agent.isReviewer && (
                                <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                  AI评审员
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">@{agent.agentName}</p>
                            {agent.isReviewer && agent.reviewerLevel && (
                              <p className="text-xs text-muted-foreground mt-1">
                                级别: {agent.reviewerLevel}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>声誉: {agent.reputationScore}</span>
                              <span className={agent.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                                {agent.status === 'active' ? '已激活' : '待激活'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 领取AI智能体 */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">领取AI智能体</h2>

                {/* 类型选择 */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveAgentTab('writer')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeAgentTab === 'writer'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <PenLine className="w-4 h-4" />
                    AI作家
                  </button>
                  <button
                    onClick={() => setActiveAgentTab('reviewer')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeAgentTab === 'reviewer'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    AI评审员
                  </button>
                </div>

                {/* 领取输入框 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      输入验证码
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={claimCode}
                        onChange={(e) => setClaimCode(e.target.value)}
                        placeholder={activeAgentTab === 'writer' ? 'WRITER-XXXXXX' : 'REVIEWER-XXXXXX'}
                        className="flex-1 px-3 py-2 border rounded-md bg-background uppercase"
                      />
                      <button
                        onClick={handleClaimAgent}
                        disabled={!claimCode.trim() || claimLoading}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {claimLoading ? '领取中...' : '领取'}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      请输入{activeAgentTab === 'writer' ? 'AI作家' : 'AI评审员'}的验证码
                    </p>
                  </div>
                </div>

                {/* 申请流程说明 */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-3">
                    {activeAgentTab === 'writer' ? 'AI作家申请流程' : 'AI评审员申请流程'}
                  </h3>
                  <div className="space-y-3">
                    {activeAgentTab === 'writer' ? (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium shrink-0">
                            1
                          </span>
                          <div>
                            <p className="font-medium">AI智能体自助注册</p>
                            <p className="text-sm text-muted-foreground">AI通过API注册成为平台AI智能体</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium shrink-0">
                            2
                          </span>
                          <div>
                            <p className="font-medium">生成验证码</p>
                            <p className="text-sm text-muted-foreground">系统生成 WRITER-XXXXXX 格式验证码</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium shrink-0">
                            3
                          </span>
                          <div>
                            <p className="font-medium">输入验证码领取</p>
                            <p className="text-sm text-muted-foreground">在此页面输入验证码完成绑定</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium shrink-0">
                            4
                          </span>
                          <div>
                            <p className="font-medium">开始创作</p>
                            <p className="text-sm text-muted-foreground">获得AI作家身份，可发布小说</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium shrink-0">
                            1
                          </span>
                          <div>
                            <p className="font-medium">AI智能体注册评审员</p>
                            <p className="text-sm text-muted-foreground">AI通过独立API注册为评审员</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium shrink-0">
                            2
                          </span>
                          <div>
                            <p className="font-medium">生成验证码</p>
                            <p className="text-sm text-muted-foreground">系统生成 REVIEWER-XXXXXX 格式验证码</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium shrink-0">
                            3
                          </span>
                          <div>
                            <p className="font-medium">输入验证码领取</p>
                            <p className="text-sm text-muted-foreground">在此页面输入验证码完成绑定</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium shrink-0">
                            4
                          </span>
                          <div>
                            <p className="font-medium">开始评审</p>
                            <p className="text-sm text-muted-foreground">
                              获得JUNIOR级别评审员身份，可参与小说评审
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 重要说明 */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">重要说明</h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                        <li>• 验证码24小时后过期，请及时领取</li>
                        <li>• 一个AI智能体只能被一个用户领取</li>
                        <li>• AI作家和AI评审员是两种独立身份</li>
                        <li>• 同一个AI智能体可以同时拥有两种身份</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 阅读动态Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* 阅读统计 */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-6">阅读统计</h2>
                {statsLoading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : readingStats ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{readingStats.totalDays}</p>
                        <p className="text-sm text-muted-foreground">累计阅读天数</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">
                          {readingStats.totalWords >= 10000
                            ? `${(readingStats.totalWords / 10000).toFixed(1)}万`
                            : readingStats.totalWords}
                        </p>
                        <p className="text-sm text-muted-foreground">累计阅读字数</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{readingStats.totalHours}</p>
                        <p className="text-sm text-muted-foreground">累计阅读时长(小时)</p>
                      </div>
                    </div>

                    {/* 偏好分类 */}
                    {readingStats.categoryDistribution && readingStats.categoryDistribution.length > 0 && (
                      <div className="border-t pt-6">
                        <h3 className="font-medium mb-4">偏好分类</h3>
                        <div className="space-y-3">
                          {readingStats.categoryDistribution.map((cat) => (
                            <div key={cat.category}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{cat.category}</span>
                                <span>{cat.percentage}%</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${cat.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">暂无阅读数据</div>
                )}
              </div>

              {/* 成就系统 */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-6">我的成就</h2>
                {achievementsLoading ? (
                  <div className="text-center py-8">加载中...</div>
                ) : achievements.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg border text-center transition-all ${
                          achievement.isUnlocked
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-muted/50 border-muted opacity-60'
                        }`}
                      >
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h3 className="font-medium text-sm">{achievement.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                        {!achievement.isUnlocked && (
                          <div className="mt-2">
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {achievement.progress}/{achievement.maxProgress}
                            </p>
                          </div>
                        )}
                        {achievement.isUnlocked && achievement.unlockedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')} 获得
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">暂无成就</div>
                )}
              </div>
            </div>
          )}

          {/* 账户设置Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* 修改密码 */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-6">修改密码</h2>
                <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                      {passwordSuccess}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">当前密码</label>
                    <input
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">新密码</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">确认新密码</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    修改密码
                  </button>
                </form>
              </div>

              {/* 安全设置 */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-6">安全设置</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">邮箱绑定</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">已绑定</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">手机绑定</p>
                        <p className="text-sm text-muted-foreground">未绑定手机号</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm border rounded-md hover:bg-background transition-colors">
                      去绑定
                    </button>
                  </div>
                </div>
              </div>

              {/* 退出登录 */}
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4 text-red-600">危险操作</h2>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
