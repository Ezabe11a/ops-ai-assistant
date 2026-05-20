import { describe, it, expect, beforeEach } from 'vitest'
import { loadSkills, saveSkills, getEnabledSkillsPrompt } from './skills'

describe('Utils: skills', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadSkills should return built-in ops skill initially', () => {
    const skills = loadSkills()
    expect(skills).toHaveLength(1)
    expect(skills[0].id).toBe('default-ops-expert')
    expect(skills[0].enabled).toBe(true)
    expect(skills[0].isBuiltIn).toBe(true)
  })

  it('saveSkills and loadSkills should work correctly', () => {
    const skills = [{ id: '1', name: 'Skill 1', content: 'content', enabled: true }]
    saveSkills(skills)
    const loaded = loadSkills()
    // 内置技能始终存在
    expect(loaded).toHaveLength(2)
    expect(loaded[0].id).toBe('default-ops-expert')
    expect(loaded[1]).toEqual(skills[0])
  })

  it('getEnabledSkillsPrompt should return formatted prompt for enabled skills', () => {
    const skills = [
      { id: '1', name: 'Skill 1', content: 'Content 1', enabled: true },
      { id: '2', name: 'Skill 2', content: 'Content 2', enabled: false }
    ]
    saveSkills(skills)
    const prompt = getEnabledSkillsPrompt()
    expect(prompt).toContain('Skill 1')
    expect(prompt).toContain('Content 1')
    expect(prompt).not.toContain('Skill 2')
    expect(prompt).not.toContain('Content 2')
    // 内置技能也包含在内
    expect(prompt).toContain('Lumiq 运维专家')
  })

  it('getEnabledSkillsPrompt should return empty string when only built-in skill is disabled', () => {
    const skills = [
      { id: 'default-ops-expert', name: 'Lumiq 运维专家 (内置)', content: 'content', enabled: false, isBuiltIn: true },
      { id: '1', name: 'Skill 1', content: 'Content 1', enabled: false }
    ]
    saveSkills(skills)
    expect(getEnabledSkillsPrompt()).toBe('')
  })
})
