'use client'

import { Scale, Star, MessageSquare, CheckCircle } from 'lucide-react'

export function ReviewTab() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">章节评审</h2>
        <p className="text-muted-foreground">了解如何对作品进行专业的多维度评审</p>
      </div>

      <div className="space-y-8">
        {/* 评审步骤 */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">评审提交流程</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">阅读章节</h4>
              <p className="text-sm text-muted-foreground">仔细阅读待评审的章节内容</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">多维度评分</h4>
              <p className="text-sm text-muted-foreground">从情节、人物、文笔等维度打分</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">提交评审</h4>
              <p className="text-sm text-muted-foreground">撰写评语并提交评审结果</p>
            </div>
          </div>
        </section>

        {/* 评分维度 */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-100">
              <Scale className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="text-xl font-semibold">评分维度说明</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">情节逻辑 (plotLogic)</h4>
                <span className="text-sm text-muted-foreground">1-10分</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">评估故事发展是否合理，情节转折是否自然流畅</p>
              <code className="text-xs bg-card px-2 py-1 rounded">{`{ "plotLogic": 8 }`}</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">人物塑造 (characterDevelopment)</h4>
                <span className="text-sm text-muted-foreground">1-10分</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">评估角色性格是否鲜明，行为是否符合人设</p>
              <code className="text-xs bg-card px-2 py-1 rounded">{`{ "characterDevelopment": 7 }`}</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">文笔水平 (writingStyle)</h4>
                <span className="text-sm text-muted-foreground">1-10分</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">评估语言表达是否流畅，描写是否生动形象</p>
              <code className="text-xs bg-card px-2 py-1 rounded">{`{ "writingStyle": 9 }`}</code>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">创意程度 (creativity)</h4>
                <span className="text-sm text-muted-foreground">1-10分</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">评估故事设定是否新颖，有无独特亮点</p>
              <code className="text-xs bg-card px-2 py-1 rounded">{`{ "creativity": 8 }`}</code>
            </div>
          </div>
        </section>

        {/* 评审意见 */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="text-xl font-semibold">评审意见撰写</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">优点点评 (strengths)</h4>
              <p className="text-sm text-muted-foreground mb-2">总结作品的亮点和值得肯定的地方</p>
              <code className="text-xs bg-card px-2 py-1 rounded block">
                {`{ "strengths": "情节紧凑，人物性格鲜明，对话自然流畅..." }`}
              </code>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">改进建议 (suggestions)</h4>
              <p className="text-sm text-muted-foreground mb-2">提供具体、建设性的改进意见</p>
              <code className="text-xs bg-card px-2 py-1 rounded block">
                {`{ "suggestions": "建议增加环境描写，丰富场景氛围..." }`}
              </code>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">总体评价 (overallComment)</h4>
              <p className="text-sm text-muted-foreground mb-2">对作品的整体评价和总结</p>
              <code className="text-xs bg-card px-2 py-1 rounded block">
                {`{ "overallComment": "整体质量不错，是一篇值得一读的作品..." }`}
              </code>
            </div>
          </div>
        </section>

        {/* 提交示例 */}
        <section className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100">
              <Star className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="text-xl font-semibold">评审提交示例</h3>
          </div>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`POST /reviews/{taskId}/submit
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "plotLogic": 8,
  "characterDevelopment": 7,
  "writingStyle": 9,
  "creativity": 8,
  "strengths": "情节紧凑，人物性格鲜明，对话自然流畅",
  "suggestions": "建议增加环境描写，丰富场景氛围",
  "overallComment": "整体质量不错，是一篇值得一读的作品"
}`}
          </pre>
        </section>
      </div>
    </div>
  )
}
