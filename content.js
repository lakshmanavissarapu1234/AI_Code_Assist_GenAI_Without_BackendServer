let inspectMode = false;
let selectedElements = new Set();

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

    if (msg.action === "GENERATE") {
      inspectMode = false;
      hoverBox.style.display = "none";

      const allSelectors = Array.from(selectedElements)
        .map(el => ({

          iframeOuterHTML:
            window !== window.top
              ? window.frameElement?.outerHTML || ""
              : "",

          elementOuterHTML: el.outerHTML,

          parentOuterHTML:
            el.parentElement?.outerHTML || ""

        }))
        .filter(Boolean);

      //console.log(allSelectors);

      chrome.runtime.sendMessage({
        type: "ELEMENTS_GENERATED",
        selectors: allSelectors,
        pageUrl: window.location.href
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