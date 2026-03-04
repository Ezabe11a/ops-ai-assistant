import MessageItem from './MessageItem.jsx'
import { Bot, Paperclip, Send, Square } from 'lucide-react'

/**
 * 聊天主窗口组件
 * 包含顶部标题栏、消息列表区域和底部输入区域
 */
export default function ChatWindow({
  currentSession,
  messages,
  loading,
  refreshMessage,
  setFeedback,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  stopGenerate,
  bottomRef
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white', position: 'relative' }}>
      {/* 顶部标题栏 */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #eee',
        fontWeight: '500',
        fontSize: '14px',
        color: '#666',
        background: 'white',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {currentSession?.title || '新对话'}
      </div>

      {/* 消息列表区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 0',
        background: 'white'
      }}>
        {/* 空状态展示 */}
        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80%',
            color: '#333'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#d95a3c',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '24px',
              color: 'white'
            }}>
              <Bot size={48} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>
              有什么可以帮你的吗?
            </div>
          </div>
        )}
        {/* 渲染消息列表 */}
        {messages.map((msg, index) => (
          <MessageItem
            key={index}
            message={msg}
            index={index}
            loading={loading}
            onRefresh={refreshMessage}
            onFeedback={setFeedback}
          />
        ))}
        {/* 自动滚动锚点 */}
        <div ref={bottomRef} />
      </div>

      {/* 底部输入区域 */}
      <div style={{
        padding: '0 24px 36px 24px',
        background: 'white',
        maxWidth: '48rem',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{
          background: '#f4f4f4',
          borderRadius: '16px',
          border: '1px solid #e5e5e5',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = '#d1d1d1'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = '#e5e5e5'
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)'
        }}
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            style={{
              width: '100%',
              padding: '4px',
              borderRadius: '8px',
              border: 'none',
              resize: 'none',
              fontSize: '16px',
              outline: 'none',
              lineHeight: '1.5',
              background: 'transparent',
              fontFamily: 'inherit',
              minHeight: '24px',
              maxHeight: '200px'
            }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: '8px' }}>
               <button style={{
                 background: 'none',
                 border: 'none',
                 cursor: 'pointer',
                 padding: '4px',
                 borderRadius: '4px',
                 color: '#666',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}>
                 <Paperclip size={20} />
               </button>
             </div>
             <button
              onClick={loading ? stopGenerate : handleSend}
              disabled={!input.trim() && !loading}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: (input.trim() || loading) ? '#da7756' : '#e0e0e0',
                color: 'white',
                cursor: (input.trim() || loading) ? 'pointer' : 'default',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {loading ? <Square size={14} fill="currentColor" /> : <Send size={14} />}
              {loading ? '停止' : '发送'}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#999' }}>
          AI 可能会犯错，请核对重要信息。
        </div>
      </div>
    </div>
  )
}
