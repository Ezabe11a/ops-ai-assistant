import { useState, useRef, useEffect } from 'react'
import MessageItem from '../MessageItem/index.jsx'
import { Bot, Paperclip, Send, Square, Brain, ChevronDown, Terminal, ShieldAlert, Code2, Search, Sparkles } from 'lucide-react'
import './index.css'

/**
 * 聊天主窗口组件
 */
export default function ChatWindow({
  currentSession,
  messages,
  loading,
  refreshMessage,
  setFeedback,
  input,
  setInput,
  attachments,
  attachmentUploading,
  onAddAttachments,
  onRemoveAttachment,
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
  onDeepThinkingChange,
  optimizePrompt
}) {
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const textareaRef = useRef(null)
  const inputWrapperRef = useRef(null)
  const dragStartYRef = useRef(0)
  const dragStartHeightRef = useRef(0)
  const isDraggingRef = useRef(false)

  const LINE_HEIGHT = 24 // 每行高度约 24px
  const MIN_LINES = 1
  const MAX_LINES = 10

  // 初始化 textarea 高度为 2 行
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = (LINE_HEIGHT * 2) + 'px'
    }
  }, [])

  const handleDragStart = (e) => {
    isDraggingRef.current = true
    dragStartYRef.current = e.clientY
    const textarea = textareaRef.current
    dragStartHeightRef.current = textarea ? parseInt(textarea.style.height || '24', 10) : LINE_HEIGHT
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handleDragMove = (e) => {
      if (!isDraggingRef.current) return
      const deltaY = dragStartYRef.current - e.clientY
      const newHeight = dragStartHeightRef.current + deltaY
      const lines = Math.round(newHeight / LINE_HEIGHT)
      const clampedLines = Math.max(MIN_LINES, Math.min(MAX_LINES, lines))
      const clampedHeight = clampedLines * LINE_HEIGHT
      if (textareaRef.current) {
        textareaRef.current.style.height = clampedHeight + 'px'
      }
    }

    const handleDragEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
    }
  }, [])

  const quickActions = [
    { icon: <Search size={14} />, label: '排查日志', text: '请帮我分析一下这条错误日志的原因：\n' },
    { icon: <Terminal size={14} />, label: '生成脚本', text: '请帮我写一个 Shell 脚本来实现以下功能：\n' },
    { icon: <ShieldAlert size={14} />, label: '安全审计', text: '请帮我检查一下这段配置是否存在安全隐患：\n' },
    { icon: <Code2 size={14} />, label: 'K8s 配置', text: '请帮我编写一个 Kubernetes Deployment YAML，要求如下：\n' },
  ]

  const models = [
    { id: 'qwen-max', name: 'Qwen Max (旗舰版)' },
    { id: 'qwen-plus', name: 'Qwen Plus (标准版)' },
    { id: 'deepseek-v3', name: 'DeepSeek V3' }
  ]

  const currentModelName = models.find(m => m.id === model)?.name || model

  const handleOptimizePrompt = async () => {
    if (!input.trim() || isOptimizing) return
    setIsOptimizing(true)
    try {
      const optimized = await optimizePrompt(input)
      setInput(optimized)
    } catch (err) {
      alert(err.message || '优化提示词失败')
    } finally {
      setIsOptimizing(false)
    }
  }

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
        {/* 运维快捷指令 */}
        {messages.length === 0 && (
          <div className="quick-actions-container">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className="quick-action-card"
                onClick={() => {
                  setInput(action.text)
                  // 自动聚焦到 textarea
                  const textarea = document.querySelector('.chat-textarea')
                  if (textarea) {
                    textarea.focus()
                    textarea.setSelectionRange(action.text.length, action.text.length)
                  }
                }}
              >
                <span className="quick-action-icon">{action.icon}</span>
                <span className="quick-action-label">{action.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="input-wrapper" ref={inputWrapperRef}>
          <div
            className="resize-handle"
            onMouseDown={handleDragStart}
            title="拖动调整高度"
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            placeholder="输入消息..."
            rows={1}
            className="chat-textarea"
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
             <div className="input-tools-right" style={{ display: 'flex', gap: '8px' }}>
               {/* 提示词优化按钮 */}
               <button
                 className={`optimize-btn ${input.trim() && !isOptimizing && !loading ? 'active' : 'disabled'}`}
                 onClick={handleOptimizePrompt}
                 disabled={!input.trim() || isOptimizing || loading}
                 title="优化提示词"
               >
                 <Sparkles size={16} className={isOptimizing ? 'spin-anim' : ''} />
               </button>

               {/* 发送/停止按钮 */}
               <button
                 className={`send-btn ${input.trim() || attachments.length || loading ? 'active' : 'disabled'}`}
                 onClick={loading ? stopGenerate : handleSend}
                 disabled={(!loading && !input.trim() && attachments.length === 0) || attachmentUploading}
               >
                 {loading ? (
                   <>
                     <Square size={14} fill="currentColor" />
                     <span>停止</span>
                   </>
                 ) : (
                   <>
                     <Send size={14} />
                     <span>发送</span>
                   </>
                 )}
               </button>
             </div>
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
