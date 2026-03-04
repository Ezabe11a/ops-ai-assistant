import { Plus, MessageSquare, Trash2, Menu } from 'lucide-react'

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
    <div style={{
      width: isOpen ? '260px' : '60px',
      minWidth: isOpen ? '260px' : '60px',
      height: '100vh',
      background: '#f9f9fa',
      borderRight: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: '#333',
      transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
      position: 'relative'
    }}>
      {/* 顶部折叠按钮 */}
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        minHeight: '60px'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title={isOpen ? "收起侧边栏" : "展开侧边栏"}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* 新建对话按钮 */}
      <div style={{ padding: isOpen ? '0 16px 16px 16px' : '0 8px 16px 8px' }}>
        <button
          onClick={onNew}
          style={{
            width: '100%',
            padding: isOpen ? '10px 16px' : '10px 0',
            background: isOpen ? '#e6dfd8' : 'transparent',
            color: '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isOpen ? '8px' : '0',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = isOpen ? '#d9d2cc' : '#e5e5e5'}
          onMouseLeave={e => e.currentTarget.style.background = isOpen ? '#e6dfd8' : 'transparent'}
          title="新对话"
        >
          <Plus size={isOpen ? 16 : 20} />
          {isOpen && '新对话'}
        </button>
      </div>

      {/* 历史会话列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isOpen ? '0 12px' : '0 8px', overflowX: 'hidden' }}>
        {sessions.length === 0 && isOpen && (
          <div style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            暂无历史记录
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isOpen ? 'stretch' : 'center' }}>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="session-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'space-between' : 'center',
                padding: isOpen ? '10px 12px' : '10px 0',
                width: isOpen ? 'auto' : '40px',
                height: isOpen ? 'auto' : '40px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: s.id === currentId ? '#eaeaea' : 'transparent',
                color: '#333',
                fontSize: '14px',
                transition: 'background 0.15s',
                position: 'relative'
              }}
              onMouseEnter={e => {
                if (s.id !== currentId) e.currentTarget.style.background = '#f0f0f0'
                if (isOpen) e.currentTarget.querySelector('.delete-btn').style.opacity = '1'
              }}
              onMouseLeave={e => {
                if (s.id !== currentId) e.currentTarget.style.background = 'transparent'
                if (isOpen) e.currentTarget.querySelector('.delete-btn').style.opacity = '0'
              }}
              title={!isOpen ? s.title : ''}
            >
              {isOpen ? (
                <>
                  <span style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <MessageSquare size={14} />
                    {s.title || '新对话'}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={e => { e.stopPropagation(); onDelete(s.id) }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '4px',
                      borderRadius: '4px',
                      opacity: 0,
                      transition: 'opacity 0.2s, color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff4d4f'}
                    onMouseLeave={e => e.currentTarget.style.color = '#999'}
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
      </div>

      {/* 底部用户信息 */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e5e5',
        color: '#666',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'flex-start' : 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#d1ccc7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: 'white',
          flexShrink: 0
        }}>
          AI
        </div>
        {isOpen && 'qwen'}
      </div>
    </div>
  )
}
