/**
 * DeepSeek Real-Time DOM Watcher
 * 
 * 1. Paste this into the console BEFORE starting generation
 * 2. Then ask DeepSeek a question
 * 3. Wait for generation to complete
 * 4. Copy the console output
 */

console.log("=== DeepSeek DOM Watcher Started ===");
console.log("Now ask DeepSeek a question...\n");

const seen = new Set();

const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    // Track added nodes
    for (const node of m.addedNodes) {
      if (node.nodeType !== 1) continue; // Element only
      
      // Check the node itself and all descendants
      const elements = [node, ...node.querySelectorAll("*")];
      for (const el of elements) {
        const tag = el.tagName;
        const cls = el.className || "";
        const clsStr = typeof cls === "string" ? cls : "";
        const aria = el.getAttribute("aria-label") || "";
        const role = el.getAttribute("role") || "";
        const testid = el.getAttribute("data-testid") || "";
        const text = (el.textContent || "").trim().substring(0, 60);
        const rect = el.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0;
        
        // Only log interactive or meaningful elements
        const isInteractive = ["BUTTON", "A", "SVG", "I", "SPAN"].includes(tag) 
          || role === "button" 
          || aria 
          || testid
          || el.onclick;
        
        // Also log any element with interesting classes
        const hasInterestingClass = clsStr && (
          clsStr.includes("btn") || clsStr.includes("Btn") ||
          clsStr.includes("button") || clsStr.includes("Button") ||
          clsStr.includes("icon") || clsStr.includes("Icon") ||
          clsStr.includes("action") || clsStr.includes("Action") ||
          clsStr.includes("cancel") || clsStr.includes("Cancel") ||
          clsStr.includes("send") || clsStr.includes("Send") ||
          clsStr.includes("generat") || clsStr.includes("Generat") ||
          clsStr.includes("loading") || clsStr.includes("Loading") ||
          clsStr.includes("spinner") || clsStr.includes("Spinner") ||
          clsStr.includes("progress") || clsStr.includes("Progress") ||
          clsStr.includes("typing") || clsStr.includes("Typing") ||
          clsStr.includes("thinking") || clsStr.includes("Thinking") ||
          clsStr.includes("streaming") || clsStr.includes("Streaming")
        );
        
        if ((isInteractive || hasInterestingClass) && visible) {
          const key = `${tag}|${clsStr}|${aria}|${text}`;
          if (!seen.has(key)) {
            seen.add(key);
            console.log(`➕ ADDED: <${tag}> class="${clsStr.substring(0,80)}" aria="${aria}" text="${text}" visible=${visible}`);
            // Log parent chain for context
            let p = el.parentElement;
            let depth = 0;
            while (p && depth < 3) {
              const pCls = typeof p.className === "string" ? p.className : "";
              if (pCls) {
                console.log(`   ↑ parent: <${p.tagName}> class="${pCls.substring(0,80)}"`);
              }
              p = p.parentElement;
              depth++;
            }
          }
        }
      }
    }
    
    // Track removed nodes (stop button disappearing = generation done)
    for (const node of m.removedNodes) {
      if (node.nodeType !== 1) continue;
      const tag = node.tagName;
      const cls = node.className || "";
      const clsStr = typeof cls === "string" ? cls : "";
      const text = (node.textContent || "").trim().substring(0, 60);
      
      if (["BUTTON", "SVG"].includes(tag) || (clsStr && clsStr.includes("btn"))) {
        console.log(`➖ REMOVED: <${tag}> class="${clsStr.substring(0,80)}" text="${text}"`);
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Auto-stop after 60 seconds
setTimeout(() => {
  observer.disconnect();
  console.log("\n=== DOM Watcher Stopped (60s timeout) ===");
}, 60000);
