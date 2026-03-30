/**
 * Doubao Real-Time DOM Watcher
 *
 * Usage:
 * 1) Open https://www.doubao.com/chat/
 * 2) Paste this script in DevTools Console BEFORE sending a prompt
 * 3) Send a prompt and wait until response finishes
 * 4) Copy logs marked with "CANDIDATE" and "STATE"
 */

(() => {
  const LOG = "[DoubaoWatcher]";
  const seen = new Set();
  const candidateCount = new Map();
  const startedAt = Date.now();

  const KEYWORDS = [
    "stop", "Stop", "send", "Send", "loading", "Loading", "thinking", "Thinking",
    "停止", "思考", "生成", "回答"
  ];

  const TEXT_HINTS = ["停止生成", "停止回答", "停止", "思考中", "正在思考", "发送"];

  function visible(el) {
    if (!el) return false;
    if (el.hidden) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function cssSafeClassList(el) {
    const cls = typeof el.className === "string" ? el.className.trim() : "";
    if (!cls) return [];
    return cls
      .split(/\s+/)
      .filter(Boolean)
      .filter((c) => !/^jsx-\d+$/.test(c))
      .slice(0, 3);
  }

  function toCandidateSelectors(el) {
    const sels = [];
    const tag = (el.tagName || "").toLowerCase();
    if (!tag) return sels;

    const aria = el.getAttribute("aria-label");
    const title = el.getAttribute("title");
    const testid = el.getAttribute("data-testid");
    const role = el.getAttribute("role");

    if (aria) sels.push(`${tag}[aria-label='${aria.replace(/'/g, "\\'")}']`);
    if (title) sels.push(`${tag}[title='${title.replace(/'/g, "\\'")}']`);
    if (testid) sels.push(`${tag}[data-testid='${testid.replace(/'/g, "\\'")}']`);
    if (role) sels.push(`${tag}[role='${role.replace(/'/g, "\\'")}']`);

    const classes = cssSafeClassList(el);
    if (classes.length) sels.push(`${tag}.${classes.join(".")}`);

    // Generic fallback for adapter-level use
    if (classes.some((c) => c.toLowerCase().includes("stop"))) {
      sels.push(`${tag}[class*='stop']`);
    }

    return Array.from(new Set(sels));
  }

  function interesting(el) {
    if (!(el instanceof Element)) return false;

    const tag = el.tagName;
    const cls = typeof el.className === "string" ? el.className : "";
    const aria = el.getAttribute("aria-label") || "";
    const title = el.getAttribute("title") || "";
    const testid = el.getAttribute("data-testid") || "";
    const role = el.getAttribute("role") || "";
    const text = (el.textContent || "").trim().slice(0, 50);

    const interactive =
      tag === "BUTTON" ||
      tag === "SVG" ||
      tag === "SPAN" ||
      role === "button" ||
      !!aria ||
      !!title ||
      !!testid;

    const blob = `${cls} ${aria} ${title} ${testid} ${text}`;
    const keywordHit = KEYWORDS.some((k) => blob.includes(k));
    const textHit = TEXT_HINTS.some((k) => text.includes(k));

    return (interactive && keywordHit) || textHit;
  }

  function logCandidate(el, reason) {
    if (!visible(el)) return;

    const tag = el.tagName;
    const cls = typeof el.className === "string" ? el.className : "";
    const aria = el.getAttribute("aria-label") || "";
    const title = el.getAttribute("title") || "";
    const text = (el.textContent || "").trim().slice(0, 80);

    const key = `${tag}|${cls}|${aria}|${title}|${text}`;
    if (seen.has(key)) return;
    seen.add(key);

    const selectors = toCandidateSelectors(el);
    for (const sel of selectors) {
      const n = candidateCount.get(sel) || 0;
      candidateCount.set(sel, n + 1);
    }

    console.log(`${LOG} CANDIDATE (${reason}) <${tag}> class="${cls.slice(0, 120)}" aria="${aria}" title="${title}" text="${text}"`);
    if (selectors.length) {
      console.log(`${LOG}   selectors:`, selectors);
    }
  }

  function scanNow(reason) {
    const all = document.querySelectorAll("button, [role='button'], svg, span, i");
    for (const el of all) {
      if (interesting(el)) logCandidate(el, reason);
    }
  }

  function dumpTopSelectors() {
    const arr = Array.from(candidateCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);

    console.log(`${LOG} STATE elapsed=${Date.now() - startedAt}ms candidates=${candidateCount.size}`);
    if (!arr.length) {
      console.log(`${LOG} No selectors collected yet.`);
      return;
    }

    console.log(`${LOG} Top selector candidates:`);
    for (const [sel, n] of arr) {
      console.log(`${LOG}   ${n}x  ${sel}`);
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.target instanceof Element) {
        if (interesting(m.target)) logCandidate(m.target, `attr:${m.attributeName}`);
      }

      for (const node of m.addedNodes) {
        if (!(node instanceof Element)) continue;
        const batch = [node, ...node.querySelectorAll("*")];
        for (const el of batch) {
          if (interesting(el)) logCandidate(el, "added");
        }
      }

      for (const node of m.removedNodes) {
        if (!(node instanceof Element)) continue;
        const tag = node.tagName;
        const cls = typeof node.className === "string" ? node.className : "";
        const text = (node.textContent || "").trim().slice(0, 50);
        if (KEYWORDS.some((k) => `${cls} ${text}`.includes(k))) {
          console.log(`${LOG} REMOVED <${tag}> class="${cls.slice(0, 120)}" text="${text}"`);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-label", "title", "data-testid", "hidden", "disabled"]
  });

  const ticker = setInterval(() => {
    scanNow("interval");
    dumpTopSelectors();
  }, 2000);

  scanNow("initial");
  console.log(`${LOG} Started. Send a message now, wait until completion, then run: window.__doubaoWatcherStop()`);

  window.__doubaoWatcherStop = () => {
    observer.disconnect();
    clearInterval(ticker);
    dumpTopSelectors();
    console.log(`${LOG} Stopped.`);
  };

  // safety timeout
  setTimeout(() => {
    if (window.__doubaoWatcherStop) window.__doubaoWatcherStop();
  }, 90000);
})();
