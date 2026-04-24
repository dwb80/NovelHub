'use client';

import { useState } from 'react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxUploadSize: number;
  allowedFileTypes: string[];
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'NovelHub',
    siteDescription: '发现精彩小说，开启阅读之旅',
    allowRegistration: true,
    requireEmailVerification: false,
    maxUploadSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif'],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setMessage('设置已保存');
    } catch (err) {
      setMessage('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-card rounded-lg border p-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-4">站点信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">站点名称</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">站点描述</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold mb-4">用户设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">允许注册</div>
                <div className="text-sm text-muted-foreground">是否开放新用户注册</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.allowRegistration ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.allowRegistration ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">邮箱验证</div>
                <div className="text-sm text-muted-foreground">注册时是否需要验证邮箱</div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.requireEmailVerification ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-semibold mb-4">文件上传</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">最大上传大小 (MB)</label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}
