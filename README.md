# Omini-Notifier

[English](#english) | [中文](#中文)

---

## English

### Background
Many AI users, including myself and my friends, still prefer the web versions of various AI platforms. However, waiting for long generations can be tedious, often requiring frequent tab-switching just to check if the response is finished. 

**Omini-Notifier** is a Chrome extension designed to solve this by providing system notifications when an AI generation completes, allowing you to focus on other tasks.

> [!NOTE]
> As of March 30, 2026, we are still waiting to see when official notification features will be integrated by these platforms.

### Features
- **Dual Detection**: Combines DOM monitoring (observing "Stop" buttons) and Network interception (monitoring streaming completion) for maximum reliability.
- **Bilingual Support**: Specifically optimized for both Chinese and English AI interfaces.
- **Multi-Platform**: Support for Gemini, ChatGPT, DeepSeek, Kimi, Doubao, Yuanbao, Tongyi, and Minimax.
- **Notification Cooldown**: Prevents redundant alerts from flickering UI elements.

### Supported Platforms
- Google Gemini ☑️
- OpenAI ChatGPT ☑️
- DeepSeek ☑️
- Moonshot Kimi ☑️
- ByteDance Doubao (豆包) ☑️
- Tencent Yuanbao (元宝) ☑️
- Alibaba Tongyi (通义)
- Minimax (Official Notification Built-in)

### Installation

#### For Users

1. Go to the [Releases](https://github.com/copywrite-ai/omini-notifier/releases) page
2. Download the latest `.zip` file from the release assets
3. Extract the `.zip` file to a folder on your computer
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable **Developer mode** (toggle in the top-right corner)
6. Click **Load unpacked** and select the extracted folder
7. The extension will now appear in your browser toolbar

#### For Developers

1. Clone the repository:
   ```bash
   git clone https://github.com/copywrite-ai/omini-notifier.git
   cd omini-notifier
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the cloned `omini-notifier` directory
6. The extension will now appear in your browser toolbar

> [!NOTE]
> After making code changes, click the refresh icon (🔄) on the extension card in `chrome://extensions/` to reload.

---

## 中文

### 背景
我和我周围的很多朋友仍然在使用 Web 版的 AI。在等待长文本生成时，我们需要不断地切换标签页来检查是否生成完成，这非常耗时且打断思路。

**Omini-Notifier** 是一款 Chrome 浏览器扩展，旨在解决这个问题。它能在 AI 生成完成时发送系统通知，让你无需一直等待或反复检查。

> [!NOTE]
> 截至 2026 年 3 月 30 日，我们仍在观望和等待官方什么时候会加入这样的通知提示。

### 功能特点
- **双重检测**: 结合了 DOM 监控（观察"停止"按钮）和网络拦截（监控流式传输完成），确保检测的高可靠性。
- **多平台支持**: 已针对 Gemini, ChatGPT, DeepSeek, Kimi, 豆包, 元宝, 通义, Minimax 等主流平台进行优化。
- **防止重复提醒**: 内置冷却机制，避免因某些平台 UI 抖动导致的重复通知。

### 支持平台
- Google Gemini ☑️
- OpenAI ChatGPT ☑️
- DeepSeek ☑️
- Moonshot Kimi ☑️
- 字节跳动 豆包 ☑️
- 腾讯 元宝 ☑️
- 阿里巴巴 通义
- Minimax（官方已内置通知）

### 安装

#### 普通用户

1. 前往 [Releases](https://github.com/copywrite-ai/omini-notifier/releases) 页面
2. 下载最新版本的 `.zip` 文件
3. 将 `.zip` 文件解压到电脑上的一个文件夹
4. 打开 Chrome，访问 `chrome://extensions/`
5. 开启右上角的 **开发者模式**
6. 点击 **加载已解压的扩展程序**，选择刚才解压的文件夹
7. 扩展将出现在浏览器工具栏中

#### 开发者

1. 克隆仓库：
   ```bash
   git clone https://github.com/copywrite-ai/omini-notifier.git
   cd omini-notifier
   ```
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择克隆下来的 `omini-notifier` 目录
6. 扩展将出现在浏览器工具栏中

> [!NOTE]
> 修改代码后，在 `chrome://extensions/` 页面点击扩展卡片上的刷新图标（🔄）即可重新加载。

---

## Build & Release / 构建与发布

### Build the extension / 构建扩展

Run the build script to create a distributable `.zip` package:

```bash
./build.sh
```

This will create `omini-notifier-v{version}.zip` in the `dist/` directory.

### Create a GitHub Release / 创建 GitHub Release

```bash
# 1. Tag the version / 打版本标签
git tag v1.0.0
git push origin v1.0.0

# 2. Create a release on GitHub (using GitHub CLI) / 使用 gh 命令创建 Release
gh release create v1.0.0 dist/omini-notifier-v1.0.0.zip \
  --title "v1.0.0" \
  --notes "Initial release with support for Gemini, ChatGPT, DeepSeek, Kimi, Doubao, and Yuanbao."
```

> [!TIP]
> To publish to a wider audience, consider submitting to the [Chrome Web Store](https://chrome.google.com/webstore/devconsole) ($5 one-time developer registration fee).
>
> 如需面向更广泛的用户群体发布，建议提交至 [Chrome Web Store](https://chrome.google.com/webstore/devconsole)（一次性 $5 开发者注册费）。
