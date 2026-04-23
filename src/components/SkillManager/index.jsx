import React, { useState, useEffect } from 'react'
import { X, Upload, Trash2, CheckCircle, Circle } from 'lucide-react'
import { loadSkills, saveSkills, parseSkillFile } from '../../utils/skills'
import { genId } from '../../utils/index'
import './index.css'

export default function SkillManager({ onClose }) {
  const [skills, setSkills] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    setSkills(loadSkills())
  }, [])

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newSkills = await Promise.all(
        Array.from(files).map(async (file) => {
          const { name, content } = await parseSkillFile(file)
          return {
            id: genId(),
            name,
            content,
            enabled: true
          }
        })
      )
      const updated = [...newSkills, ...skills]
      setSkills(updated)
      saveSkills(updated)
    } catch (err) {
      alert('上传失败: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const toggleSkill = (id) => {
    const updated = skills.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    )
    setSkills(updated)
    saveSkills(updated)
  }

  const deleteSkill = (id) => {
    const updated = skills.filter(s => s.id !== id)
    setSkills(updated)
    saveSkills(updated)
  }

  return (
    <div className="skill-manager-overlay" onClick={onClose}>
      <div className="skill-manager-modal" onClick={e => e.stopPropagation()}>
        <div className="skill-manager-header">
          <h3>技能管理 (Skills)</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="skill-manager-content">
          <p className="description">上传文本或 Markdown 文件作为 AI 的“技能”指令。启用的技能将作为系统提示词生效。</p>
          
          <label className="upload-skill-btn">
            <Upload size={16} />
            <span>{uploading ? '上传中...' : '上传技能文件'}</span>
            <input 
              type="file" 
              multiple 
              accept=".txt,.md" 
              onChange={handleUpload} 
              disabled={uploading}
              hidden
            />
          </label>

          <div className="skill-list">
            {skills.length === 0 ? (
              <div className="empty-state">暂无已上传的技能</div>
            ) : (
              skills.map(skill => (
                <div key={skill.id} className={`skill-item ${skill.enabled ? 'enabled' : 'disabled'}`}>
                  <div className="skill-info" onClick={() => toggleSkill(skill.id)}>
                    {skill.enabled ? <CheckCircle size={18} className="status-icon" /> : <Circle size={18} className="status-icon" />}
                    <span className="skill-name">{skill.name}</span>
                  </div>
                  <button className="delete-skill-btn" onClick={() => deleteSkill(skill.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
