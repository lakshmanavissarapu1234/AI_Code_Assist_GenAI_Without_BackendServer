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
        .map(el => generateSmartSelector(el))
        .filter(Boolean);

      chrome.runtime.sendMessage({
        type: "ELEMENTS_GENERATED",
        selectors: allSelectors
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

// 🔥 LABEL DETECTION
function getLabel(el) {
  if (el.labels?.length) return el.labels[0].innerText.trim();

  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) return label.innerText.trim();
  }

  return el.getAttribute("aria-label") || null;
}

// 🔥 ELEMENT TYPE DETECTION
function getElementType(el) {
  const tag = el.tagName.toLowerCase();
  const type = el.getAttribute("type");
  const role = el.getAttribute("role");

  if (tag === "textarea") return "input";
  if (tag === "select") return "select";

  if (tag === "input") {
    if (["text", "email", "tel", "password", "number"].includes(type)) return "input";
    if (type === "radio") return "radio";
    if (type === "checkbox") return "checkbox";
  }

  if (role === "combobox") return "react-dropdown";

  return "click";
}

// 🔥 MAIN GENERATOR
function generateSmartSelector(el) {
  if (!el) return null;

  const label = getLabel(el);
  const placeholder = el.getAttribute("placeholder");
  const id = el.id ? `#${el.id}` : null;
  const text = el.innerText?.trim();
  const role = el.getAttribute("role");
  const onclick = el.getAttribute("onclick");
  const value = el.value;

  const elementType = getElementType(el);

  let action = "click";
  if (elementType === "input") action = "fill";
  if (elementType === "radio" || elementType === "checkbox") action = "check";
  if (elementType === "select" || elementType === "react-dropdown") action = "select";

  const selectors = [];

  // 🔥 STRONG LOCATORS FIRST

  if (label) {
    selectors.push(`page.getByLabel('${label}')`);
  }

  if (role && text) {
    selectors.push(`page.getByRole('${role}', { name: '${text}' })`);
  }

  if (placeholder) {
    selectors.push(`page.getByPlaceholder('${placeholder}')`);
  }

  if (id) {
    selectors.push(`page.locator('${id}')`);
  }

  if (text && text.length < 50) {
    selectors.push(`page.getByText('${text}')`);
  }

  // 🔥 WEAK FALLBACKS (ONLY IF SPACE LEFT)

  if (selectors.length < 5 && onclick) {
    selectors.push(`page.locator('[onclick="${onclick}"]')`);
  }

  if (selectors.length < 5 && value && value.length < 50) {
    selectors.push(`page.locator('[value="${value}"]')`);
  }

  // 🔥 LIMIT TO MAX 5
  const finalSelectors = selectors.slice(0, 5);

  return {
    elementName: label || placeholder || text || "Element",
    type: elementType,
    action,
    selectors: finalSelectors
  };
}