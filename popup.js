/**
 * AI Chat Notifier — Popup Script
 *
 * Manages the popup UI: toggle notifications, show current site status,
 * test notification button.
 */
(function () {
  "use strict";

  const toggle = document.getElementById("enableToggle");
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const siteList = document.getElementById("siteList");
  const testBtn = document.getElementById("testBtn");

  // Supported site names (keep in sync with adapters.js)
  const sites = [
    "Gemini",
    "ChatGPT",
    "DeepSeek",
    "Kimi",
    "豆包",
    "元宝",
    "通义",
    "Minimax",
  ];

  // ── Render supported sites ────────────────────────────────────
  sites.forEach((site) => {
    const tag = document.createElement("span");
    tag.className = "site-tag";
    tag.textContent = site;
    siteList.appendChild(tag);
  });

  // ── Load enabled state ────────────────────────────────────────
  chrome.storage.local.get(["enabled"], (result) => {
    const enabled = result.enabled !== false; // default true
    toggle.checked = enabled;
    updateStatusUI(enabled);
  });

  // ── Toggle handler ────────────────────────────────────────────
  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ enabled });
    updateStatusUI(enabled);
  });

  // ── Test notification button ──────────────────────────────────
  testBtn.addEventListener("click", () => {
    testBtn.textContent = "⏳ Sending...";
    testBtn.disabled = true;

    chrome.runtime.sendMessage({ type: "TEST_NOTIFICATION" }, (response) => {
      if (chrome.runtime.lastError) {
        testBtn.textContent = "❌ Failed";
        console.error("Test failed:", chrome.runtime.lastError.message);
      } else {
        testBtn.textContent = "✅ Sent!";
      }
      setTimeout(() => {
        testBtn.textContent = "🔔 Test Notification";
        testBtn.disabled = false;
      }, 2000);
    });
  });

  // ── Detect current tab site ───────────────────────────────────
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.url) return;

    try {
      const url = new URL(tab.url);
      const hostname = url.hostname;

      // Simple domain-to-name mapping
      const domainMap = {
        "gemini.google.com": "Gemini",
        "chatgpt.com": "ChatGPT",
        "chat.deepseek.com": "DeepSeek",
        "kimi.moonshot.cn": "Kimi",
        "www.doubao.com": "豆包",
        "yuanbao.tencent.com": "元宝",
        "tongyi.aliyun.com": "通义",
        "chat.minimax.io": "Minimax",
      };

      const siteName = domainMap[hostname];
      if (siteName) {
        statusDot.classList.add("active");
        statusText.textContent = `Monitoring: ${siteName}`;
      } else {
        statusDot.classList.add("inactive");
        statusText.textContent = "Not on a supported site";
      }
    } catch {
      statusDot.classList.add("inactive");
      statusText.textContent = "Not on a supported site";
    }
  });

  function updateStatusUI(enabled) {
    if (enabled) {
      statusDot.style.opacity = "1";
    } else {
      statusDot.style.opacity = "0.4";
    }
  }
})();
