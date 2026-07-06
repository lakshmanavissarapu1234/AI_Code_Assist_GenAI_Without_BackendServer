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

import {
  getPlaywrightPrompt,
  getSeleniumPrompt,
  getCombinedPrompt
} from "./prompts.js";

// ─── SAMPLE POM MAPS ─────────────────────────────────────────────

const playwrightSampleMap = {
  typescript: SAMPLE_POM_PLAYWRIGHT_TYPESCRIPT,
  javascript: SAMPLE_POM_PLAYWRIGHT_JAVASCRIPT,
  java:       SAMPLE_POM_PLAYWRIGHT_JAVA,
  python:     SAMPLE_POM_PLAYWRIGHT_PYTHON,
  csharp:     SAMPLE_POM_PLAYWRIGHT_CSHARP
};

const seleniumSampleMap = {
  java:       SAMPLE_POM_SELENIUM_JAVA,
  python:     SAMPLE_POM_SELENIUM_PYTHON,
  javascript: SAMPLE_POM_SELENIUM_JAVASCRIPT,
  csharp:     SAMPLE_POM_SELENIUM_CSHARP
};

const languageLabelMap = {
  typescript: "TypeScript",
  javascript: "JavaScript",
  java:       "Java",
  python:     "Python",
  csharp:     "C#"
};

const highlightLangMap = {
  typescript: "typescript",
  javascript: "javascript",
  java:       "java",
  python:     "python",
  csharp:     "csharp"
};

// ─── LOAD SAVED SETTINGS ON STARTUP ──────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["language", "framework"], (data) => {
    if (data.language) {
      document.getElementById("language-select").value = data.language;
    }
    if (data.framework) {
      document.getElementById("framework-select").value = data.framework;
      if (data.framework === "selenium") {
        const typescriptOption = document.querySelector(
          "#language-select option[value='typescript']"
        );
        if (typescriptOption) typescriptOption.style.display = "none";
        if (data.language === "typescript") {
          document.getElementById("language-select").value = "javascript";
        }
      }
    }
  });

  // Hide buttons if config tab is active on load
  const activeTab = document.querySelector(".tab-btn.active");
  if (activeTab && activeTab.dataset.tab === "config-panel") {
    document.querySelector(".top-controls").style.display = "none";
    document.querySelector(".bottom-controls").style.visibility = "hidden";
  }
});

// ─── UPDATE MODE INDICATOR ───────────────────────────────────────

function updateModeIndicator() {
  const testSteps = document.getElementById("test-steps").value.trim();
  const indicator = document.getElementById("mode-indicator");
  if (!indicator) return;
  if (testSteps.length > 0) {
    indicator.innerHTML = `<span class="mode-label">Mode: POM + Spec</span> — Test case steps detected. Generate will produce both Spec file and POM class.`;
  } else {
    indicator.innerHTML = `<span class="mode-label">Mode: POM Only</span> — Add test case steps below to also generate a Spec file.`;
  }
}

document.getElementById("test-steps").addEventListener("input", updateModeIndicator);

// ─── TAB SWITCHING ────────────────────────────────────────────────

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");

    const isConfig = btn.dataset.tab === "config-panel";
    document.querySelector(".top-controls").style.display = isConfig ? "none" : "flex";
    document.querySelector(".bottom-controls").style.display = isConfig ? "none" : "flex";
    document.querySelector(".bottom-controls").style.visibility = isConfig ? "hidden" : "visible";

    // Update mode indicator whenever config tab is opened
    if (isConfig) updateModeIndicator();
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

  const typescriptOption = document.querySelector(
    "#language-select option[value='typescript']"
  );
  const languageSelect = document.getElementById("language-select");

  if (framework === "selenium") {
    if (typescriptOption) typescriptOption.style.display = "none";
    if (languageSelect.value === "typescript") {
      languageSelect.value = "javascript";
      chrome.storage.local.set({ language: "javascript" });
    }
  } else {
    if (typescriptOption) typescriptOption.style.display = "block";
  }
});

// ─── START INSPECT ────────────────────────────────────────────────

document.getElementById("start").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (e) {
    console.log("Content script already injected");
  }

  setTimeout(() => {
    chrome.tabs.sendMessage(tab.id, { action: "START" });
  }, 100);

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
      document.getElementById("copy").textContent = "Copy Code";
    }, 1500);
  });
});

// ─── GEMINI API CALL ──────────────────────────────────────────────

async function callGemini(prompt) {
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

  return result;
}

// ─── PARSE COMBINED RESPONSE (POM + SPEC) ────────────────────────

function parseCombinedResponse(rawText) {
  const pomMatch = rawText.match(/===POM_START===([\s\S]*?)===POM_END===/);
  const specMatch = rawText.match(/===SPEC_START===([\s\S]*?)===SPEC_END===/);

  const pom = pomMatch
    ? pomMatch[1].trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
    : null;

  const spec = specMatch
    ? specMatch[1].trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
    : null;

  return { pom, spec };
}

