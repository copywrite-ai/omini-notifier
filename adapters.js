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
      // Primary: data-testid (may or may not be present in current builds)
      "[data-testid='stop-button']",
      // Aria-label variants (most stable across UI updates)
      "button[aria-label='Stop generating']",
      "button[aria-label='Stop streaming']",
      "button[aria-label='Stop']",
      // Reasoning model thinking indicator
      "[data-testid='thinking-indicator']",
      // Send button transforms to stop button with SVG rect during generation
      "button[data-testid='send-button'] rect",
    ],
    loadingTextMatch: "Stop generating",
  },
  {
    domain: "chat.deepseek.com",
    name: "DeepSeek",
    loadingSelectors: [
      // Primary: loading spinner appears inside the stop icon-button during generation
      ".ds-loading",
      // The icon-button container that holds the loading spinner
      ".ds-icon-button .ds-loading",
      // "正在思考" thinking indicator section
      "[class*='think-content']",
    ],
    loadingTextMatch: "正在思考",
  },
  {
    domain: "kimi.com",
    name: "Kimi",
    loadingSelectors: [
      // Primary: send-button-container gains "stop" class during generation (2026-03 verified)
      ".send-button-container.stop",
      // Fallback: any element with both send-button-container and stop classes
      "div.send-button-container.stop",
    ],
    // No loadingTextMatch — the stop state is purely class-based, no text content
  },
  {
    domain: "www.doubao.com",
    name: "豆包",
    loadingSelectors: [
      // Primary (2026-03 runtime capture): answer loading indicator
      "div[data-testid='message_loading']",
      // Secondary: input send button (state may switch to stop)
      "button[data-testid='chat_input_send_button'][aria-label*='停止']",
      "button[data-testid='chat_input_send_button'][title*='停止']",
      // Fallback: generic stop button patterns
      "button[aria-label*='停止']",
      "button[title*='停止']",
      "button[class*='stop']",
    ],
    loadingTextMatch: ["停止生成", "停止回答", "停止", "思考中", "正在思考"],
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
