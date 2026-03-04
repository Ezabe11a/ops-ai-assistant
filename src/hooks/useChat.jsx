import { useState, useRef } from 'react'

/**
 * 聊天核心逻辑 Hook
 * 管理消息列表、API 请求状态、流式响应处理
 * 
 * @param {Array} initialMessages 初始消息列表
 * @returns {Object} 包含消息列表、发送函数、停止生成、刷新消息等方法
 */
export default function useChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef(null)

  /**
   * 发送消息
   * @param {string} userInput 用户输入的内容
   * @param {Array} historyOverride (可选)覆盖当前历史记录，用于重试等场景
   */
  const sendMessage = async (userInput, historyOverride) => {
    const base = historyOverride ?? messages
    // 1. 添加用户消息到列表
    const newMessages = [...base, { role: 'user', content: userInput }]
    setMessages(newMessages)
    setLoading(true)
    // 2. 预占位 assistant 消息
    setMessages(prev => [...prev, { role: 'assistant', content: '', feedback: null }])

    // 初始化 AbortController 用于中断请求
    abortRef.current = new AbortController()

    try {
      const response = await fetch(
        `${import.meta.env.VITE_QWEN_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_QWEN_API_KEY}`
          },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            model: 'qwen-plus',
            messages: newMessages,
            stream: true // 开启流式响应
          })
        }
      )

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      // 3. 处理流式响应
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') break
          try {
            const delta = JSON.parse(data)?.choices?.[0]?.delta?.content || ''
            // 实时更新最后一条消息内容
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + delta
              }
              return updated
            })
          } catch (e) { 
            console.log(e);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: '请求出错，请重试'
          }
          return updated
        })
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * 停止生成
   */
  const stopGenerate = () => {
    abortRef.current?.abort()
    setLoading(false)
  }

  /**
   * 刷新（重新生成）某条 assistant 回答
   * @param {number} index 消息索引
   */
  const refreshMessage = async (index) => {
    // 取该条回答之前的所有消息作为上下文
    const context = messages.slice(0, index)
    const lastUserMsg = [...context].reverse().find(m => m.role === 'user')
    if (!lastUserMsg) return

    // 清空该条回答重新生成
    setMessages(prev => {
      const updated = [...prev]
      updated[index] = { role: 'assistant', content: '', feedback: null }
      return updated
    })
    setLoading(true)
    abortRef.current = new AbortController()

    try {
      const response = await fetch(
        `${import.meta.env.VITE_QWEN_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_QWEN_API_KEY}`
          },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            model: 'qwen-plus',
            messages: context,
            stream: true
          })
        }
      )

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const data = line.slice(5).trim()
          if (data === '[DONE]') break
          try {
            const delta = JSON.parse(data)?.choices?.[0]?.delta?.content || ''
            setMessages(prev => {
              const updated = [...prev]
              updated[index] = {
                ...updated[index],
                content: updated[index].content + delta
              }
              return updated
            })
          } catch (e) { 
            console.log(e);
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev]
          updated[index] = { ...updated[index], content: '请求出错，请重试' }
          return updated
        })
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * 设置消息反馈（点赞/点踩）
   */
  const setFeedback = (index, feedback) => {
    setMessages(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], feedback }
      return updated
    })
  }

  return { messages, setMessages, loading, sendMessage, stopGenerate, refreshMessage, setFeedback }
}
