import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar/index.jsx'
import ChatWindow from './components/ChatWindow/index.jsx'
import useChat from './hooks/useChat'
import { genId, loadSessions, saveSessions } from './utils/index'
import './App.css'

/** 从首条用户消息中提取简要、完整的一小段作为会话标题（首句/首行，再按字数截断） */
function summarizeForTitle(content, maxLen = 24) {
  if (!content || typeof content !== 'string') return ''
  const trimmed = content.trim()
  if (!trimmed) return ''
  // 优先取首句（按句号、问号、感叹号、换行截断）
  const firstSentence = trimmed.split(/[。！？\n.!?]/)[0].trim() || trimmed
  const segment = (firstSentence || trimmed).trim()
  if (segment.length <= maxLen) return segment
  return segment.slice(0, maxLen) + '…'
}

/**
 * 应用主入口组件
 * 负责全局状态管理、布局组装和会话同步
 */
export default function App() {
  // 初始化会话列表
  const [sessions, setSessions] = useState(() => loadSessions())
  // 初始化当前会话ID
  const [currentId, setCurrentId] = useState(() => {
    const s = loadSessions()
    return s.length > 0 ? s[0].id : null
  })
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentUploading, setAttachmentUploading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const bottomRef = useRef(null)
  const messageListRef = useRef(null)
  const shouldAutoScrollRef = useRef(true)
  const isComposingRef = useRef(false)
  const justEndedCompositionRef = useRef(false)

  const currentSession = sessions.find(s => s.id === currentId)

  // 使用自定义 Hook 管理聊天逻辑
  const { messages, setMessages, loading, sendMessage, stopGenerate, refreshMessage, setFeedback, submitChoices } =
    useChat(currentSession?.messages || [])

  // 监听 messages 变化，实时同步更新到 sessions 并持久化
  useEffect(() => {
    if (!currentId) return

    // 使用 setTimeout 将状态更新放入下一个事件循环，避免渲染冲突
    const timer = setTimeout(() => {
      setSessions(prev => {
        const updated = prev.map(s => {
          if (s.id !== currentId) return s
          const firstUser = messages.find(m => m.role === 'user')
          const title = firstUser ? summarizeForTitle(firstUser.content) : s.title
          
          return {
            ...s,
            messages,
            title
          }
        })
        saveSessions(updated)
        return updated
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [messages, currentId])

  // 收到新消息时自动滚动到底部
  useEffect(() => {
    if (!shouldAutoScrollRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleMessageListScroll = () => {
    const el = messageListRef.current
    if (!el) return
    const thresholdPx = 24
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    shouldAutoScrollRef.current = distanceToBottom <= thresholdPx
  }

  // 新建会话
  const handleNew = () => {
    shouldAutoScrollRef.current = true
    const newSession = { id: genId(), title: '新对话', messages: [] }
    const updated = [newSession, ...sessions]
    setSessions(updated)
    saveSessions(updated)
    setCurrentId(newSession.id)
    setMessages([])
  }

  // 切换会话
  const handleSelect = (id) => {
    if (id === currentId) return
    shouldAutoScrollRef.current = true
    const session = sessions.find(s => s.id === id)
    setCurrentId(id)
    setMessages(session?.messages || [])
  }

  // 删除会话
  const handleDelete = (id) => {
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    saveSessions(updated)
    if (id === currentId) {
      const next = updated[0]
      setCurrentId(next?.id || null)
      setMessages(next?.messages || [])
    }
  }

  // 处理消息发送
  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || loading || attachmentUploading) return
    // 如果当前没有选中会话，则自动新建
    if (!currentId) {
      handleNew()
    }
    shouldAutoScrollRef.current = true
    // 确保附件已有 URL（上传到对象存储）
    setAttachmentUploading(true)
    const finalized = await Promise.all(attachments.map(async att => {
      if (att.url) return att
      try {
        const { uploadFile } = await import('./utils/upload')
        const uploaded = await uploadFile(att.file)
        return { ...att, url: uploaded.url }
      } catch (e) {
        return { ...att, error: e.message || '上传失败' }
      }
    }))
    setAttachmentUploading(false)

    const okAttachments = finalized.filter(a => a.url)
    const failed = finalized.filter(a => a.error)
    setAttachments(okAttachments)

    sendMessage(input.trim(), undefined, okAttachments)
    setInput('')
    // 清理附件预览 URL
    attachments.forEach(att => att.preview && URL.revokeObjectURL(att.preview))
    setAttachments([])
    if (failed.length) {
      alert(`部分附件上传失败：${failed.map(f => f.name).join('、')}`)
    }
  }

  // 处理键盘事件（回车发送，Shift+Enter 换行）
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // 中文输入法等组合输入期间，Enter 用于“选词/上屏”，不应触发发送
      // 某些浏览器会在 compositionend 之后立刻触发一次 keydown(Enter)，这里做一次短暂兜底
      if (
        justEndedCompositionRef.current ||
        isComposingRef.current ||
        e.isComposing ||
        e.nativeEvent?.isComposing ||
        e.keyCode === 229
      ) {
        return
      }
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="app-container">
      {/* 左侧历史会话栏 */}
      <Sidebar
        sessions={sessions}
        currentId={currentId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 右侧聊天主窗口 */}
      <ChatWindow
        currentSession={currentSession}
        messages={messages}
        loading={loading}
        refreshMessage={refreshMessage}
        setFeedback={setFeedback}
        input={input}
        setInput={setInput}
        attachments={attachments}
        attachmentUploading={attachmentUploading}
        onAddAttachments={(files) => {
          const added = Array.from(files || []).map(file => ({
            id: genId(),
            name: file.name,
            size: file.size,
            type: file.type,
            file,
            preview: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null
          }))
          setAttachments(prev => [...prev, ...added])
        }}
        onRemoveAttachment={(id) => {
          setAttachments(prev => {
            const target = prev.find(a => a.id === id)
            if (target?.preview) URL.revokeObjectURL(target.preview)
            return prev.filter(a => a.id !== id)
          })
        }}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
        stopGenerate={stopGenerate}
        bottomRef={bottomRef}
        messageListRef={messageListRef}
        onMessageListScroll={handleMessageListScroll}
        onCompositionStart={() => {
          isComposingRef.current = true
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false
          justEndedCompositionRef.current = true
          setTimeout(() => {
            justEndedCompositionRef.current = false
          }, 0)
        }}
        onSubmitChoices={submitChoices}
      />
    </div>
  )
}
