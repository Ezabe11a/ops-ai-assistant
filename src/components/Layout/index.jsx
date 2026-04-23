import React from 'react'
import './index.css'

/**
 * 通用布局组件
 * 负责页面左右布局结构：侧边栏 + 主内容区
 * 
 * @param {React.ReactNode} sidebar 侧边栏内容
 * @param {React.ReactNode} children 主内容区（聊天窗口）
 */
export default function Layout({ sidebar, children }) {
  return (
    <div className="app-layout">
      <aside className="app-sidebar-wrapper">
        {sidebar}
      </aside>
      <main className="app-main-wrapper">
        {children}
      </main>
    </div>
  )
}
