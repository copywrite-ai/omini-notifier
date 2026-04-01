/**
 * AI Chat Notifier — Content Script
 *
 * Two-layer detection for AI generation completion:
 *
 * Layer 1 (DOM): MutationObserver watches for stop button removal.
 *   → Works when the tab is active/visible.
 *
 * Layer 2 (Network): Listens for postMessage from intercept.js (MAIN world)
 *   which detects when fetch/XHR streaming responses complete.
 *   → Works even when the tab is in the background (Chrome throttles DOM
 *     but NOT network responses).
 *
 * State machine: idle → generating → done → idle
 */
(function () {
  "use strict";

  const LOG_PREFIX = "[AI Notifier]";

  // ── Adapter Resolution ──────────────────────────────────────────────
  const hostname = location.hostname;
  const adapter = SITE_ADAPTERS.find((a) => hostname.includes(a.domain));

  if (!adapter) {
    console.log(`${LOG_PREFIX} No adapter found for ${hostname}`);
    return;
  }

  console.log(`${LOG_PREFIX} ✅ Loaded adapter: "${adapter.name}" for ${hostname}`);

  // ── State ───────────────────────────────────────────────────────────
  let state = "idle"; // "idle" | "generating"
  let debounceTimer = null;
  let generationStartTime = 0;
  let lastNotificationTime = 0;
  const DEBOUNCE_MS = 800;
  const COOLDOWN_MS = 5000; // Suppress re-triggering for 5s after notification

  // ── DOM Detection ───────────────────────────────────────────────────
  function isGenerating() {
    for (const sel of adapter.loadingSelectors) {
      try {
        const elements = document.querySelectorAll(sel);
        for (const el of elements) {
          if (isVisible(el)) return true;
        }
      } catch {}
    }

    if (adapter.loadingTextMatch) {
      const textMatches = Array.isArray(adapter.loadingTextMatch)
        ? adapter.loadingTextMatch
        : [adapter.loadingTextMatch];
      const buttons = document.querySelectorAll("button, [role='button']");
      for (const btn of buttons) {
        const text = btn.textContent || btn.innerText || "";
        for (const match of textMatches) {
          if (text.includes(match) && isVisible(btn)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  function isVisible(el) {
    if (!el) return false;
    if (el.hidden) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      return false;
    }
    if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
    return true;
  }

  // ── State Machine ───────────────────────────────────────────────────
  let lastLogTime = 0;

  function checkState() {
    const generating = isGenerating();
    const now = Date.now();

    if (state === "idle" && generating) {
      // Cooldown: ignore brief re-appearances of stop button after a recent notification
      if (now - lastNotificationTime < COOLDOWN_MS) {
        return;
      }
      state = "generating";
      generationStartTime = now;
      console.log(`${LOG_PREFIX} 🔄 ${adapter.name}: Generation STARTED`);
      clearTimeout(debounceTimer);
    } else if (state === "generating" && !generating) {
      if (!debounceTimer) {
        console.log(`${LOG_PREFIX} ⏳ Stop button gone, debouncing ${DEBOUNCE_MS}ms...`);
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        if (!isGenerating()) {
          onGenerationDone("DOM");
        } else {
          console.log(`${LOG_PREFIX} ↩️ Loading reappeared, still generating.`);
        }
      }, DEBOUNCE_MS);
    } else if (state === "generating" && generating) {
      if (now - lastLogTime > 5000) {
        console.log(`${LOG_PREFIX} 🔄 Still generating... (hidden=${document.hidden})`);
        lastLogTime = now;
      }
    }
  }

  // ── Network-Level Detection (Layer 2) ───────────────────────────────
  // Listen for signals from intercept.js (MAIN world) that a streaming
  // response has completed. This works even when the tab is in the background.
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.type !== "__AI_NOTIFIER__") return;
    if (event.data?.event !== "STREAM_COMPLETE") return;

    const { url, elapsed, bodyLength } = event.data;

    if (state === "generating") {
      // Cooldown: skip if we just sent a notification
      if (Date.now() - lastNotificationTime < COOLDOWN_MS) {
        console.log(`${LOG_PREFIX} 📡 Network: ignoring (cooldown active)`);
        return;
      }
      console.log(
        `${LOG_PREFIX} 📡 Network: streaming response completed (${elapsed}ms, ${bodyLength} bytes)`
      );
      console.log(`${LOG_PREFIX} 📡 URL: ${url}`);
      // Stream completed while we were in generating state → generation is done
      onGenerationDone("NETWORK");
    }
  });

  // ── Generation Done Handler ─────────────────────────────────────────
  function onGenerationDone(detectedBy) {
    if (state !== "generating") return; // Guard against double-fire

    state = "idle";
    clearTimeout(debounceTimer);
    lastNotificationTime = Date.now();

    const elapsed = Date.now() - generationStartTime;
    console.log(
      `${LOG_PREFIX} ✅ ${adapter.name}: Generation DONE! (detected by ${detectedBy}, took ${elapsed}ms)`
    );

    // Only notify when the tab is NOT active — if the user is looking at the
    // page, they can already see it's done; a notification would be disruptive.
    if (!document.hidden) {
      console.log(`${LOG_PREFIX} Tab is active, skipping notification.`);
      return;
    }

    sendNotification();
  }

  // ── Extension Context Check ─────────────────────────────────────────
  // Two failure modes in MV3:
  //   1. Service worker asleep → chrome.runtime.id exists, sendMessage may
  //      fail on first try but succeeds after retry (worker restarts on demand)
  //   2. Extension reloaded/uninstalled → chrome.runtime.id is undefined,
  //      truly dead, page refresh is the only fix
  let contextDead = false;

  function isExtensionContextValid() {
    try {
      return !!chrome.runtime?.id;
    } catch {
      return false;
    }
  }

  // ── Send Notification ───────────────────────────────────────────────
  function sendNotification(retryCount = 0) {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 500;

    if (contextDead) return;

    if (!isExtensionContextValid()) {
      contextDead = true;
      console.warn(`${LOG_PREFIX} Extension context invalidated (extension was reloaded or uninstalled). Please refresh the page.`);
      return;
    }

    chrome.storage.local.get(["enabled"], (result) => {
      if (chrome.runtime.lastError) {
        // Service worker might just be waking up — retry
        if (retryCount < MAX_RETRIES && isExtensionContextValid()) {
          console.log(`${LOG_PREFIX} ⏳ Storage access failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          setTimeout(() => sendNotification(retryCount + 1), RETRY_DELAY);
          return;
        }
        contextDead = true;
        console.warn(`${LOG_PREFIX} Extension context lost. Please refresh the page.`);
        return;
      }

      const enabled = result.enabled !== false;
      if (!enabled) {
        console.log(`${LOG_PREFIX} Notifications disabled by user, skipping.`);
        return;
      }

      console.log(`${LOG_PREFIX} 📨 Sending notification (hidden=${document.hidden})...`);
      chrome.runtime.sendMessage(
        {
          type: "GENERATION_DONE",
          site: adapter.name,
          url: location.href,
          title: document.title,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            // Service worker might need a kick — retry
            if (retryCount < MAX_RETRIES && isExtensionContextValid()) {
              console.log(`${LOG_PREFIX} ⏳ sendMessage failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
              setTimeout(() => sendNotification(retryCount + 1), RETRY_DELAY);
            } else {
              console.warn(`${LOG_PREFIX} sendMessage failed:`, chrome.runtime.lastError.message);
            }
          } else {
            console.log(`${LOG_PREFIX} ✅ Background responded:`, response);
          }
        }
      );
    });
  }

  // ── MutationObserver (Layer 1: DOM) ─────────────────────────────────
  function startObserver() {
    if (!document.body) {
      setTimeout(startObserver, 200);
      return;
    }

    const observer = new MutationObserver(() => checkState());

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "data-testid", "aria-label", "hidden", "disabled"],
    });

    console.log(`${LOG_PREFIX} MutationObserver attached`);
  }

  startObserver();
  setInterval(checkState, 2000);
  checkState();

  console.log(`${LOG_PREFIX} 🎯 Monitoring "${adapter.name}" — DOM + Network dual detection`);
})();
