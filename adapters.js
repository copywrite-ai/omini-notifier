/**
 * AI Chat Notifier — Site Adapters
 *
 * Each adapter defines how to detect the "generating" state for a specific AI chat platform.
 * To add a new platform, simply add a new entry to this array.
 *
 * Fields:
 *   domain           — hostname to match (uses `includes` so subdomains work)
 *   name             — human-readable platform name (used in notification title)
 *   loadingSelectors — CSS selectors that are present in the DOM while the AI is generating
 *   loadingTextMatch — (optional) if set, also match buttons/elements containing this text
 */
const SITE_ADAPTERS = [
  {
    domain: "gemini.google.com",
    name: "Gemini",
    loadingSelectors: [
      // Primary: exact aria-label from live diagnostic (2026-03)
      "button[aria-label='Stop response']",
      // Stop icon inside chat input area
      ".stop-icon",
      // Button with 'stop' class (send-button transforms to stop during generation)
      "button.stop",
      // Material icon for stop
      "mat-icon[data-mat-icon-name='stop']",
      "mat-icon[data-mat-icon-name='stop_circle']",
      // Fallback: any button with Stop in aria-label
      "button[aria-label*='Stop']",
    ],
    // No loadingTextMatch — avoids false positives from unrelated "Stop" text
  },
  {
    domain: "chatgpt.com",
    name: "ChatGPT",
    loadingSelectors: [
      "[data-testid='stop-button']",
      "button[aria-label='Stop generating']",
      "button[aria-label='Stop streaming']",
      "button[aria-label='Stop']",
      // ChatGPT thinking/reasoning indicator
      "[data-testid='thinking-indicator']",
      // Fallback patterns
      "button[class*='stop']",
      "button[class*='Stop']",
    ],
  },
  {
    domain: "chat.deepseek.com",
    name: "DeepSeek",
    loadingSelectors: [
      ".ds-icon--stop",
      // Stop button variants
      "button.ds-button--danger",
      "[class*='stop-btn']",
      "[class*='stopBtn']",
      // General stop patterns
      "button[class*='stop']",
    ],
    loadingTextMatch: "Stop",
  },
  {
    domain: "kimi.moonshot.cn",
    name: "Kimi",
    loadingSelectors: [
      ".chat-input-stop-btn",
      "[class*='stop-btn']",
      "[class*='stopBtn']",
      "[class*='stop_btn']",
      "button[class*='stop']",
    ],
    loadingTextMatch: "停止",
  },
  {
    domain: "www.doubao.com",
    name: "豆包",
    loadingSelectors: [
      "[class*='stop']",
      "[class*='Stop']",
      "button[class*='stop']",
    ],
    loadingTextMatch: "停止",
  },
  {
    domain: "yuanbao.tencent.com",
    name: "元宝",
    loadingSelectors: [
      "[class*='stop']",
      "[class*='Stop']",
      "button[class*='stop']",
    ],
    loadingTextMatch: "停止",
  },
  {
    domain: "tongyi.aliyun.com",
    name: "通义",
    loadingSelectors: [
      "[class*='stop']",
      "[class*='Stop']",
      "button[class*='stop']",
    ],
    loadingTextMatch: "停止",
  },
  {
    domain: "chat.minimax.io",
    name: "Minimax",
    loadingSelectors: [
      "[class*='stop']",
      "[class*='Stop']",
      "button[class*='stop']",
    ],
    loadingTextMatch: "停止",
  },
];
