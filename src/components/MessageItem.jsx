import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import {
  User, Bot, Copy, RotateCcw, ThumbsUp, ThumbsDown, Check
} from 'lucide-react'

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      margin: '24px 0',
      padding: '0 16px',
      maxWidth: '48rem',
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <div style={{
        display: 'flex',
        gap: '16px',
        width: '100%',
        flexDirection: isUser ? 'row-reverse' : 'row'
      }}>
        {/* 头像 */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: isUser ? '#da7756' : '#d95a3c',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* 消息内容 */}
        <div style={{
          flex: 1,
          maxWidth: '100%',
          minWidth: 0
        }}>
          {/* 发送者名称 */}
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '6px',
            textAlign: isUser ? 'right' : 'left'
          }}>
            {isUser ? '你' : 'AI 助手'}
          </div>

          <div style={{
            background: isUser ? '#f4f4f4' : 'transparent',
            color: '#2d2d2d',
            padding: isUser ? '12px 16px' : '0',
            borderRadius: '8px',
            lineHeight: '1.7',
            whiteSpace: isUser ? 'pre-wrap' : 'normal',
            wordBreak: 'break-word',
            fontSize: '16px',
            fontFamily: '"Söhne", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
          }}>
            {isUser ? (message.content || '') : (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  table: ({...props}) => (
                    <table style={{ borderCollapse: 'collapse', width: '100%', margin: '16px 0' }} {...props} />
                  ),
                  th: ({...props}) => (
                    <th style={{ border: '1px solid #ddd', padding: '8px', background: '#f9f9f9', fontWeight: '600' }} {...props} />
                  ),
                  td: ({...props}) => (
                    <td style={{ border: '1px solid #ddd', padding: '8px' }} {...props} />
                  ),
                  code: ({inline, className, children, ...props}) => {
                    return !inline ? (
                      <div style={{ background: '#f6f8fa', borderRadius: '6px', padding: '16px', margin: '16px 0', overflowX: 'auto' }}>
                        <code className={className} style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: '14px' }} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code style={{ background: '#f4f4f4', padding: '2px 6px', borderRadius: '4px', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: '14px', color: '#eb5757' }} {...props}>
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
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              opacity: 0.6
            }}>
              <ActionBtn onClick={handleCopy} title="复制">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? '已复制' : '复制'}</span>
              </ActionBtn>
              <ActionBtn onClick={() => onRefresh(index)} title="重试">
                <RotateCcw size={14} />
                <span>重试</span>
              </ActionBtn>
              <div style={{ flex: 1 }} />
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
      style={{
        background: active ? '#e6f4ff' : 'transparent',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '4px 8px',
        fontSize: '13px',
        color: active ? '#1677ff' : '#666',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
      onMouseEnter={e => e.currentTarget.style.background = active ? '#d9edff' : '#f0f0f0'}
      onMouseLeave={e => e.currentTarget.style.background = active ? '#e6f4ff' : 'transparent'}
    >
      {children}
    </button>
  )
}
