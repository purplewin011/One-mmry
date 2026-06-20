# OneMmry (一念记忆)

OneMmry 是一个基于 Vue 3 打造的**沉浸式个人记忆管理系统**。它将传统的物理书架体验与数字化记录相结合，通过精致的视觉动画和交互设计，为您提供一个存放日记、相册和视频记忆的私密空间。

![Dashboard Preview](https://via.placeholder.com/1200x600?text=OneMmry+Dashboard+Preview)

## ✨ 项目特色

- **📖 沉浸式数字书架**：采用拟物化设计，将日记本、相册和录像带分类陈列于三层书架之上，横向滚动流畅。
- **📝 动态仿真翻页**：内置基于 CSS 3D 转换的仿真日记本（`DiaryReader`），提供真实的物理翻页触感与视觉回馈。
- **🎬 多媒体集成**：
  - **影像珍藏馆 (ALBUMS)**：专门用于存放和浏览珍贵照片。
  - **时光录像带 (RECORDS)**：支持视频记忆的归档与回放。
- **🎨 极简情感化视觉**：结合动态视频背景与渐变遮罩，营造出宁静、私密的记录氛围。
- **⚡ 现代技术栈**：利用 Vue 3 的高效响应式系统，辅以 Tailwind CSS 进行快速 UI 构建，并使用 Framer Motion 处理丝滑动画。

## 🛠️ 技术栈

- **框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **动画**: [Framer Motion (Vue wrapper)](https://www.framer.com/motion/)
- **图标**: [Lucide Vue Next](https://lucide.dev/)
- **预处理器**: Sass (SCSS)

## 🚀 快速开始

### 准备工作

确保您的本地环境已安装 [Node.js](https://nodejs.org/) (建议 v18.0.0+)。

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/onemmry.git
   cd onemmry
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

## 📂 目录结构

```text
src/
├── components/         # 核心组件库
│   ├── AlbumReader.vue # 相册阅读器
│   ├── DiaryReader.vue # 仿真翻页日记本
│   ├── ShelfRow.vue    # 书架行组件
│   ├── ShelfItem.vue   # 单个书架物品（书籍/相册/录像带）
│   └── VideoReader.vue # 视频播放器
├── App.vue             # 应用主入口（书架主界面）
├── main.js             # Vue 注入与全局配置
└── style.css           # 全局样式与 Tailwind 指令
```

## 🚧 开发计划 (Roadmap)

- [ ] 支持用户登录与云端同步功能。
- [ ] 增加更多仿真皮肤（皮质封面、复古怀旧风格）。
- [ ] 支持 Markdown 格式写入日记。
- [ ] 相册组件增加幻灯片播放模式。

## 📄 许可证

本项目采用 MIT 许可证。

---

*“记录生活，承载珍贵 —— 让每一个瞬间都有处可寻。”*

