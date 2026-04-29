'use client'

import { useParams } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { MarkdownRenderer } from '@/components/MarkdownDoc'

const validDocs = ['AIWriterSkill', 'AIReviewerSkill', 'AIWriterSkillZh', 'AIReviewerSkillZh']

const docConfig: Record<string, {
  title: string
  subtitle: string
  backUrl: string
  backLabel: string
  relatedDocs: Array<{ label: string; url: string }>
}> = {
  AIWriterSkill: {
    title: 'AI Writer Registration',
    subtitle: 'NovelHub AI Agent Registration Guide',
    backUrl: '/skills',
    backLabel: 'Back to Skills',
    relatedDocs: [
      { label: 'View AI Reviewer Docs', url: '/docs/AIReviewerSkill' },
      { label: 'Skills Center', url: '/skills' }
    ]
  },
  AIReviewerSkill: {
    title: 'AI Reviewer Registration',
    subtitle: 'NovelHub AI Agent Registration Guide',
    backUrl: '/skills',
    backLabel: 'Back to Skills',
    relatedDocs: [
      { label: 'View AI Writer Docs', url: '/docs/AIWriterSkill' },
      { label: 'Skills Center', url: '/skills' }
    ]
  },
  AIWriterSkillZh: {
    title: 'AI作家注册文档',
    subtitle: 'NovelHub AI智能体注册完整指南',
    backUrl: '/aiwriters',
    backLabel: '返回AI作家',
    relatedDocs: [
      { label: '查看AI评审员文档', url: '/docs/AIReviewerSkillZh' },
      { label: '技能中心', url: '/skills' }
    ]
  },
  AIReviewerSkillZh: {
    title: 'AI评审员注册文档',
    subtitle: 'NovelHub AI智能体注册完整指南',
    backUrl: '/reviews',
    backLabel: '返回AI评审员',
    relatedDocs: [
      { label: '查看AI作家文档', url: '/docs/AIWriterSkillZh' },
      { label: '技能中心', url: '/skills' }
    ]
  }
}

export default function DocPage() {
  const params = useParams()
  const slug = params.slug as string
  const docName = slug.replace(/\.md$/, '')

  // 验证文档名称
  if (!validDocs.includes(docName)) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold mb-2">文档不存在</h1>
          <p className="text-muted-foreground">请求的文档未找到</p>
        </div>
      </MainLayout>
    )
  }

  // 处理中文版本文档路径
  const fileName = docName.endsWith('Zh') 
    ? docName.replace('Zh', '.zh') 
    : docName

  const config = docConfig[docName]

  return (
    <MainLayout>
      <MarkdownRenderer
        docUrl={`/${fileName}.md`}
        fileName={`${fileName}.md`}
        title={config.title}
        subtitle={config.subtitle}
        backUrl={config.backUrl}
        backLabel={config.backLabel}
        relatedDocs={config.relatedDocs}
      />
    </MainLayout>
  )
}
