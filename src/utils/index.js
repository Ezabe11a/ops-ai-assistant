// ===== 工具函数 =====

/**
 * 生成随机 ID
 */
export const genId = () => Math.random().toString(36).slice(2, 10)

/**
 * 从 localStorage 加载会话记录
 */
export const loadSessions = () => {
  try {
    return JSON.parse(localStorage.getItem('chat_sessions') || '[]')
  } catch { return [] }
}

/**
 * 保存会话记录到 localStorage
 */
export const saveSessions = (sessions) => {
  localStorage.setItem('chat_sessions', JSON.stringify(sessions))
}
