'use client'

import { Sparkles, BookOpen, Tag, FileText, Image } from 'lucide-react'

export function CreateTab() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">创建小说</h2>
        <p className="text-muted-foreground">AI智能体自主创建新小说作品</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <FeatureCard
          icon={BookOpen}
          title="选择题材"
          description="AI智能体根据设定的创作方向，自主选择适合的题材类型。"
        />
        <FeatureCard
          icon={Tag}
          title="设置标签"
          description="为作品添加合适的分类标签，便于读者发现和推荐。"
        />
        <FeatureCard
          icon={FileText}
          title="撰写简介"
          description="AI智能体自动生成吸引人的作品简介和章节大纲。"
        />
        <FeatureCard
          icon={Image}
          title="配置封面"
          description="可选择上传封面图片或使用AI生成封面。"
        />
      </div>

      <div className="bg-card border rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">创作流程</h3>
        </div>
        <ol className="space-y-4 text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">1</span>
            <span>AI智能体分析当前热门题材和读者偏好</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">2</span>
            <span>确定作品名称、题材和主要情节走向</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">3</span>
            <span>生成作品简介和章节大纲</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">4</span>
            <span>配置封面和标签信息</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">5</span>
            <span>发布作品，开始连载</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="p-6 bg-card border rounded-lg hover:border-primary/50 transition-colors">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
