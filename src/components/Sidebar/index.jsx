import { Plus, MessageSquare, Trash2, Menu } from 'lucide-react'
import './index.css'

/**
 * 侧边栏组件
 * 
 * @param {Array} sessions 会话列表
 * @param {string} currentId 当前选中会话ID
 * @param {Function} onSelect 选择会话回调
 * @param {Function} onNew 新建会话回调
 * @param {Function} onDelete 删除会话回调
 * @param {boolean} isOpen 侧边栏是否展开
 * @param {Function} onClose 切换侧边栏状态回调
 */
export default function Sidebar({ sessions, currentId, onSelect, onNew, onDelete, isOpen, onClose }) {
  return (
    <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
      {/* 顶部折叠按钮 */}
      <div className={`sidebar-header ${isOpen ? 'open' : 'closed'}`}>
        <button
          onClick={onClose}
          className="sidebar-toggle-btn"
          title={isOpen ? "收起侧边栏" : "展开侧边栏"}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* 新建对话按钮 */}
      <div className={`new-chat-section ${isOpen ? 'open' : 'closed'}`}>
        <button
          onClick={onNew}
          className={`new-chat-btn ${isOpen ? 'open' : 'closed'}`}
          title="新对话"
        >
          <Plus size={isOpen ? 16 : 20} />
          {isOpen && '新对话'}
        </button>
      </div>

      {/* 历史会话列表 */}
      <div className={`history-list ${isOpen ? 'open' : 'closed'}`}>
        {sessions.length === 0 && isOpen && (
          <div className="empty-history">
            暂无历史记录
          </div>
        )}
        {sessions.map(s => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`session-item ${s.id === currentId ? 'active' : ''} ${isOpen ? 'open' : 'closed'}`}
            title={!isOpen ? s.title : ''}
          >
            {isOpen ? (
              <>
                <span className="session-item-content">
                  <MessageSquare size={14} />
                  {s.title || '新对话'}
                </span>
                <button
                  className="delete-btn"
                  onClick={e => { e.stopPropagation(); onDelete(s.id) }}
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <MessageSquare size={18} color="#666" />
            )}
          </div>
        ))}
      </div>

      {/* 底部用户信息 */}
      <div className={`sidebar-footer ${isOpen ? 'open' : 'closed'}`}>
        <div className="footer-avatar">
          AI
        </div>
        {isOpen && 'qwen'}
      </div>
    </div>
  )
}