// ─── FORMAT DISPLAY OUTPUT ───────────────────────────────────────

function formatCombinedOutput(spec, pom, languageLabel) {
  const divider = `\n${"─".repeat(60)}\n`;
  return (
    `// ═══════════════════════════════════════════════════════════\n` +
    `// SPEC FILE\n` +
    `// ═══════════════════════════════════════════════════════════\n\n` +
    spec +
    `\n\n` +
    `// ═══════════════════════════════════════════════════════════\n` +
    `// POM CLASS\n` +
    `// ═══════════════════════════════════════════════════════════\n\n` +
    pom
  );
}

// ─── HANDLE MESSAGES FROM content.js ─────────────────────────────

chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message received in sidepanel:", msg);

  if (msg.type === "ELEMENTS_GENERATED") {
    const list    = msg.selectors;
    const pageUrl = msg.pageUrl;

    if (!list || list.length === 0) {
      document.getElementById("output").textContent = "No elements selected.";
      return;
    }

    const framework    = document.getElementById("framework-select").value;
    const language     = document.getElementById("language-select").value;
    const languageLabel = languageLabelMap[language] || "TypeScript";
    const customPrompt = document.getElementById("custom-prompt").value.trim();
    const testSteps    = document.getElementById("test-steps").value.trim();

    // Validate Selenium + TypeScript
    if (framework === "selenium" && language === "typescript") {
      document.getElementById("output").textContent =
        "⚠️ Selenium does not support TypeScript.\nPlease select Java, Python, JavaScript, or C#.";
      return;
    }

    // Validate Selenium + Spec (Spec only supported for Playwright currently)
    if (framework === "selenium" && testSteps.length > 0) {
      document.getElementById("output").textContent =
        "⚠️ Spec file generation is currently supported for Playwright only.\nPlease clear the Test Case Steps or switch to Playwright.";
      return;
    }

    // Update syntax highlight class
    const output = document.getElementById("output");
    output.className = `language-${highlightLangMap[language] || "typescript"}`;

    const selectedSample = framework === "selenium"
      ? seleniumSampleMap[language]
      : playwrightSampleMap[language];

    // ── BRANCH: POM + SPEC (combined) vs POM only ────────────────
    if (testSteps.length > 0) {

      // POM + SPEC MODE
      output.textContent = `Generating Spec + POM (${languageLabel})...`;

      const prompt = getCombinedPrompt(
        list,
        pageUrl,
        languageLabel,
        selectedSample,
        testSteps,
        customPrompt
      );

      callGemini(prompt)
        .then((rawResult) => {
          const { pom, spec } = parseCombinedResponse(rawResult);

          if (!pom && !spec) {
            // Fallback: markers not found, show raw output
            output.textContent = rawResult
              .replace(/^```[a-zA-Z]*\n?/, "")
              .replace(/```$/, "")
              .trim();
          } else if (!spec) {
            // Only POM parsed
            output.textContent = pom;
          } else {
            // Both parsed — show Spec first, then POM
            output.textContent = formatCombinedOutput(spec, pom, languageLabel);
          }

          // Switch to Output tab
          switchToOutputTab();

          // Apply syntax highlighting
          if (window.hljs) {
            delete output.dataset.highlighted;
            window.hljs.highlightElement(output);
          }
        })
        .catch((err) => {
          console.error(err);
          output.textContent = "Error generating code. Please try again.";
        });

    } else {

      // POM ONLY MODE
      output.textContent = `Generating POM class (${languageLabel})...`;

      const prompt = framework === "selenium"
        ? getSeleniumPrompt(list, pageUrl, languageLabel, selectedSample, customPrompt)
        : getPlaywrightPrompt(list, pageUrl, languageLabel, selectedSample, customPrompt);

      callGemini(prompt)
        .then((result) => {
          output.textContent = result
            .replace(/^```[a-zA-Z]*\n?/, "")
            .replace(/```$/, "")
            .trim();

          // Switch to Output tab
          switchToOutputTab();

          // Apply syntax highlighting
          if (window.hljs) {
            delete output.dataset.highlighted;
            window.hljs.highlightElement(output);
          }
        })
        .catch((err) => {
          console.error(err);
          output.textContent = "Error generating code. Please try again.";
        });
    }
  }
});

// ─── SWITCH TO OUTPUT TAB ─────────────────────────────────────────

function switchToOutputTab() {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelector("[data-tab='output-panel']").classList.add("active");
  document.getElementById("output-panel").classList.add("active");
  document.querySelector(".top-controls").style.display = "flex";
  document.querySelector(".bottom-controls").style.display = "flex";
  document.querySelector(".bottom-controls").style.visibility = "visible";
}