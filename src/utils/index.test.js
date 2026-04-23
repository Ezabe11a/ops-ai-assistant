import { describe, it, expect, vi, beforeEach } from 'vitest'
import { genId, loadSessions, saveSessions } from './index'

describe('Utils: index', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('genId should return a string of length 8', () => {
    const id = genId()
    expect(typeof id).toBe('string')
    expect(id.length).toBe(8)
  })

  it('loadSessions should return empty array when localStorage is empty', () => {
    expect(loadSessions()).toEqual([])
  })

  it('saveSessions and loadSessions should work correctly', () => {
    const sessions = [{ id: '1', title: 'test', messages: [] }]
    saveSessions(sessions)
    expect(loadSessions()).toEqual(sessions)
  })

  it('loadSessions should handle invalid JSON', () => {
    localStorage.setItem('chat_sessions', 'invalid json')
    expect(loadSessions()).toEqual([])
  })
})
