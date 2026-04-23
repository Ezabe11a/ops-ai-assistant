import { useState } from 'react'
import { Brain, ChevronDown, ChevronRight } from 'lucide-react'
import './index.css'

/**
 * 思考过程展示组件
 * 
 * @param {string} reasoning 思考内容
 * @param {boolean} isLast 是否是最后一条消息（用于显示正在思考状态）
 * @param {boolean} hasContent 是否已有正式回答内容
 */
export default function ReasoningProcess({ reasoning, isLast, hasContent }) {
  const [showReasoning, setShowReasoning] = useState(true)

  if (!reasoning && !(isLast && !hasContent)) return null

  return (
    <div className="message-reasoning-container">
      <button 
        className="message-reasoning-toggle" 
        onClick={() => setShowReasoning(!showReasoning)}
        disabled={!reasoning && isLast}
      >
        <div className="message-reasoning-label">
          <Brain size={14} className={`reasoning-icon ${isLast && !reasoning ? 'anim-pulse' : ''}`} />
          <span>
            {!reasoning && isLast ? '正在思考...' : `已思考 ${reasoning?.length > 1000 ? (reasoning.length / 1000).toFixed(1) + 'k' : (reasoning?.length || 0)} 字`}
          </span>
        </div>
        {reasoning && (showReasoning ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
      </button>
      {showReasoning && reasoning && (
        <div className="message-reasoning-content">
          {reasoning}
        </div>
      )}
    </div>
  )
}
