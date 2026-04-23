/**
 * 技能管理工具
 * 负责从 localStorage 加载、保存和解析技能文件内容
 */

const SKILLS_STORAGE_KEY = 'chat_skills'

/**
 * 加载所有已上传的技能
 * @returns {Array<{id: string, name: string, content: string, enabled: boolean}>}
 */
export const loadSkills = () => {
  try {
    return JSON.parse(localStorage.getItem(SKILLS_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * 保存技能列表
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
 * @returns {string}
 */
export const getEnabledSkillsPrompt = () => {
  const skills = loadSkills()
  const enabledContent = skills
    .filter(s => s.enabled)
    .map(s => `### Skill: ${s.name}\n${s.content}`)
    .join('\n\n')
  
  if (!enabledContent) return ''
  
  return `You have the following special skills/instructions enabled:\n\n${enabledContent}`
}
