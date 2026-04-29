'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MarkdownRendererProps {
  docUrl: string
  fileName: string
  title: string
  subtitle?: string
  backUrl?: string
  backLabel?: string
  relatedDocs?: Array<{
    label: string
    url: string
  }>
}

export function MarkdownRenderer({
  docUrl,
  fileName,
  title,
  subtitle,
  backUrl = '/',
  backLabel = '返回',
  relatedDocs = []
}: MarkdownRendererProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(docUrl)
      .then(res => {
        if (!res.ok) throw new Error('文档加载失败')
        return res.text()
      })
      .then(text => {
        setContent(text)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [docUrl])

  // Markdown 渲染函数
  const renderMarkdown = (text: string) => {
    // 移除 YAML frontmatter
    let html = text.replace(/^---[\s\S]*?---/, '')

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">${escapeHtml(code)}</code></pre>`
    })

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')

    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-5 border-b pb-2">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-6">$1</h1>')

    // 粗体和斜体
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

    // 表格
    const tableRegex = /\|(.+)\|\n\|[-:\| ]+\|\n((?:\|.+\|\n?)+)/g
    html = html.replace(tableRegex, (match, header, rows) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean)
      const rowData = rows.trim().split('\n').map((row: string) => 
        row.split('|').map((cell: string) => cell.trim()).filter(Boolean)
      )
      
      return `
        <div class="overflow-x-auto my-6">
          <table class="w-full border-collapse border border-border">
            <thead>
              <tr class="bg-muted">
                ${headers.map((h: string) => `<th class="border border-border px-4 py-2 text-left font-semibold">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowData.map((row: string[]) => `
                <tr class="border-b border-border">
                  ${row.map((cell: string) => `<td class="border border-border px-4 py-2">${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    })

    // 无序列表
    html = html.replace(/^\s*[-*] (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
    html = html.replace(/(<li class="ml-6 list-disc"[^>]*>[\s\S]*?<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')

    // 有序列表
    html = html.replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
    html = html.replace(/(<li class="ml-6 list-decimal"[^>]*>[\s\S]*?<\/li>\n?)+/g, '<ol class="my-4 space-y-1">$&</ol>')

    // 引用块
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">$1</blockquote>')

    // 水平线
    html = html.replace(/^---$/gim, '<hr class="my-8 border-border" />')

    // 段落（必须在最后）
    html = html.replace(/\n\n/g, '</p><p class="my-4 leading-relaxed">')
    html = '<p class="my-4 leading-relaxed">' + html + '</p>'

    // 清理空段落
    html = html.replace(/<p class="my-4 leading-relaxed"><\/p>/g, '')

    return html
  }

  // HTML 转义函数
  const escapeHtml = (text: string) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>加载文档中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">出错了</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 头部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-5 h-5" />
            <span>/</span>
            <span className="text-foreground font-medium">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            查看源码
          </a>
        </div>
      </div>

      {/* 文档标题 */}
      <div className="mb-8 pb-6 border-b">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* 文档内容 */}
      <article 
        className="prose prose-slate max-w-none dark:prose-invert
          prose-headings:scroll-mt-20
          prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
          prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-5 prose-h2:border-b prose-h2:pb-2
          prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4
          prose-p:my-4 prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
          prose-ul:my-4 prose-ul:space-y-1
          prose-ol:my-4 prose-ol:space-y-1
          prose-li:ml-6
          prose-table:w-full prose-table:border-collapse prose-table:my-6
          prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:bg-muted
          prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
          prose-hr:my-8 prose-hr:border-border
        "
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />

      {/* 底部导航 */}
      <div className="mt-16 pt-8 border-t">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </button>
          
          {relatedDocs.length > 0 && (
            <div className="flex items-center gap-4">
              {relatedDocs.map((doc, index) => (
                <Link
                  key={index}
                  href={doc.url}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  {doc.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
