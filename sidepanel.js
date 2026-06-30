import {
  SAMPLE_POM_PLAYWRIGHT_TYPESCRIPT,
  SAMPLE_POM_PLAYWRIGHT_JAVASCRIPT,
  SAMPLE_POM_PLAYWRIGHT_JAVA,
  SAMPLE_POM_PLAYWRIGHT_PYTHON,
  SAMPLE_POM_PLAYWRIGHT_CSHARP,
  SAMPLE_POM_SELENIUM_JAVA,
  SAMPLE_POM_SELENIUM_PYTHON,
  SAMPLE_POM_SELENIUM_JAVASCRIPT,
  SAMPLE_POM_SELENIUM_CSHARP
} from "./samplePOM.js";

import { getPlaywrightPrompt, getSeleniumPrompt } from "./prompts.js";

// ─── SAMPLE POM MAP ───────────────────────────────────────────────

const playwrightSampleMap = {
  typescript: SAMPLE_POM_PLAYWRIGHT_TYPESCRIPT,
  javascript: SAMPLE_POM_PLAYWRIGHT_JAVASCRIPT,
  java: SAMPLE_POM_PLAYWRIGHT_JAVA,
  python: SAMPLE_POM_PLAYWRIGHT_PYTHON,
  csharp: SAMPLE_POM_PLAYWRIGHT_CSHARP
};

const seleniumSampleMap = {
  java: SAMPLE_POM_SELENIUM_JAVA,
  python: SAMPLE_POM_SELENIUM_PYTHON,
  javascript: SAMPLE_POM_SELENIUM_JAVASCRIPT,
  csharp: SAMPLE_POM_SELENIUM_CSHARP
};

const languageLabelMap = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  java: "Java",
  python: "Python",
  csharp: "C#"
};

const highlightLangMap = {
  typescript: "typescript",
  javascript: "javascript",
  java: "java",
  python: "python",
  csharp: "csharp"
};

// ─── LOAD SAVED SETTINGS ON STARTUP ──────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["language", "framework"], (data) => {
    if (data.language) {
      document.getElementById("language-select").value = data.language;
    }
    if (data.framework) {
      document.getElementById("framework-select").value = data.framework;
      // Hide TypeScript if Selenium is saved
      if (data.framework === "selenium") {
        const typescriptOption = document.querySelector("#language-select option[value='typescript']");
        typescriptOption.style.display = "none";
        if (data.language === "typescript") {
          document.getElementById("language-select").value = "javascript";
        }
      }
    }
  });

  // Check active tab on load and hide/show buttons accordingly
  const activeTab = document.querySelector(".tab-btn.active");
  if (activeTab && activeTab.dataset.tab === "config-panel") {
    document.querySelector(".top-controls").style.display = "none";
    document.querySelector(".bottom-controls").style.visibility = "hidden";
  }
});

// ─── TAB SWITCHING ────────────────────────────────────────────────

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    // Hide/show buttons based on active tab
    const isConfig = btn.dataset.tab === "config-panel";
    document.querySelector(".top-controls").style.display = isConfig ? "none" : "flex";
    document.querySelector(".bottom-controls").style.display = isConfig ? "none" : "flex";
    document.querySelector(".bottom-controls").style.visibility = isConfig ? "hidden" : "visible";
  });
});

// ─── SAVE SETTINGS WHEN CHANGED ──────────────────────────────────

document.getElementById("language-select").addEventListener("change", () => {
  const language = document.getElementById("language-select").value;
  chrome.storage.local.set({ language });
});

document.getElementById("framework-select").addEventListener("change", () => {
  const framework = document.getElementById("framework-select").value;
  chrome.storage.local.set({ framework });

  // Hide TypeScript option for Selenium
  const typescriptOption = document.querySelector("#language-select option[value='typescript']");
  const languageSelect = document.getElementById("language-select");

  if (framework === "selenium") {
    typescriptOption.style.display = "none";
    // If TypeScript is currently selected, switch to JavaScript
    if (languageSelect.value === "typescript") {
      languageSelect.value = "javascript";
      chrome.storage.local.set({ language: "javascript" });
    }
  } else {
    typescriptOption.style.display = "block";
  }
});

// ─── START INSPECT ────────────────────────────────────────────────

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

// ─── PAUSE ────────────────────────────────────────────────────────

document.getElementById("pause").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "STOP" });
  document.getElementById("output").textContent =
    "Inspect mode PAUSED (selections retained)";
});

// ─── GENERATE ────────────────────────────────────────────────────

document.getElementById("generate").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "GENERATE" });
});

// ─── RESET ────────────────────────────────────────────────────────

document.getElementById("reset").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "RESET" });
  document.getElementById("output").textContent =
    "Reset completed (all selections cleared)";
});

// ─── COPY ─────────────────────────────────────────────────────────

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

// ─── GEMINI API CALL ──────────────────────────────────────────────

async function generateWithAI(prompt) {
  try {
    const API_KEY = ""; // Replace with your actual API key

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
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

// ─── HANDLE MESSAGES FROM content.js ─────────────────────────────

chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message received in sidepanel:", msg);

  if (msg.type === "ELEMENTS_GENERATED") {
    const list = msg.selectors;
    const pageUrl = msg.pageUrl;

    if (!list || list.length === 0) {
      document.getElementById("output").textContent = "No elements selected.";
      return;
    }

    // Read selected framework and language
    const framework = document.getElementById("framework-select").value;
    const language = document.getElementById("language-select").value;
    const languageLabel = languageLabelMap[language] || "TypeScript";

    // Validate Selenium + TypeScript combination
    if (framework === "selenium" && language === "typescript") {
      document.getElementById("output").textContent =
        "⚠️ Selenium does not support TypeScript.\nPlease select Java, Python, JavaScript, or C# for Selenium.";
      return;
    }

    // Pick correct sample POM
    const selectedSample = framework === "selenium"
      ? seleniumSampleMap[language]
      : playwrightSampleMap[language];

    // Read custom prompt
    const customPrompt = document.getElementById("custom-prompt").value.trim();

    // Pick correct prompt
    const prompt = framework === "selenium"
      ? getSeleniumPrompt(list, pageUrl, languageLabel, selectedSample, customPrompt)
      : getPlaywrightPrompt(list, pageUrl, languageLabel, selectedSample, customPrompt);

    // Update syntax highlight class
    const output = document.getElementById("output");
    output.className = `language-${highlightLangMap[language] || "typescript"}`;

    // Show loading message
    output.textContent = `Generating ${languageLabel} ${framework} POM class...`;

    // Call Gemini API
    generateWithAI(prompt)
      .then((result) => {
        const output = document.getElementById("output");
        output.textContent = result;

        // Switch to Output tab automatically
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        document.querySelector("[data-tab='output-panel']").classList.add("active");
        document.getElementById("output-panel").classList.add("active");
        document.querySelector(".top-controls").style.display = "flex";
        document.querySelector(".bottom-controls").style.display = "flex";
        document.querySelector(".bottom-controls").style.visibility = "visible";

        // Apply syntax highlighting
        if (window.hljs) {
          delete output.dataset.highlighted;
          window.hljs.highlightElement(output);
        }
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("output").textContent = "Error generating code";
      });
  }
});