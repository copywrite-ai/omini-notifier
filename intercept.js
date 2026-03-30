/**
 * AI Chat Notifier — Network Interceptor (MAIN world)
 *
 * This script runs in the page's JS context (not the extension's isolated world).
 * It patches fetch() and XMLHttpRequest to detect when streaming AI responses
 * complete at the NETWORK level — independent of DOM rendering.
 *
 * This solves the Chrome background tab throttling problem: even if the page's
 * rendering JS is paused, the network response still arrives and we detect it.
 *
 * Communication: postMessage → content.js (ISOLATED world) → background.js
 */
(function () {
  "use strict";

  // Avoid double-injection
  if (window.__AI_NOTIFIER_INTERCEPTED__) return;
  window.__AI_NOTIFIER_INTERCEPTED__ = true;

  const CHANNEL = "__AI_NOTIFIER__";

  // ── Fetch Interception ────────────────────────────────────────────
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    const request = args[0];
    const url = typeof request === "string" ? request : request?.url || "";
    const method = (typeof request === "string" ? args[1]?.method : request?.method) || "GET";

    const fetchPromise = originalFetch.apply(this, args);

    // Only track POST requests (AI generation calls are POST)
    if (method.toUpperCase() === "POST") {
      const startTime = Date.now();

      fetchPromise
        .then((response) => {
          // Clone the response and wait for the FULL body to arrive.
          // For streaming responses, this resolves when the server closes the stream.
          // The clone reads from the browser's network buffer independently of the
          // page's stream consumer, so it works even if page JS is throttled.
          const clone = response.clone();
          clone
            .text()
            .then((body) => {
              const elapsed = Date.now() - startTime;
              // Only signal for responses that took > 2s (likely AI generation, not quick API calls)
              if (elapsed > 2000 && body.length > 100) {
                window.postMessage(
                  {
                    type: CHANNEL,
                    event: "STREAM_COMPLETE",
                    url: url.substring(0, 200), // Truncate for safety
                    elapsed: elapsed,
                    bodyLength: body.length,
                  },
                  "*"
                );
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    }

    return fetchPromise;
  };

  // ── XMLHttpRequest Interception (fallback for some platforms) ──────
  const OrigXHR = window.XMLHttpRequest;
  const origOpen = OrigXHR.prototype.open;
  const origSend = OrigXHR.prototype.send;

  OrigXHR.prototype.open = function (method, url, ...rest) {
    this.__aiNotifierMethod = method;
    this.__aiNotifierUrl = url;
    return origOpen.apply(this, [method, url, ...rest]);
  };

  OrigXHR.prototype.send = function (...args) {
    const method = this.__aiNotifierMethod || "";
    const url = this.__aiNotifierUrl || "";

    if (method.toUpperCase() === "POST") {
      const startTime = Date.now();

      this.addEventListener("loadend", () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > 2000 && (this.responseText?.length || 0) > 100) {
          window.postMessage(
            {
              type: CHANNEL,
              event: "STREAM_COMPLETE",
              url: url.substring(0, 200),
              elapsed: elapsed,
              bodyLength: this.responseText?.length || 0,
            },
            "*"
          );
        }
      });
    }

    return origSend.apply(this, args);
  };

  console.log("[AI Notifier] Network interceptor installed (MAIN world)");
})();
