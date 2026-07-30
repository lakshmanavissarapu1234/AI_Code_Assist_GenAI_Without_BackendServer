let inspectMode = false;
let selectedElements = new Set();

const allowedElementAttributes = [
  "id",
  "name",
  "type",
  "placeholder",
  "aria-label",
  "aria-labelledby",
  "role",
  "value",
  "href",
  "src",
  "title",
  "for",
  "alt",
  "data-testid",
  "data-test",
  "data-cy",
  "data-qa",
  "autocomplete",
  "inputmode",
  "maxlength",
  "required",
  "checked",
  "selected",
  "disabled",
  "tabindex",
  "class"
];

function sanitizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function sanitizeHtmlSnippet(html) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildElementSnapshot(el) {
  if (!el) return null;

  const attributes = {};
  allowedElementAttributes.forEach((attrName) => {
    const value = el.getAttribute(attrName);
    if (value) attributes[attrName] = value;
  });

  const computedStyle = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const isVisible = computedStyle.display !== "none" &&
    computedStyle.visibility !== "hidden" &&
    computedStyle.opacity !== "0" &&
    rect.width > 0 &&
    rect.height > 0;

  return {
    tagName: (el.tagName || "").toLowerCase(),
    attributes,
    visibleText: sanitizeText(el.innerText || el.textContent || ""),
    isVisible,
    htmlSnippet: sanitizeHtmlSnippet(el.outerHTML || "")
  };
}

function buildSanitizedSelectorPayload(el) {
  if (!el) return null;

  return {
    iframeOuterHTML:
      window !== window.top
        ? window.frameElement?.outerHTML || ""
        : "",
    elementOuterHTML: sanitizeHtmlSnippet(el.outerHTML || ""),
    elementSnapshot: buildElementSnapshot(el)
  };
}

function collectInteractiveElements() {
  const selectors = [
    "button",
    "input",
    "select",
    "textarea",
    "a[href]",
    "[role='button']",
    "[role='link']",
    "[data-testid]",
    "[data-test]",
    "[data-cy]",
    "[data-qa]"
  ];

  const elements = new Set();
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden") {
        elements.add(el);
      }
    });
  });

  return Array.from(elements).slice(0, 40);
}

function getPageCaptureStorageKey(pageUrl) {
  return `capturedSnapshot:${(pageUrl || "unknown").replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function saveCapturedSnapshot(pageUrl, selectors) {
  chrome.storage.local.get(["capturedSnapshots"], (data) => {
    const snapshots = data.capturedSnapshots || {};
    snapshots[getPageCaptureStorageKey(pageUrl)] = {
      pageUrl,
      selectors,
      capturedAt: new Date().toISOString()
    };
    chrome.storage.local.set({ capturedSnapshots: snapshots });
  });
}

function loadCapturedSnapshot(pageUrl, callback) {
  chrome.storage.local.get(["capturedSnapshots"], (data) => {
    const snapshots = data.capturedSnapshots || {};
    const snapshot = snapshots[getPageCaptureStorageKey(pageUrl)] || null;
    callback(snapshot);
  });
}

// 🔵 Hover overlay
const hoverBox = document.createElement("div");
hoverBox.style.position = "fixed";
hoverBox.style.border = "2px solid blue";
hoverBox.style.zIndex = "999999";
hoverBox.style.pointerEvents = "none";
hoverBox.style.display = "none";
document.body.appendChild(hoverBox);

if (!window.__pw_selector_installed) {
  window.__pw_selector_installed = true;

  const style = document.createElement("style");
  style.innerHTML = `.pw-selected { outline: 3px solid orange !important; }`;
  document.head.appendChild(style);

  chrome.runtime.onMessage.addListener((msg) => {

    if (msg.action === "START") inspectMode = true;

    if (msg.action === "STOP") {
      inspectMode = false;
      hoverBox.style.display = "none";
    }

    if (msg.action === "RESET") {
      inspectMode = false;
      clearAllHighlights();
      hoverBox.style.display = "none";
    }

    if (msg.action === "CAPTURE_DOM") {
      inspectMode = false;
      hoverBox.style.display = "none";

      let allSelectors = Array.from(selectedElements)
        .map((el) => buildSanitizedSelectorPayload(el))
        .filter(Boolean);

      if (allSelectors.length === 0) {
        const autoElements = collectInteractiveElements();
        allSelectors = autoElements
          .map((el) => buildSanitizedSelectorPayload(el))
          .filter(Boolean);
      }

      saveCapturedSnapshot(window.location.href, allSelectors);

      chrome.runtime.sendMessage({
        type: "DOM_CAPTURED",
        selectors: allSelectors,
        pageUrl: window.location.href
      });
    }

    if (msg.action === "GENERATE") {
      inspectMode = false;
      hoverBox.style.display = "none";

      const allSelectors = Array.from(selectedElements)
        .map((el) => buildSanitizedSelectorPayload(el))
        .filter(Boolean);

      loadCapturedSnapshot(window.location.href, (snapshot) => {
        const selectorsToUse = allSelectors.length > 0
          ? allSelectors
          : (snapshot?.selectors || []);

        chrome.runtime.sendMessage({
          type: "ELEMENTS_GENERATED",
          selectors: selectorsToUse,
          pageUrl: window.location.href
        });
      });
    }
  });

  document.addEventListener("mousemove", (event) => {
    if (!inspectMode) return;

    const el = event.target;
    if (!el || selectedElements.has(el)) return;

    const rect = el.getBoundingClientRect();
    hoverBox.style.top = rect.top + "px";
    hoverBox.style.left = rect.left + "px";
    hoverBox.style.width = rect.width + "px";
    hoverBox.style.height = rect.height + "px";
    hoverBox.style.display = "block";
  });

  document.addEventListener("click", function (event) {
    if (!inspectMode) return;

    event.preventDefault();
    event.stopPropagation();

    const el = event.target;

    if (selectedElements.has(el)) {
      selectedElements.delete(el);
      el.classList.remove("pw-selected");
      return;
    }

    selectedElements.add(el);
    el.classList.add("pw-selected");
  }, true);
}

function clearAllHighlights() {
  document.querySelectorAll(".pw-selected").forEach(el => {
    el.classList.remove("pw-selected");
  });
  selectedElements.clear();
}
