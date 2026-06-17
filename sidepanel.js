import { SAMPLE_POM_TYPESCRIPT, SAMPLE_POM_JAVA, SAMPLE_POM_PYTHON, SAMPLE_POM_CSHARP } from "./samplePOM.js";

// 💾 Load saved language and framework on startup
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["language", "framework"], (data) => {
    if (data.language) {
      document.getElementById("language-select").value = data.language;
    }
    if (data.framework) {
      document.getElementById("framework-select").value = data.framework;
    }
  });

  // Check active tab on load and hide/show buttons accordingly
  const activeTab = document.querySelector(".tab-btn.active");
  if (activeTab && activeTab.dataset.tab === "config-panel") {
    document.querySelector(".top-controls").style.display = "none";
    document.querySelector(".bottom-controls").style.visibility = "hidden";
  }
});

// 🔀 Tab switching
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    // Hide buttons when Configuration tab is active
    // Hide buttons when Configuration tab is active
    const isConfig = btn.dataset.tab === "config-panel";
    document.querySelector(".top-controls").style.display = isConfig ? "none" : "flex";
    document.querySelector(".bottom-controls").style.display = isConfig ? "none" : "flex";
    document.querySelector(".bottom-controls").style.visibility = isConfig ? "hidden" : "visible";
  });
});

// 💾 Save language selection when changed
document.getElementById("language-select").addEventListener("change", () => {
  const language = document.getElementById("language-select").value;
  chrome.storage.local.set({ language });
});

// 💾 Save framework selection when changed
document.getElementById("framework-select").addEventListener("change", () => {
  const framework = document.getElementById("framework-select").value;
  chrome.storage.local.set({ framework });
});

// ▶️ Start Inspect
document.getElementById("start").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });

  chrome.tabs.sendMessage(tab.id, { action: "START" });

  document.getElementById("output").textContent =
    "Inspect mode ON (hover and select elements)";
});

// ⏸️ Pause
document.getElementById("pause").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "STOP" });

  document.getElementById("output").textContent =
    "Inspect mode PAUSED (selections retained)";
});

// 🔥 Generate (trigger content.js)
document.getElementById("generate").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "GENERATE" });
});

// 🧹 Reset
document.getElementById("reset").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "RESET" });

  document.getElementById("output").textContent =
    "Reset completed (all selections cleared)";
});

// 📋 Copy output
document.getElementById("copy").addEventListener("click", () => {
  const text = document.getElementById("output").textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    document.getElementById("copy").textContent = "Copied!";
    setTimeout(() => {
      document.getElementById("copy").textContent = "Copy";
    }, 1500);
  });
});

