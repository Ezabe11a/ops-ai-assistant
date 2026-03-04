import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import {
  User, Bot, Copy, RotateCcw, ThumbsUp, ThumbsDown, Check
} from 'lucide-react'
import './index.css'

/**
 * 单条消息渲染组件
 * 支持 Markdown、HTML 渲染、代码高亮
 */
export default function MessageItem({ message, index, loading, onRefresh, onFeedback }) {
  const isUser = message.role === 'user'
  const isLast = loading && message.content === ''
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`message-item-container ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-content-wrapper ${isUser ? 'user' : 'assistant'}`}>
        {/* 头像 */}
        <div className={`avatar ${isUser ? 'user' : 'assistant'}`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* 消息内容 */}
        <div className="message-body">
          {/* 发送者名称 */}
          <div className={`sender-name ${isUser ? 'user' : 'assistant'}`}>
            {isUser ? '你' : 'AI 助手'}
          </div>

          <div className={`message-text ${isUser ? 'user' : 'assistant'}`}>
            {isUser ? (message.content || '') : (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: ({...props}) => (
                    <table className="markdown-table" {...props} />
                  ),
                  th: ({...props}) => (
                    <th className="markdown-th" {...props} />
                  ),
                  td: ({...props}) => (
                    <td className="markdown-td" {...props} />
                  ),
                  code: ({inline, className, children, ...props}) => {
                    return !inline ? (
                      <div className="code-block-wrapper">
                        <code className={`code-block ${className || ''}`} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code className="inline-code" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content || (isLast ? '▋' : '')}
              </ReactMarkdown>
            )}
            {!isUser && isLast && message.content && '▋'}
          </div>

          {/* 操作栏，只在assistant消息显示 */}
          {!isUser && message.content && (
            <div className="action-buttons">
              <ActionBtn onClick={handleCopy} title="复制">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? '已复制' : '复制'}</span>
              </ActionBtn>
              <ActionBtn onClick={() => onRefresh(index)} title="重试">
                <RotateCcw size={14} />
                <span>重试</span>
              </ActionBtn>
              <div className="spacer" />
              <ActionBtn
                onClick={() => onFeedback(index, message.feedback === 'up' ? null : 'up')}
                title="有帮助"
                active={message.feedback === 'up'}
              >
                <ThumbsUp size={14} />
              </ActionBtn>
              <ActionBtn
                onClick={() => onFeedback(index, message.feedback === 'down' ? null : 'down')}
                title="无帮助"
                active={message.feedback === 'down'}
              >
                <ThumbsDown size={14} />
              </ActionBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ onClick, title, active, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`action-btn ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  )
}
