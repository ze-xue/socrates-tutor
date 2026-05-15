# 苏格拉底式AI学习助手 (Socrates AI Tutor)

## 🎯 项目简介

基于大模型的苏格拉底式学习工具。学生提交题目后，AI不直接给答案，而是通过连续引导性问题帮助学生自行思考、逐步解决。

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🤖 苏格拉底对话 | AI通过clarification/hint/reflection/challenge四类问题引导，绝不泄露答案 |
| 📷 多模态识别 | 支持拍照上传题目、PDF/Word/TXT文档解析 |
| 📊 能力雷达图 | 实时评估审题分析、知识运用、逻辑推理、验证反思四维能力 |
| 🧭 思维时间线 | 可视化追踪每轮对话的引导类型和思维演进 |
| 🎤 语音交互 | 语音输入 + AI回复TTS朗读（5种可选音色） |
| 📋 学习报告 | 一键生成PDF（含完整对话、思维导图、生成性评价） |
| 🎭 角色切换 | 耐心导师/幽默导师两种模式 |

## 🛠 技术栈

- **前端**：React 18 + Vite + TypeScript + TailwindCSS
- **UI 风格**：Slate/Indigo 现代极简设计
- **Markdown 渲染**：react-markdown + remark-gfm
- **图表**：Recharts（雷达图）
- **大模型**：阿里云 DashScope Qwen3.5-Omni-Plus（多模态）
- **语音合成**：DashScope CosyVoice TTS
- **语音识别**：Web Speech API
- **状态管理**：Zustand
- **后端代理**：Node.js + Express
- **文件解析**：pdfjs-dist + mammoth.js
- **PDF 生成**：jsPDF + html2canvas

## 🚀 快速开始

### 1. 安装依赖

```bash
cd socrates-tutor
npm install
```

### 2. 配置 API Key

编辑 `.env`：

```
DEEPSEEK_API_KEY=sk-你的DashScope-API-Key
```

> ⚠️ Key 保存在服务端，不暴露给前端。

### 3. 启动

```bash
npm start
```

浏览器访问 `http://localhost:5173`

## 📁 项目结构

```
socrates-tutor/
├── server/
│   └── index.js              # Express代理（/api/chat + /api/tts）
├── src/
│   ├── components/
│   │   ├── ChatWindow.tsx     # 消息列表
│   │   ├── MessageBubble.tsx  # 消息气泡（Markdown渲染+朗读）
│   │   ├── InputArea.tsx      # 输入区（文本/上传/语音/TTS）
│   │   ├── TimelinePanel.tsx  # 思维时间线
│   │   ├── RadarChart.tsx     # Recharts雷达图
│   │   └── ReportGenerator.tsx # PDF学习报告
│   ├── store/
│   │   └── useAppStore.ts     # Zustand状态
│   ├── utils/
│   │   ├── api.ts             # API调用+JSON提取+LaTeX修复
│   │   ├── fileParser.ts      # PDF/Word/图片解析
│   │   └── systemPrompt.ts    # 苏格拉底提示词
│   ├── types.ts
│   ├── App.tsx                # 主布局（双栏设计）
│   └── main.tsx
├── .env
└── tailwind.config.js
```

## 🎨 配色

- 主背景：#F8FAFC（Slate 50）
- 主色调：Indigo 600
- 文字：Slate 700/800
- 点缀：Emerald / Amber / Purple（按引导类型）

## 🎤 音色

| ID | 名称 | 描述 |
|----|------|------|
| xiaochun | 小春 | 温柔女声（默认） |
| xiaoxia | 小夏 | 活泼女声 |
| xiaoyue | 小月 | 知性女声 |
| laotie | 老铁 | 沉稳男声 |
| chengge | 诚哥 | 温暖男声 |

## 📝 使用说明

1. 选择导师角色和音色
2. 输入题目文字，或点击📎上传图片/文档
3. 点击🎤使用语音输入
4. AI用引导性问题回复（不是答案）
5. 右侧面板显示雷达图和思维时间线
6. 开启朗读开关自动TTS播报AI回复
7. 点击「生成阶段评估报告」导出PDF
