# 🚀 Ops AI Assistant (运维助手)

[![React](https://img.shields.io/badge/React-19.2-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-FCC72C.svg?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

这是一个基于 React 构建的现代化 AI 聊天助手应用，专为运维场景设计。界面风格参考 Claude，简洁高效，支持 Markdown 渲染、代码高亮、流式响应以及会话历史管理。

> [!TIP]
> 运维助手的核心优势在于“技能增强”功能，可以通过简单的 Markdown 文件定义 AI 的专业能力。

<!-- 屏幕截图占位符 -->
<!-- <p align="center">
  <img src="path/to/screenshot.png" alt="Ops AI Assistant Screenshot" width="800">
</p> -->

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
  - 附件上传：前端选择文件 → 上传到你提供的后端 → 将返回的 URL 附在提问文本中，让模型读取/后端解析。
- **技能增强 (Skills)**：支持上传 `.txt` 或 `.md` 文件作为 AI 的“技能”指令。启用的技能将自动作为 System Prompt 注入对话，实现个性化角色定制或特定任务增强。

## 🛠️ 技术栈

- **核心框架**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **测试框架**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
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

在项目根目录创建 `.env` 文件，配置 **Qwen/通义（DashScope 兼容模式）** 接口：

```env
# 必填：在阿里云百炼/Model Studio 获取 API Key
VITE_QWEN_API_KEY=your_api_key_here

# 可选：不填则默认使用国内 DashScope 兼容地址
# 国内: https://dashscope.aliyuncs.com/compatible-mode/v1
# 国际(新加坡): https://dashscope-intl.aliyuncs.com/compatible-mode/v1
# 美国(弗吉尼亚): https://dashscope-us.aliyuncs.com/compatible-mode/v1
VITE_QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 可选：模型名称，默认 qwen-plus（可改为 qwen-turbo / qwen-max 等）
VITE_QWEN_MODEL=qwen-plus

# （可选）附件上传/解析后端接口：前端只上传文件，不做解析
# VITE_UPLOAD_URL=https://your-backend/upload
# 可选鉴权 token
# VITE_UPLOAD_TOKEN=your_token
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并查看结果
npm run test:run
```

### 6. 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── ChatWindow/      # 聊天主窗口
│   ├── Layout/          # 整体布局组件
│   ├── MessageItem/     # 单条消息渲染组件
│   ├── ReasoningProcess/# 推理过程显示组件
│   ├── Sidebar/         # 侧边栏
│   └── SkillManager/    # 技能管理器
├── hooks/               # 自定义 Hooks
│   └── useChat.jsx      # 聊天核心逻辑封装
├── test/                # 测试配置
│   └── setup.js         # Vitest 配置
├── utils/               # 工具函数
│   ├── index.js         # ID 生成、本地存储封装
│   ├── skills.js        # 技能管理逻辑
│   └── upload.js        # 附件上传逻辑
├── App.jsx              # 应用入口与布局
├── App.css              # 应用全局样式
└── main.jsx             # React 挂载点
```

## 📝 开发规范

- 使用 Functional Components 和 Hooks。
- 组件采用目录结构管理（`index.jsx` + `index.css`），实现样式与逻辑分离。
- 所有的 API 请求逻辑封装在 `useChat` hook 中。
- 遵循单一职责原则，复杂的逻辑提取为单独的 Hook 或 Utility 函数。

## 📎 附件上传与后端解析规范

前端不解析文件内容，只负责上传到后端并把后端返回的可访问 URL 附在问题末尾。未配置 `VITE_UPLOAD_URL` 时，选择附件会提示并阻止发送。

**接口约定（自行实现）：**

- `POST {VITE_UPLOAD_URL}`
- `Content-Type: multipart/form-data`
- 字段：`file`（单文件）
- 返回 JSON：`{ "url": "https://your-domain/path/file.xxx" }`
  - `url` 应为模型可访问的链接（公网或当前网络可达）
- 鉴权：若需要，前端会带 `Authorization: Bearer <VITE_UPLOAD_TOKEN>`

## 🤝 贡献指南

1. Fork 本仓库。
2. 创建新的功能分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)。
4. 推送到分支 (`git push origin feature/AmazingFeature`)。
5. 开启一个 Pull Request。

## 📄 License

MIT
