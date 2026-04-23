import { describe, it, expect, beforeEach } from 'vitest'
import { loadSkills, saveSkills, getEnabledSkillsPrompt } from './skills'

describe('Utils: skills', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadSkills should return empty array initially', () => {
    expect(loadSkills()).toEqual([])
  })

  it('saveSkills and loadSkills should work correctly', () => {
    const skills = [{ id: '1', name: 'Skill 1', content: 'content', enabled: true }]
    saveSkills(skills)
    expect(loadSkills()).toEqual(skills)
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
  })

  it('getEnabledSkillsPrompt should return empty string when no skills enabled', () => {
    saveSkills([{ id: '1', name: 'Skill 1', content: 'Content 1', enabled: false }])
    expect(getEnabledSkillsPrompt()).toBe('')
  })
})
