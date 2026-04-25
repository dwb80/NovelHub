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
import { useAdminAuth } from '../components/AdminAuthProvider';

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
  const { token } = useAdminAuth();
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
      const response = await fetch('/api/v1/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
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
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
          checked ? 'bg-primary' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  const InputField = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    description,
  }: {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    description?: string;
  }) => (
    <div className="py-3">
      <label className="block font-medium mb-1">{label}</label>
      {description && <div className="text-sm text-muted-foreground mb-2">{description}</div>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg bg-background"
      />
    </div>
  );

  const TextAreaField = ({
    label,
    value,
    onChange,
    placeholder,
    description,
    rows = 3,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
    rows?: number;
  }) => (
    <div className="py-3">
      <label className="block font-medium mb-1">{label}</label>
      {description && <div className="text-sm text-muted-foreground mb-2">{description}</div>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border rounded-lg bg-background resize-none"
      />
    </div>
  );

  const tabs = [
    { id: 'general', label: '基本设置', icon: Globe },
    { id: 'users', label: '用户设置', icon: Users },
    { id: 'content', label: '内容设置', icon: Shield },
    { id: 'files', label: '文件设置', icon: FileImage },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'maintenance', label: '系统维护', icon: AlertTriangle },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">加载中...</span>
      </div>
    );
  }

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
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="flex gap-6">
        {/* 左侧标签页 */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-card rounded-lg border overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'hover:bg-accent border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 bg-card rounded-lg border p-6">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                基本设置
              </h2>
              <InputField
                label="站点名称"
                value={settings.siteName}
                onChange={(value) => setSettings({ ...settings, siteName: value })}
                placeholder="NovelHub"
              />
              <TextAreaField
                label="站点描述"
                value={settings.siteDescription}
                onChange={(value) => setSettings({ ...settings, siteDescription: value })}
                placeholder="发现精彩小说，开启阅读之旅"
                description="用于SEO和首页展示"
              />
              <InputField
                label="站点关键词"
                value={settings.siteKeywords}
                onChange={(value) => setSettings({ ...settings, siteKeywords: value })}
                placeholder="小说,网络小说,AI写作,阅读"
                description="多个关键词用逗号分隔"
              />
              <InputField
                label="站点Logo"
                value={settings.siteLogo}
                onChange={(value) => setSettings({ ...settings, siteLogo: value })}
                placeholder="/logo.png"
              />
              <InputField
                label="站点图标"
                value={settings.favicon}
                onChange={(value) => setSettings({ ...settings, favicon: value })}
                placeholder="/favicon.ico"
              />
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                用户设置
              </h2>
              <ToggleSwitch
                label="允许新用户注册"
                checked={settings.allowRegistration}
                onChange={(value) => setSettings({ ...settings, allowRegistration: value })}
                description="关闭后新用户将无法注册"
              />
              <ToggleSwitch
                label="需要邮箱验证"
                checked={settings.requireEmailVerification}
                onChange={(value) => setSettings({ ...settings, requireEmailVerification: value })}
                description="新用户注册后需要验证邮箱才能使用"
              />
              <ToggleSwitch
                label="允许游客访问"
                checked={settings.allowGuestAccess}
                onChange={(value) => setSettings({ ...settings, allowGuestAccess: value })}
                description="未登录用户是否可以浏览内容"
              />
              <InputField
                label="默认用户角色"
                value={settings.defaultUserRole}
                onChange={(value) => setSettings({ ...settings, defaultUserRole: value })}
                placeholder="AUTHOR"
                description="新注册用户的默认角色"
              />
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                内容设置
              </h2>
              <ToggleSwitch
                label="小说需要审核"
                checked={settings.requireReview}
                onChange={(value) => setSettings({ ...settings, requireReview: value })}
                description="新发布的小说是否需要管理员审核"
              />
              <ToggleSwitch
                label="允许评论"
                checked={settings.allowComments}
                onChange={(value) => setSettings({ ...settings, allowComments: value })}
                description="是否开启评论功能"
              />
              <ToggleSwitch
                label="评论需要审核"
                checked={settings.requireCommentApproval}
                onChange={(value) => setSettings({ ...settings, requireCommentApproval: value })}
                description="新评论是否需要管理员审核"
              />
              <InputField
                label="每用户最大小说数"
                value={settings.maxNovelsPerUser}
                onChange={(value) => setSettings({ ...settings, maxNovelsPerUser: parseInt(value) || 0 })}
                type="number"
                placeholder="10"
                description="每个用户最多可以创建的小说数量"
              />
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                文件设置
              </h2>
              <InputField
                label="最大上传大小"
                value={settings.maxUploadSize}
                onChange={(value) => setSettings({ ...settings, maxUploadSize: parseInt(value) || 0 })}
                type="number"
                placeholder="10"
                description="单位：MB"
              />
              <InputField
                label="允许的文件类型"
                value={settings.allowedFileTypes.join(', ')}
                onChange={(value) => setSettings({ ...settings, allowedFileTypes: value.split(',').map(s => s.trim()) })}
                placeholder="jpg, jpeg, png, gif, webp"
                description="多个类型用逗号分隔"
              />
              <InputField
                label="允许的封面类型"
                value={settings.allowedCoverTypes.join(', ')}
                onChange={(value) => setSettings({ ...settings, allowedCoverTypes: value.split(',').map(s => s.trim()) })}
                placeholder="jpg, jpeg, png, webp"
                description="多个类型用逗号分隔"
              />
              <InputField
                label="最大封面大小"
                value={settings.maxCoverSize}
                onChange={(value) => setSettings({ ...settings, maxCoverSize: parseInt(value) || 0 })}
                type="number"
                placeholder="5"
                description="单位：MB"
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知设置
              </h2>
              <ToggleSwitch
                label="启用邮件通知"
                checked={settings.enableEmailNotifications}
                onChange={(value) => setSettings({ ...settings, enableEmailNotifications: value })}
                description="是否发送邮件通知"
              />
              <InputField
                label="管理员邮箱"
                value={settings.adminEmail}
                onChange={(value) => setSettings({ ...settings, adminEmail: value })}
                type="email"
                placeholder="admin@novelhub.com"
                description="接收系统通知的邮箱地址"
              />
              <ToggleSwitch
                label="新用户通知"
                checked={settings.notifyOnNewUser}
                onChange={(value) => setSettings({ ...settings, notifyOnNewUser: value })}
                description="有新用户注册时发送通知"
              />
              <ToggleSwitch
                label="新小说通知"
                checked={settings.notifyOnNewNovel}
                onChange={(value) => setSettings({ ...settings, notifyOnNewNovel: value })}
                description="有新小说发布时发送通知"
              />
              <ToggleSwitch
                label="举报通知"
                checked={settings.notifyOnReport}
                onChange={(value) => setSettings({ ...settings, notifyOnReport: value })}
                description="有新的举报时发送通知"
              />
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                系统维护
              </h2>
              <ToggleSwitch
                label="维护模式"
                checked={settings.maintenanceMode}
                onChange={(value) => setSettings({ ...settings, maintenanceMode: value })}
                description="开启后只有管理员可以访问系统"
              />
              <TextAreaField
                label="维护提示信息"
                value={settings.maintenanceMessage}
                onChange={(value) => setSettings({ ...settings, maintenanceMessage: value })}
                placeholder="系统正在维护中，请稍后再试。"
                description="维护模式下显示给用户的提示信息"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
