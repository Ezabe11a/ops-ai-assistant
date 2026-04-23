import { useState } from 'react'
import MessageItem from '../MessageItem/index.jsx'
import { Bot, Paperclip, Send, Square, Brain, ChevronDown } from 'lucide-react'
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
  attachments = [],
  onAddAttachments,
  onRemoveAttachment,
  attachmentUploading = false,
  handleSend,
  handleKeyDown,
  stopGenerate,
  bottomRef,
  messageListRef,
  onMessageListScroll,
  onCompositionStart,
  onCompositionEnd,
  onSubmitChoices,
  onEditMessage,
  model,
  onModelChange,
  isDeepThinking,
  onDeepThinkingChange
}) {
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)

  const models = [
    { id: 'qwen-max', name: 'Qwen Max (旗舰版)' },
    { id: 'qwen-plus', name: 'Qwen Plus (标准版)' },
    { id: 'deepseek-v3', name: 'DeepSeek V3' }
  ]

  const currentModelName = models.find(m => m.id === model)?.name || model

  return (
    <div className="chat-window-container">
      {/* 顶部标题栏 */}
      <div className="chat-header">
        <div className="chat-header-left">
          {currentSession?.title || '新对话'}
        </div>
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
            onSubmitChoices={onSubmitChoices}
            onEdit={onEditMessage}
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
               <label className="attachment-btn" title="上传附件">
                 <Paperclip size={20} />
                 <input
                   type="file"
                   multiple
                   className="hidden-file-input"
                   onChange={e => {
                     if (!onAddAttachments) return
                     onAddAttachments(e.target.files)
                     e.target.value = ''
                   }}
                 />
               </label>

               <div className="model-selector">
                 <button 
                   className={`model-selector-btn ${isModelMenuOpen ? 'active' : ''}`}
                   onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                 >
                   <span>{currentModelName}</span>
                   <ChevronDown size={14} />
                 </button>
                 {isModelMenuOpen && (
                   <div className="model-dropdown">
                     {models.map(m => (
                       <div 
                         key={m.id} 
                         className={`model-option ${model === m.id ? 'selected' : ''}`}
                         onClick={() => {
                           onModelChange(m.id)
                           setIsModelMenuOpen(false)
                         }}
                       >
                         {m.name}
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               <button 
                 className={`deep-thinking-btn ${isDeepThinking ? 'active' : ''}`}
                 onClick={() => onDeepThinkingChange(!isDeepThinking)}
                 title="深度思考"
               >
                 <Brain size={18} />
                 <span>深度思考</span>
               </button>
             </div>
             <button
              onClick={loading ? stopGenerate : handleSend}
              disabled={(!loading && !input.trim() && attachments.length === 0) || attachmentUploading}
              className={`send-btn ${(loading || (input.trim() || attachments.length > 0) && !attachmentUploading) ? 'active' : 'disabled'}`}
            >
              {loading ? <Square size={14} fill="currentColor" /> : <Send size={14} />}
              {loading ? '停止' : (attachmentUploading ? '上传中' : '发送')}
            </button>
          </div>
          {!!attachments.length && (
            <div className="attachment-preview-list">
              {attachments.map(file => (
                <div className="attachment-chip" key={file.id}>
                  <div className="attachment-info">
                    {file.preview ? (
                      <span className="attachment-thumb" style={{ backgroundImage: `url(${file.preview})` }} />
                    ) : (
                      <Paperclip size={14} />
                    )}
                    <span className="attachment-name" title={file.name}>{file.name}</span>
                    <span className="attachment-size">{Math.max(1, Math.round(file.size / 1024))}KB</span>
                  </div>
                  <button
                    className="attachment-remove"
                    onClick={() => onRemoveAttachment?.(file.id)}
                    aria-label="移除附件"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="disclaimer">
          AI 可能会犯错，请核对重要信息。
        </div>
      </div>
    </div>
  )
}
