'use client'

import { useState } from 'react'
import { ThumbsUp, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { CommentSectionProps, Comment } from './types'

function CommentItem({ 
  comment, 
  onReply, 
  onLike,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply
}: {
  comment: Comment
  onReply: (parentId: string) => void
  onLike: (commentId: string) => void
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: () => void
}) {
  const [showReplies, setShowReplies] = useState(false)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{comment.authorName}</span>
          {comment.parentId && (
            <span className="text-xs text-muted-foreground">回复</span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-muted-foreground mb-3">{comment.content}</p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => onLike(comment.id)}
          className={`flex items-center gap-1 text-sm ${comment.liked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
        >
          <ThumbsUp className={`w-4 h-4 ${comment.liked ? 'fill-current' : ''}`} />
          {comment.likeCount || 0}
        </button>
        
        <button
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          回复
        </button>
      </div>

      {/* 回复输入框 */}
      {replyingTo === comment.id && (
        <div className="mt-3 pl-4 border-l-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`回复 ${comment.authorName}...`}
            className="w-full px-3 py-2 border rounded-md bg-background text-sm mb-2 resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setReplyingTo(null)}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
            >
              取消
            </button>
            <button
              onClick={onSubmitReply}
              disabled={!replyContent.trim()}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              回复
            </button>
          </div>
        </div>
      )}

      {/* 子评论 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-sm text-primary mb-2"
          >
            {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showReplies ? '收起回复' : `查看 ${comment.replies.length} 条回复`}
          </button>
          
          {showReplies && (
            <div className="space-y-3 pl-4 border-l-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={onSubmitReply}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CommentSection({
  novelId,
  comments,
  commentSort,
  onChangeSort,
  onSubmitComment,
  onSubmitReply,
  onLikeComment
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmit = () => {
    onSubmitComment(newComment)
    setNewComment('')
  }

  const handleSubmitReply = () => {
    if (replyingTo) {
      onSubmitReply(replyingTo, replyContent)
      setReplyContent('')
      setReplyingTo(null)
    }
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === 'hottest') {
      return (b.likeCount || 0) - (a.likeCount || 0)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-6">
      {/* 发表评论 */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">发表评论</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className="w-full px-3 py-2 border rounded-md bg-background text-sm mb-3 resize-none"
          rows={4}
        />
        <div className="flex justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            发表
          </button>
        </div>
      </div>

      {/* 排序 */}
      <div className="flex items-center gap-4 border-b pb-3">
        <span className="text-sm text-muted-foreground">排序：</span>
        <button
          onClick={() => onChangeSort('newest')}
          className={`text-sm ${commentSort === 'newest' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
        >
          最新
        </button>
        <button
          onClick={() => onChangeSort('hottest')}
          className={`text-sm ${commentSort === 'hottest' ? 'text-primary font-medium' : 'text-muted-foreground'}`}
        >
          最热
        </button>
      </div>
      
      {/* 评论列表 */}
      {sortedComments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无评论，来发表第一条评论吧
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={() => setReplyingTo(comment.id)}
              onLike={onLikeComment}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}
