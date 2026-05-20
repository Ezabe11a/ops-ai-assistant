/**
 * 技能管理工具
 * 负责从 localStorage 加载、保存和解析技能文件内容
 */

const SKILLS_STORAGE_KEY = 'chat_skills'

const DEFAULT_OPS_SKILL = {
  id: 'default-ops-expert',
  name: 'Lumiq 运维专家 (内置)',
  content: `你是一个专业的 IT 运维专家助手。你的目标是帮助用户解决服务器管理、自动化脚本编写、故障排查、云原生架构（K8s, Docker）、CI/CD 流水线以及网络安全等方面的问题。
优先提供可执行的命令，并解释关键参数的含义。在给出具有破坏性的命令前发出明确的安全警告。回答风格简洁、专业。`,
  enabled: true,
  isBuiltIn: true
}

/**
 * 加载所有已上传的技能（包含内置技能）
 * @returns {Array<{id: string, name: string, content: string, enabled: boolean, isBuiltIn?: boolean}>}
 */
export const loadSkills = () => {
  try {
    const userSkills = JSON.parse(localStorage.getItem(SKILLS_STORAGE_KEY) || '[]')
    // 检查内置技能是否已存在于用户列表中（根据ID判断）
    const hasDefault = userSkills.some(s => s.id === DEFAULT_OPS_SKILL.id)
    if (!hasDefault) {
      return [DEFAULT_OPS_SKILL, ...userSkills]
    }
    // 如果存在，需要确保内置技能的内容是最新的，但保留用户的启用状态
    return userSkills.map(s => {
      if (s.id === DEFAULT_OPS_SKILL.id) {
        return { ...DEFAULT_OPS_SKILL, enabled: s.enabled }
      }
      return s
    })
  } catch {
    return [DEFAULT_OPS_SKILL]
  }
}

/**
 * 保存技能列表（过滤掉纯内置状态，或者整体保存）
 * @param {Array} skills 
 */
export const saveSkills = (skills) => {
  localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skills))
}

/**
 * 解析上传的技能文件
 * @param {File} file 
 * @returns {Promise<{name: string, content: string}>}
 */
export const parseSkillFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        name: file.name.replace(/\.[^/.]+$/, ""), // 移除后缀作为名称
        content: e.target.result
      })
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

/**
 * 获取当前所有已启用的技能内容拼接后的字符串
 * @param {string} defaultPrompt 可选的默认提示词内容
 * @returns {string}
 */
export const getEnabledSkillsPrompt = (defaultPrompt = '') => {
  const skills = loadSkills()
  const enabledContent = skills
    .filter(s => s.enabled)
    .map(s => `### Skill: ${s.name}\n${s.content}`)
    .join('\n\n')
  
  if (!enabledContent) return defaultPrompt
  
  return `You have the following special skills/instructions enabled:\n\n${enabledContent}${defaultPrompt ? '\n\n' + defaultPrompt : ''}`
}