// 🔥 GEMINI API CALL (NO BACKEND)
async function generateWithAI(selectors, pageUrl, language) {
  try {

    const samplePOMMap = {
      typescript: SAMPLE_POM_TYPESCRIPT,
      java: SAMPLE_POM_JAVA,
      python: SAMPLE_POM_PYTHON,
      csharp: SAMPLE_POM_CSHARP
    };

    const languageLabelMap = {
      typescript: "TypeScript",
      java: "Java",
      python: "Python",
      csharp: "C#"
    };

    const selectedSample = samplePOMMap[language] || SAMPLE_POM_TYPESCRIPT;
    const selectedLanguageLabel = languageLabelMap[language] || "TypeScript";

    const prompt = `
You are a senior Playwright automation framework architect.

Generate a complete Playwright Page Object Model (POM) class in ${selectedLanguageLabel}.

REQUIREMENTS:

- - Output ONLY valid ${selectedLanguageLabel} code.
- Generate methods strictly for the provided selected elements.
- Follow the SAMPLE_POM style exactly.
- Use tryLocators in every method (only for TypeScript, skip for other languages).
- Use FrameLocator only when iframeOuterHTML exists.
- Do not generate helper methods.
- Use only information available in pageUrl, iframeOuterHTML, and elementOuterHTML.
- Do not invent locators.

IMPLEMENTATION GUIDELINES:

- Derive meaningful page class names from the page URL.
- Derive meaningful method names directly from the selected element.
- Create meaningful locator array names and resolved locator names.
- Use only locators inferred from the provided DOM content.
- For Java: use Playwright Java API (com.microsoft.playwright). Follow the SAMPLE_POM structure exactly.
- For Python: use Playwright Python API (playwright.sync_api). Follow the SAMPLE_POM structure exactly.
- For C#: use Playwright C# API (Microsoft.Playwright). Follow the SAMPLE_POM structure exactly.
- Always follow the SAMPLE_POM language style strictly. Do not mix languages.
- Use XPath only when no other locator type can be inferred.
- Prefer fewer strong locators over multiple weak locators.
- Avoid duplicate locators.
- Avoid .first(), .last(), and .nth() unless absolutely necessary.
- Every generated method must include a meaningful console.log after the action.
- Determine method naming and action from element type, role, and semantic meaning.

ACTION AND NAMING PATTERN:
- textbox, email, password, number, textarea → fill → fill<ElementName>Input()/fill<ElementName>Textarea()
- checkbox → check → check<ElementName>Checkbox()
- radio → check → check<ElementName>RadioButton()
- dropdown, combobox → select<ElementName>Dropdown(value)
- Use selectOption(value) only for native HTML <select> elements.
- For React, custom, and combobox-based dropdowns, generate a single select<ElementName>Dropdown(value) method that opens the dropdown and selects the option using the provided parameter value.
- If dropdown options, menu items, or list options are also selected, treat them as values of the parent dropdown and do not generate separate methods for individual options.
- For React Select and autocomplete-based dropdowns that contain an input or combobox element, enter the provided value and select the matching option.
- Prefer using the parameter value instead of generating hardcoded option locators.
- button → click → click<ElementName>Button()
- link → click → click<ElementName>Link()
- date picker → select → select<ElementName>Date()
- file upload → upload → upload<ElementName>()

CLASS PATTERN:

- Follow the SAMPLE_POM class structure exactly.
- Generate FrameLocator properties and initialization only when iframe elements exist.
- Method names must come from the selected element, not parent containers or sections.

REFERENCE:

SAMPLE_POM:
${selectedSample}

PAGE URL:
${pageUrl}

DOM CONTENT:

Each selected element contains:

- iframeOuterHTML
- elementOuterHTML
- parentOuterHTML

Use elementOuterHTML as the primary source of truth.
Use parentOuterHTML as additional context for understanding labels, containers, dropdowns, radios, checkboxes, and other related controls.
Use iframeOuterHTML only for FrameLocator generation.

${JSON.stringify(selectors, null, 2)}
`;

    const API_KEY = "AQ.Ab8RN6KUcxo0IxwHqJbKCbmXohnImJDLfQj-nGJB8jSVEuk9mQ"; // 🔥 API Key

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

    let result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    result = result
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```$/, "")
      .trim();

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating code";
  }
}

// 🔥 HANDLE MESSAGES FROM content.js
chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message received in sidepanel:", msg);

  if (msg.type === "ELEMENTS_GENERATED") {

    const list = msg.selectors;
    const pageUrl = msg.pageUrl;

    if (!list || list.length === 0) {
      document.getElementById("output").textContent =
        "No elements selected.";
      return;
    }

    // 🔄 Loading
    document.getElementById("output").textContent =
      "Generating with AI...";

    // 🔥 DIRECT GEMINI CALL
    const language = document.getElementById("language-select").value;
    const output = document.getElementById("output");
    output.className = `language-${language === "csharp" ? "csharp" : language}`;

    generateWithAI(list, pageUrl, language)
      .then((result) => {
        const output = document.getElementById("output");
        output.textContent = result;
        // Switch to Output tab automatically
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        document.querySelector("[data-tab='output-panel']").classList.add("active");
        document.getElementById("output-panel").classList.add("active");

        if (window.hljs) {
          delete output.dataset.highlighted;
          window.hljs.highlightElement(output);
        }
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("output").textContent =
          "Error generating code";
      });
  }
});
