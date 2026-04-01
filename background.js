/**
 * AI Chat Notifier — Background Service Worker
 *
 * Receives messages from content scripts and fires system notifications.
 * Only sends notifications when the tab is NOT the active tab (silent mode),
 * unless forceNotify is set (for testing).
 * Clicking a notification focuses the originating tab.
 */

// Map notification IDs to tab info for click handling
const notificationTabMap = new Map();

// ── Message Handler ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Test notification from popup
  if (message.type === "TEST_NOTIFICATION") {
    fireNotification("Test", "This is a test notification from AI Chat Notifier.", null, null);
    sendResponse({ ok: true });
    return;
  }

  if (message.type !== "GENERATION_DONE") return true;

  const tabId = sender.tab?.id;
  const windowId = sender.tab?.windowId;
  const siteName = message.site || "AI Chat";

  console.log(`[AI Notifier BG] Received GENERATION_DONE from ${siteName} (tab ${tabId})`);

  if (!tabId) {
    console.log("[AI Notifier BG] No tab ID, skipping.");
    sendResponse({ ok: false, reason: "no tab ID" });
    return true;
  }

  // Silent mode is now handled in content.js via document.hidden
  // Background just fires the notification
  console.log(`[AI Notifier BG] Firing notification for ${siteName}`);
  fireNotification(siteName, message.title, tabId, windowId);
  sendResponse({ ok: true });

  return true; // Keep message port open for async sendResponse
});

// ── Fire Notification ───────────────────────────────────────────────
function fireNotification(siteName, messageText, tabId, windowId) {
  const notificationId = `ai-notifier-${Date.now()}`;

  const options = {
    type: "basic",
    title: `✅ ${siteName} — Generation Complete`,
    message: messageText || `${siteName} has finished generating.`,
    priority: 2,
  };

  // Try with icon first; if icon fails, retry without
  try {
    options.iconUrl = "icons/icon128.png";
  } catch (e) {
    // skip icon
  }

  chrome.notifications.create(notificationId, options, (createdId) => {
    if (chrome.runtime.lastError) {
      console.error("[AI Notifier BG] Notification create error:", chrome.runtime.lastError.message);
      // Retry without icon
      delete options.iconUrl;
      chrome.notifications.create(notificationId + "-retry", options, (retryId) => {
        if (chrome.runtime.lastError) {
          console.error("[AI Notifier BG] Retry also failed:", chrome.runtime.lastError.message);
        } else {
          console.log("[AI Notifier BG] Notification created (no icon):", retryId);
          if (tabId) notificationTabMap.set(retryId, { tabId, windowId });
        }
      });
    } else {
      console.log("[AI Notifier BG] Notification created:", createdId);
      if (tabId) {
        notificationTabMap.set(createdId, { tabId, windowId });
        // Clean up mapping after 60 seconds
        setTimeout(() => notificationTabMap.delete(createdId), 60000);
      }
    }
  });
}

// ── Notification Click Handler ──────────────────────────────────────
chrome.notifications.onClicked.addListener((notificationId) => {
  const tabInfo = notificationTabMap.get(notificationId);
  if (!tabInfo) return;

  // Focus the window and activate the tab
  chrome.windows.update(tabInfo.windowId, { focused: true });
  chrome.tabs.update(tabInfo.tabId, { active: true });

  // Dismiss the notification
  chrome.notifications.clear(notificationId);
  notificationTabMap.delete(notificationId);
});

// ── Notification Close Handler ──────────────────────────────────────
chrome.notifications.onClosed.addListener((notificationId) => {
  notificationTabMap.delete(notificationId);
});

console.log("[AI Notifier BG] Background service worker loaded.");
