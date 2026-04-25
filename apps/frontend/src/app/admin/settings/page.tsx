'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  Globe, 
  Users, 
  FileImage, 
  Shield, 
  Bell,
  Mail,
  AlertTriangle
} from 'lucide-react';

interface SystemSettings {
  // 站点信息
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  siteLogo: string;
  favicon: string;
  
  // 用户设置
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  allowGuestAccess: boolean;
  defaultUserRole: string;
  
  // 内容设置
  requireReview: boolean;
  allowComments: boolean;
  requireCommentApproval: boolean;
  maxNovelsPerUser: number;
  
  // 文件上传
  maxUploadSize: number;
  allowedFileTypes: string[];
  allowedCoverTypes: string[];
  maxCoverSize: number;
  
  // 系统维护
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  // 通知设置
  enableEmailNotifications: boolean;
  adminEmail: string;
  notifyOnNewUser: boolean;
  notifyOnNewNovel: boolean;
  notifyOnReport: boolean;
}

const defaultSettings: SystemSettings = {
  siteName: 'NovelHub',
  siteDescription: '发现精彩小说，开启阅读之旅',
  siteKeywords: '小说,网络小说,AI写作,阅读',
  siteLogo: '/logo.png',
  favicon: '/favicon.ico',
  
  allowRegistration: true,
  requireEmailVerification: false,
  allowGuestAccess: true,
  defaultUserRole: 'AUTHOR',
  
  requireReview: true,
  allowComments: true,
  requireCommentApproval: false,
  maxNovelsPerUser: 10,
  
  maxUploadSize: 10,
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  allowedCoverTypes: ['jpg', 'jpeg', 'png', 'webp'],
  maxCoverSize: 5,
  
  maintenanceMode: false,
  maintenanceMessage: '系统正在维护中，请稍后再试。',
  
  enableEmailNotifications: false,
  adminEmail: 'admin@novelhub.com',
  notifyOnNewUser: true,
  notifyOnNewNovel: true,
  notifyOnReport: true,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/v1/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (err) {
      console.error('获取设置失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setMessage('设置保存成功！');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('保存失败，请重试');
      }
    } catch (err) {
      setMessage('保存失败，请检查网络连接');
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: { 
    checked: boolean; 
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-medium">{label}</div>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">加载中...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: '站点信息', icon: Globe },
    { id: 'users', label: '用户设置', icon: Users },
    { id: 'content', label: '内容设置', icon: FileImage },
    { id: 'maintenance', label: '系统维护', icon: AlertTriangle },
    { id: 'notifications', label: '通知设置', icon: Bell },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="flex gap-6">
        {/* 左侧标签栏 */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 bg-card rounded-lg border p-6">
          {/* 站点信息 */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5" />
                站点信息
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">站点名称</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">站点描述</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">站点关键词</label>
                  <input
                    type="text"
                    value={settings.siteKeywords}
                    onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="用逗号分隔"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 用户设置 */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                用户设置
              </h2>
              <div className="divide-y">
                <ToggleSwitch
                  label="允许注册"
                  description="是否开放新用户注册"
                  checked={settings.allowRegistration}
                  onChange={(v) => setSettings({ ...settings, allowRegistration: v })}
                />
                <ToggleSwitch
                  label="邮箱验证"
                  description="注册时是否需要验证邮箱"
                  checked={settings.requireEmailVerification}
                  onChange={(v) => setSettings({ ...settings, requireEmailVerification: v })}
                />
                <ToggleSwitch
                  label="允许游客访问"
                  description="未登录用户是否可以浏览内容"
                  checked={settings.allowGuestAccess}
                  onChange={(v) => setSettings({ ...settings, allowGuestAccess: v })}
                />
                <div className="py-3">
                  <label className="block text-sm font-medium mb-1">默认用户角色</label>
                  <select
                    value={settings.defaultUserRole}
                    onChange={(e) => setSettings({ ...settings, defaultUserRole: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  >
                    <option value="AUTHOR">作者</option>
                    <option value="READER">读者</option>
                  </select>
                </div>
                <div className="py-3">
                  <label className="block text-sm font-medium mb-1">用户最大小说数</label>
                  <input
                    type="number"
                    value={settings.maxNovelsPerUser}
                    onChange={(e) => setSettings({ ...settings, maxNovelsPerUser: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 内容设置 */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                内容设置
              </h2>
              <div className="divide-y">
                <ToggleSwitch
                  label="需要审核"
                  description="发布的小说是否需要审核"
                  checked={settings.requireReview}
                  onChange={(v) => setSettings({ ...settings, requireReview: v })}
                />
                <ToggleSwitch
                  label="允许评论"
                  description="是否开启评论功能"
                  checked={settings.allowComments}
                  onChange={(v) => setSettings({ ...settings, allowComments: v })}
                />
                <ToggleSwitch
                  label="评论需要审核"
                  description="评论是否需要审核后才显示"
                  checked={settings.requireCommentApproval}
                  onChange={(v) => setSettings({ ...settings, requireCommentApproval: v })}
                />
                <div className="py-3">
                  <label className="block text-sm font-medium mb-1">最大上传大小 (MB)</label>
                  <input
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <div className="py-3">
                  <label className="block text-sm font-medium mb-1">封面最大大小 (MB)</label>
                  <input
                    type="number"
                    value={settings.maxCoverSize}
                    onChange={(e) => setSettings({ ...settings, maxCoverSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 系统维护 */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                系统维护
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">警告</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  开启维护模式后，普通用户将无法访问网站，只有管理员可以登录。
                </p>
              </div>
              <div className="divide-y">
                <ToggleSwitch
                  label="维护模式"
                  description="开启后网站进入维护状态"
                  checked={settings.maintenanceMode}
                  onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                />
                <div className="py-3">
                  <label className="block text-sm font-medium mb-1">维护提示信息</label>
                  <textarea
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 通知设置 */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知设置
              </h2>
              <div className="divide-y">
                <ToggleSwitch
                  label="启用邮件通知"
                  description="是否发送邮件通知"
                  checked={settings.enableEmailNotifications}
                  onChange={(v) => setSettings({ ...settings, enableEmailNotifications: v })}
                />
                <div className="py-3">
                  <label className="block text-sm font-medium mb-1">管理员邮箱</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>
                <ToggleSwitch
                  label="新用户通知"
                  description="有新用户注册时发送通知"
                  checked={settings.notifyOnNewUser}
                  onChange={(v) => setSettings({ ...settings, notifyOnNewUser: v })}
                />
                <ToggleSwitch
                  label="新小说通知"
                  description="有新小说发布时发送通知"
                  checked={settings.notifyOnNewNovel}
                  onChange={(v) => setSettings({ ...settings, notifyOnNewNovel: v })}
                />
                <ToggleSwitch
                  label="举报通知"
                  description="有用户举报时发送通知"
                  checked={settings.notifyOnReport}
                  onChange={(v) => setSettings({ ...settings, notifyOnReport: v })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
