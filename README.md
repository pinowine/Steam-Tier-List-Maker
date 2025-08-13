# Steam Tier List Maker 🎮

一个基于React的Steam游戏库Tier List制作工具，支持从Steam API自动导入游戏库，并以TierMaker风格展示和排序游戏。

## 功能特性

- ✅ **Steam集成**: 通过Steam ID和API密钥自动导入游戏库
- ✅ **智能过滤**: 自动剔除工具类软件（如Fences、Blender等）
- ✅ **可视化进度**: 实时显示游戏爬取进度
- ✅ **拖拽排序**: 类似TierMaker的拖拽界面
- ✅ **多语言支持**: 优先显示中文名称，自动fallback到英文
- ✅ **图片fallback**: 优先使用capsule图片，自动切换到header图片
- ✅ **手动添加**: 支持添加非Steam平台游戏
- ✅ **Steam ID搜索**: 通过游戏ID添加不在库中的游戏
- ✅ **本地存储**: 数据自动保存在浏览器本地

## 项目结构

``` md
steam-tier-list/
├── public/                 # 静态资源
├── src/
│   ├── components/        # React组件
│   │   ├── GameCard.jsx      # 游戏卡片
│   │   ├── TierList.jsx      # Tier列表主组件
│   │   ├── ProgressBar.jsx   # 进度条
│   │   ├── AddGameModal.jsx  # 添加游戏弹窗
│   │   └── SteamImporter.jsx # Steam导入器
│   ├── contexts/          # Context状态管理
│   │   └── AppContext.jsx
│   ├── services/          # API服务
│   │   └── steamApi.js
│   ├── styles/            # 样式文件
│   │   └── globals.css
│   ├── App.jsx            # 主应用组件
│   └── index.js           # 入口文件
├── .vscode/               # VS Code配置
│   └── launch.json
├── package.json
├── tailwind.config.js
├── netlify.toml
└── .gitignore
```

## 快速开始

### 前置要求

- Node.js 14.0+
- npm 6.0+
- Steam Web API密钥

### 安装步骤

1. **克隆或创建项目目录**
```bash
mkdir steam-tierlist
cd steam-tierlist
```

2. **复制所有项目文件到对应目录**

3. **运行初始化脚本**
```bash
chmod +x init.sh
./init.sh
```

或手动安装：
```bash
npm install
```

4. **启动开发服务器**
```bash
npm start
```

访问 http://localhost:3000 查看应用

## VS Code调试

1. 安装Chrome调试扩展：
   - 在VS Code扩展市场搜索 "Debugger for Chrome"
   - 安装扩展

2. 启动调试：
   - 按 `F5` 或点击调试面板的启动按钮
   - 选择 "Launch Chrome against localhost"
   - 会自动打开Chrome并连接到调试器

3. 设置断点：
   - 在代码编辑器左侧点击行号设置断点
   - 刷新浏览器页面触发断点

## 部署到Netlify

### 方法1: 通过GitHub

1. 将代码推送到GitHub仓库
2. 登录[Netlify](https://www.netlify.com/)
3. 点击 "New site from Git"
4. 选择GitHub仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `build`
6. 点击部署

### 方法2: 手动部署

1. 构建项目：
```bash
npm run build
```

2. 安装Netlify CLI：
```bash
npm install -g netlify-cli
```

3. 部署：
```bash
netlify deploy --prod --dir=build
```

## 使用说明

### 获取Steam API密钥

1. 访问 [Steam Web API页面](https://steamcommunity.com/dev/apikey)
2. 登录您的Steam账号
3. 填写域名（可以填写 localhost）
4. 获取API密钥

### 获取Steam ID

1. 访问您的Steam个人资料页面
2. 如果是自定义URL，可以使用 [Steam ID Finder](https://steamidfinder.com/)
3. 获取17位数字的Steam ID

### 导入游戏

1. 输入Steam ID和API密钥
2. 点击"开始导入"
3. 等待游戏数据加载完成
4. 开始拖拽游戏到不同层级

### 添加非Steam游戏

1. 点击"添加游戏"按钮
2. 选择添加方式：
   - **手动添加**: 输入游戏名称和图片URL
   - **Steam ID**: 通过游戏的Steam ID添加
   - **搜索Steam**: 搜索并选择游戏

## 技术栈

- **React 18**: 前端框架
- **Tailwind CSS**: 样式框架
- **@dnd-kit**: 拖拽功能库
- **Axios**: HTTP请求
- **Context API**: 状态管理
- **localStorage**: 数据持久化

## 注意事项

1. **API限制**: Steam API有请求频率限制，建议添加适当延迟
2. **跨域问题**: 使用公共CORS代理服务（corsproxy.io）
3. **数据安全**: API密钥仅保存在本地浏览器，不会上传到服务器
4. **浏览器兼容**: 推荐使用Chrome、Firefox、Edge等现代浏览器

## 常见问题

**Q: 为什么有些游戏图片无法显示？**
A: 部分游戏可能没有capsule图片，系统会自动尝试使用header图片或显示占位图。

**Q: 如何备份我的Tier List？**
A: 数据自动保存在浏览器localStorage中。可以通过导出功能生成图片保存。

**Q: 可以分享我的Tier List吗？**
A: 可以使用"导出为图片"功能生成图片分享到社交媒体。

## 开发计划

- [ ] 添加导出为图片功能
- [ ] 支持导入/导出JSON数据
- [ ] 添加更多平台支持（Epic、GOG等）
- [ ] 优化移动端体验
- [ ] 添加游戏标签和分类筛选
- [ ] 支持多个Tier List管理

## License

MIT

## 贡献

欢迎提交Issue和Pull Request！

---

Made with ❤️ for gamers