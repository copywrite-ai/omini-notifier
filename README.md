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
- **Multi-Platform**: Support for Gemini, ChatGPT, Doubao, Yuanbao, Tongyi, and Minimax.
- **Notification Cooldown**: Prevents redundant alerts from flickering UI elements.

### Supported Platforms
- Google Gemini
- OpenAI ChatGPT
- ByteDance Doubao (豆包)
- Tencent Yuanbao (元宝)
- Alibaba Tongyi (通义)
- Minimax

---

## 中文

### 背景
我和我周围的很多朋友仍然在使用 Web 版的 AI。在等待长文本生成时，我们需要不断地切换标签页来检查是否生成完成，这非常耗时且打断思路。

**Omini-Notifier** is a Chrome extension设计用于解决这个问题。它能在 AI 生成完成时发送系统通知，让你无需一直等待或反复检查。

> [!NOTE]
> 截至 2026 年 3 月 30 日，我们仍在观望和等待官方什么时候会加入这样的通知提示。

### 功能特点
- **双重检测**: 结合了 DOM 监控（观察“停止”按钮）和网络拦截（监控流式传输完成），确保检测的高可靠性。
- **多平台支持**: 已针对 Gemini, ChatGPT, 豆包, 元宝, 通义, Minimax 等主流平台进行优化。
- **防止重复提醒**: 内置冷却机制，避免因某些平台 UI 抖动导致的重复通知。

### 支持平台
- Google Gemini
- OpenAI ChatGPT
- 字节跳动 豆包
- 腾讯 元宝
- 阿里巴巴 通义
- Minimax
