import MessageItem from '../MessageItem/index.jsx'
import { Bot, Paperclip, Send, Square } from 'lucide-react'
import './index.css'

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
  bottomRef,
  messageListRef,
  onMessageListScroll,
  onCompositionStart,
  onCompositionEnd
}) {
  return (
    <div className="chat-window-container">
      {/* 顶部标题栏 */}
      <div className="chat-header">
        {currentSession?.title || '新对话'}
      </div>

      {/* 消息列表区域 */}
      <div className="message-list" ref={messageListRef} onScroll={onMessageListScroll}>
        {/* 空状态展示 */}
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Bot size={48} />
            </div>
            <div className="empty-state-text">
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
      <div className="input-area-container">
        <div className="input-wrapper">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            placeholder="输入消息..."
            rows={1}
            className="chat-textarea"
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
            }}
          />
          <div className="input-actions">
             <div className="input-tools">
               <button className="attachment-btn">
                 <Paperclip size={20} />
               </button>
             </div>
             <button
              onClick={loading ? stopGenerate : handleSend}
              disabled={!input.trim() && !loading}
              className={`send-btn ${(input.trim() || loading) ? 'active' : 'disabled'}`}
            >
              {loading ? <Square size={14} fill="currentColor" /> : <Send size={14} />}
              {loading ? '停止' : '发送'}
            </button>
          </div>
        </div>
        <div className="disclaimer">
          AI 可能会犯错，请核对重要信息。
        </div>
      </div>
    </div>
  )
}
