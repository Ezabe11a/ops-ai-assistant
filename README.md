# Ops AI Assistant (运维助手)

这是一个基于 React 构建的现代化 AI 聊天助手应用，专为运维场景设计。界面风格参考 Claude，简洁高效，支持 Markdown 渲染、代码高亮、流式响应以及会话历史管理。

## ✨ 功能特性

- **多会话管理**：支持创建新对话、保存历史记录、删除对话。
- **流式响应**：基于 Server-Sent Events (SSE) 实现打字机效果的实时回复。
- **Markdown 支持**：完美支持 GFM (GitHub Flavored Markdown)，包括表格、代码块、列表等。
- **HTML 渲染**：支持 `<br>` 等基础 HTML 标签的渲染。
- **现代化 UI**：
  - 响应式侧边栏（支持展开/收起，收起模式下显示图标）。
  - 扁平化设计，使用 Lucide React 图标库。
  - 自动跟随滚动的聊天窗口。
- **交互优化**：
  - 支持消息复制。
  - 支持重新生成回答。
  - 支持点赞/点踩反馈。
  - 停止生成功能。

## 🛠️ 技术栈

- **核心框架**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **UI 图标**: [Lucide React](https://lucide.dev/)
- **Markdown 渲染**: 
  - [react-markdown](https://github.com/remarkjs/react-markdown)
  - [remark-gfm](https://github.com/remarkjs/remark-gfm) (表格、任务列表支持)
  - [remark-breaks](https://github.com/remarkjs/remark-breaks) (硬换行支持)
  - [rehype-raw](https://github.com/rehypejs/rehype-raw) (HTML 标签支持)
- **API 集成**: Fetch API (配合 AbortController 实现请求中断)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ops-ai-assistant
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件，并添加以下配置（使用阿里云 DashScope API 或兼容 OpenAI 格式的 API）：

```env
VITE_QWEN_API_KEY=your_api_key_here
VITE_QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
src/
├── components/        # UI 组件
│   ├── ChatWindow.jsx # 聊天主窗口（消息列表 + 输入框）
│   ├── MessageItem.jsx# 单条消息渲染组件
│   └── Sidebar.jsx    # 侧边栏（历史会话管理）
├── hooks/             # 自定义 Hooks
│   └── useChat.jsx    # 聊天核心逻辑封装
├── utils/             # 工具函数
│   └── index.js       # ID 生成、本地存储封装
├── App.jsx            # 应用入口与布局
└── main.jsx           # React 挂载点
```

## 📝 开发规范

- 使用 Functional Components 和 Hooks。
- 样式主要使用 Inline Styles (CSS-in-JS) 以便于快速迭代和动态样式处理。
- 所有的 API 请求逻辑封装在 `useChat` hook 中。

## 📄 License

MIT
