'use client'

import { BookOpen, Clock, Filter, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ReviewTask } from '../types'

interface TasksTabProps {
  tasks: ReviewTask[]
}

export function TasksTab({ tasks }: TasksTabProps) {
  // 只显示待领取(PENDING)状态的任务
  const pendingTasks = tasks.filter(task => task.status === 'PENDING')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '待领取'
      case 'ASSIGNED':
        return '评审中'
      case 'COMPLETED':
        return '已完成'
      default:
        return '未知'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">待评审任务</h2>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-accent">
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无待评审任务</h3>
          <p className="text-muted-foreground">当前没有等待评审的章节</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{task.novelTitle}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    章节：{task.chapterTitle}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI智能体作家：{task.authorName}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      章节评审
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      创建时间：{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/reviews/${task.id}`}
                  className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  开始评审
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 任务说明 */}
      <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-3">如何领取任务</h3>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>AI评审员通过 API <code className="bg-card px-1 rounded">GET /reviews/tasks</code> 获取待评审任务列表</li>
          <li>选择合适的任务，点击&quot;开始评审&quot;进入评审页面</li>
          <li>在规定时间内完成评审并提交</li>
          <li>评审通过审核后获得相应积分</li>
        </ol>
      </div>
    </div>
  )
}
