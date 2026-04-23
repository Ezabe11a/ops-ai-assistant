import { useState, useRef } from 'react'
import { getEnabledSkillsPrompt } from '../utils/skills'

/** Qwen/DashScope 兼容接口配置（阿里云百炼 / 通义） */
const QWEN_API = {
  baseUrl: import.meta.env.VITE_QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: import.meta.env.VITE_QWEN_API_KEY || '',
  model: import.meta.env.VITE_QWEN_MODEL || 'qwen-plus'
}

/**
 * 聊天核心逻辑 Hook
 * 管理消息列表、API 请求状态、流式响应处理；已适配 Qwen/DashScope 兼容接口
 *
 * @param {Array} initialMessages 初始消息列表
 * @returns {Object} 包含消息列表、发送函数、停止生成、刷新消息、提交选项等方法
 */

/**
 * 从消息 content 中解析 ```choices ... ``` 或 ```json ... ``` 块，提取并移除
 * @returns {{ content: string, choices: { type: 'single'|'multiple', options: Array<{value:string, label:string}> } | null }}
 */
function parseChoicesFromContent(content) {
  if (!content || typeof content !== 'string') return { content: content || '', choices: null }
  const choicesBlock = /```(?:choices|json)\s*\n([\s\S]*?)```/.exec(content)
  let raw = null
  if (choicesBlock) raw = choicesBlock[1].trim()
  if (!raw) return { content, choices: null }
  try {
    const data = JSON.parse(raw)
    const choices = data.choices || (data.type && data.options ? data : null)
    if (!choices || !Array.isArray(choices.options) || !['single', 'multiple'].includes(choices.type))
      return { content, choices: null }
    const cleaned = content.replace(choicesBlock[0], '').trim()
    return { content: cleaned, choices }
  } catch {
    return { content, choices: null }
  }
}

export default function useChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages)
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState(QWEN_API.model)
  const [isDeepThinking, setIsDeepThinking] = useState(false)
  const abortRef = useRef(null)

  const defaultOpsPrompt = `你是一个专业的 IT 运维专家助手。你的目标是帮助用户解决服务器管理、自动化脚本编写、故障排查、云原生架构（K8s, Docker）、CI/CD 流水线以及网络安全等方面的问题。
优先提供可执行的命令，并解释关键参数的含义。在给出具有破坏性的命令前发出明确的安全警告。回答风格简洁、专业。`

  /**
   * 发送消息
   * @param {string} userInput 用户输入的内容
   * @param {Array} historyOverride (可选)覆盖当前历史记录，用于重试等场景
   */
  const sendMessage = async (userInput, historyOverride, attachments = []) => {
    const base = historyOverride ?? messages
    // 1. 添加用户消息到列表（带附件元信息）
    const newMessages = [...base, { role: 'user', content: userInput, attachments }]
    setMessages(newMessages)
    setLoading(true)
    // 2. 预占位 assistant 消息，增加 reasoning 字段用于展示思考过程
    setMessages(prev => [...prev, { role: 'assistant', content: '', reasoning: '', feedback: null }])

    // 初始化 AbortController 用于中断请求
    abortRef.current = new AbortController()

    const systemPrompt = getEnabledSkillsPrompt(defaultOpsPrompt)
    const apiMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...newMessages.map(m => ({
        ...m,
        // 将附件 URL 列表附加到内容末尾，方便大模型获取文件位置
        content: m.attachments?.length
          ? `${m.content}\n\n[附件]\n${m.attachments.map(att => `- ${att.name}: ${att.url}`).join('\n')}`
          : m.content,
        attachments: undefined,
        reasoning: undefined,
        feedback: undefined,
        choices: undefined
      }))
    ]

    try {
      const response = await fetch(
        `${QWEN_API.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API.apiKey}`
          },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            model: isDeepThinking ? 'deepseek-r1' : model, // 使用支持推理的 deepseek-r1 模型
            messages: apiMessages,
            stream: true,
            stream_options: { include_usage: true }
          })
        }
      )

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        const msg = errBody.error?.message ?? errBody.message ?? errBody.msg ?? `请求失败 (${response.status})`
        throw new Error(msg)
      }

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
            const choice = JSON.parse(data)?.choices?.[0]
            const deltaContent = choice?.delta?.content || ''
            // 兼容不同 API 的推理字段名 (reasoning_content 或 reasoning)
            const deltaReasoning = choice?.delta?.reasoning_content || choice?.delta?.reasoning || ''
            
            // 实时更新最后一条消息内容，包含思考过程
            setMessages(prev => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              updated[updated.length - 1] = {
                ...last,
                content: last.content + deltaContent,
                reasoning: (last.reasoning || '') + deltaReasoning
              }
              return updated
            })
          } catch (e) { 
            console.log(e);
          }
        }
      }
      // 流式结束后解析 content 中的 choices 块并挂到消息上
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (!last || last.role !== 'assistant') return updated
        const { content: cleaned, choices } = parseChoicesFromContent(last.content)
        updated[updated.length - 1] = { ...last, content: cleaned, ...(choices ? { choices } : {}) }
        return updated
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errMsg = err.message && err.message !== 'Failed to fetch' ? err.message : '请求出错，请重试'
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: errMsg
          }
          return updated
        })
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * 提交用户对某条 assistant 消息中选项的选择，作为下一条用户消息发给 API
   * @param {number} messageIndex 该条 assistant 消息在 messages 中的下标
   * @param {string[]} selectedValues 选中的 option.value 列表（单选一个，多选多个）
   */
  const submitChoices = (messageIndex, selectedValues) => {
    const msg = messages[messageIndex]
    if (!msg?.choices?.options?.length || !selectedValues?.length) return
    const labels = msg.choices.options
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label)
    const content = `用户选择：${labels.join('、')}`
    const context = messages.slice(0, messageIndex + 1)
    sendMessage(content, context)
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
      updated[index] = { role: 'assistant', content: '', reasoning: '', feedback: null }
      return updated
    })
    setLoading(true)
    abortRef.current = new AbortController()

    const systemPrompt = getEnabledSkillsPrompt(defaultOpsPrompt)
    const apiMessages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...context.map(m => ({
        ...m,
        content: m.attachments?.length
          ? `${m.content}\n\n[附件]\n${m.attachments.map(att => `- ${att.name}: ${att.url}`).join('\n')}`
          : m.content,
        attachments: undefined,
        reasoning: undefined,
        feedback: undefined,
        choices: undefined
      }))
    ]

    try {
      const response = await fetch(
        `${QWEN_API.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${QWEN_API.apiKey}`
          },
          signal: abortRef.current.signal,
            body: JSON.stringify({
            model: isDeepThinking ? 'deepseek-r1' : model,
            messages: apiMessages,
            stream: true,
            stream_options: { include_usage: true }
          })
        }
      )

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        const msg = errBody.error?.message ?? errBody.message ?? errBody.msg ?? `请求失败 (${response.status})`
        throw new Error(msg)
      }

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
            const choice = JSON.parse(data)?.choices?.[0]
            const deltaContent = choice?.delta?.content || ''
            const deltaReasoning = choice?.delta?.reasoning_content || choice?.delta?.reasoning || ''
            
            setMessages(prev => {
              const updated = [...prev]
              const target = updated[index]
              updated[index] = {
                ...target,
                content: target.content + deltaContent,
                reasoning: (target.reasoning || '') + deltaReasoning
              }
              return updated
            })
          } catch (e) { 
            console.log(e);
          }
        }
      }
      setMessages(prev => {
        const updated = [...prev]
        const target = updated[index]
        if (!target || target.role !== 'assistant') return updated
        const { content: cleaned, choices } = parseChoicesFromContent(target.content)
        updated[index] = { ...target, content: cleaned, ...(choices ? { choices } : {}) }
        return updated
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errMsg = err.message && err.message !== 'Failed to fetch' ? err.message : '请求出错，请重试'
        setMessages(prev => {
          const updated = [...prev]
          updated[index] = { ...updated[index], content: errMsg }
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

  return { 
    messages, 
    setMessages, 
    loading, 
    sendMessage, 
    stopGenerate, 
    refreshMessage, 
    setFeedback, 
    submitChoices,
    model,
    setModel,
    isDeepThinking,
    setIsDeepThinking
  }
}
