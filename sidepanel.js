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

let lastCapturedSelectors = [];
let activeOutputTab = "spec";
const outputContents = {
  spec: "Click on Start Inspect to select elements",
  pom: "No POM generated yet.",
  json: "No JSON generated yet."
};

function normalizePageInfo(pageUrl) {
  try {
    const parsedUrl = new URL(pageUrl);
    const pathname = parsedUrl.pathname && parsedUrl.pathname !== "/"
      ? parsedUrl.pathname
      : "";
    const normalizedPath = `${parsedUrl.origin}${pathname}`.replace(/\/$/, "");

    return {
      pageId: `page:${parsedUrl.hostname}${pathname || "/"}`,
      urlPattern: normalizedPath || parsedUrl.origin
    };
  } catch (error) {
    return {
      pageId: `page:${(pageUrl || "unknown").toString().slice(0, 80)}`,
      urlPattern: pageUrl || "unknown"
    };
  }
}

function capitalizeFirstLetter(value) {
  if (!value) return "Perform the action";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderActiveOutput(language) {
  const output = document.getElementById("output");
  if (!output) return;

  const selectedLanguage = language || document.getElementById("language-select")?.value || "typescript";
  output.textContent = outputContents[activeOutputTab] || "";
  output.className = `language-${highlightLangMap[selectedLanguage] || "typescript"}`;

  if (window.hljs) {
    delete output.dataset.highlighted;
    window.hljs.highlightElement(output);
  }
}

function setActiveOutputTab(tab, language) {
  activeOutputTab = tab;

  document.querySelectorAll(".output-subtab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.outputTab === tab);
  });

  renderActiveOutput(language);
}

function updateOutputContent(tab, content, language) {
  outputContents[tab] = content;
  if (activeOutputTab === tab) {
    renderActiveOutput(language);
  }
}

function showOutputMessage(message, language) {
  updateOutputContent(activeOutputTab, message, language);
}

function setOutputTabsVisible(visible) {
  const container = document.querySelector(".output-subtabs");
  if (!container) return;
  container.classList.toggle("hidden", !visible);
}

function resetOutputPanel(language) {
  activeOutputTab = "spec";
  outputContents.spec = "Click on Start Inspect to select elements";
  outputContents.pom = "No POM generated yet.";
  outputContents.json = "No JSON generated yet.";
  setOutputTabsVisible(false);
  renderActiveOutput(language);
}

function inferMethodDescription(methodName) {
  const normalizedText = methodName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();

  if (!normalizedText) return "Perform the action defined in this page object method.";

  return capitalizeFirstLetter(normalizedText.replace(/\s+/g, " "));
}

function extractMethodLocators(methodBody) {
  const locatorRegex = /getBy(?:Role|Label|Placeholder)\([^)]*\)|locator\(['"`][^'"`]+['"`]\)|By\.(id|name|cssSelector|xpath|className|linkText|partialLinkText)\([^)]*\)|findElement\([^)]*\)|page\.locator\([^)]*\)|this\.page\.[\w\.]+\([^)]*\)/g;
  const matches = [...methodBody.matchAll(locatorRegex)]
    .map((match) => match[0].trim())
    .filter(Boolean);

  return [...new Set(matches)].slice(0, 3);
}

function extractMethodsFromPomCode(pageObjectCode) {
  if (!pageObjectCode) return [];

  const cleanedCode = pageObjectCode
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  const lines = cleanedCode.split(/\r?\n/);
  const methods = [];
  const seenNames = new Set();

  const methodPatterns = [
    /^\s*(?:public|private|protected|async|static|final|override|virtual|synchronized|readonly)\s+(?:[\w<>\[\],.?]+)\s+([A-Za-z_][\w]*)\s*\([^;)]*\)\s*(?:=>|{|:)/,
    /^\s*def\s+([A-Za-z_][\w]*)\s*\([^;)]*\)\s*:/,
    /^\s*([A-Za-z_][\w]*)\s*\([^;)]*\)\s*(?:=>|{)/
  ];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    let methodName = null;

    for (const pattern of methodPatterns) {
      const match = line.match(pattern);
      if (match) {
        methodName = match[1];
        break;
      }
    }

    if (!methodName || /^(constructor|class|function|if|for|while|switch|try|catch|finally|return)$/i.test(methodName)) {
      continue;
    }

    if (seenNames.has(methodName)) continue;
    seenNames.add(methodName);

    const bodySnippet = lines.slice(index, Math.min(index + 12, lines.length)).join("\n");
    methods.push({
      name: methodName,
      description: inferMethodDescription(methodName),
      locators: extractMethodLocators(bodySnippet)
    });
  }

  return methods;
}

function buildPOMMemory(pageUrl, pageObjectCode, language) {
  const { pageId, urlPattern } = normalizePageInfo(pageUrl);

  return {
    projectId: "default-project",
    pageId,
    urlPattern,
    pageObjectCode,
    methods: extractMethodsFromPomCode(pageObjectCode),
    version: 1,
    lastUpdated: new Date().toISOString(),
    language
  };
}

function loadExistingPOMMemory(pageUrl, callback) {
  const { pageId } = normalizePageInfo(pageUrl);

  chrome.storage.local.get(["pageObjectMemories"], (data) => {
    const memories = data.pageObjectMemories || {};
    callback(memories[pageId] || null);
  });
}

function savePOMMemory(pageUrl, pageObjectCode, language) {
  if (!pageObjectCode) return;

  const memory = buildPOMMemory(pageUrl, pageObjectCode, language);

  chrome.storage.local.get(["pageObjectMemories"], (data) => {
    const memories = data.pageObjectMemories || {};
    memories[memory.pageId] = memory;
    chrome.storage.local.set({ pageObjectMemories: memories });
  });
}

function serializeExistingPOMMemory(memory) {
  if (!memory || !memory.methods || memory.methods.length === 0) {
    return "";
  }

  const methodsBlock = memory.methods.map((method) => {
    const locatorText = method.locators && method.locators.length > 0
      ? ` | Locators: ${method.locators.join(", ")}`
      : "";
    return `- ${method.name}: ${method.description}${locatorText}`;
  }).join("\n");

  return [
    "EXISTING PAGE OBJECT MEMORY FOR THIS PAGE",
    `Page ID: ${memory.pageId}`,
    `URL Pattern: ${memory.urlPattern}`,
    "Existing methods:",
    methodsBlock,
    "Reuse these methods when they match the current test steps. Do not regenerate the whole POM unless you need to add a new action."
  ].join("\n");
}

// ─── LOAD SAVED SETTINGS ON STARTUP ──────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".output-subtab").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveOutputTab(btn.dataset.outputTab, document.getElementById("language-select")?.value || "typescript");
    });
  });

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

  setOutputTabsVisible(false);
  setActiveOutputTab("spec", document.getElementById("language-select")?.value || "typescript");
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

  showOutputMessage("Inspect mode ON (hover and select elements)");
});

// ─── PAUSE ────────────────────────────────────────────────────────

document.getElementById("pause").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "STOP" });
  showOutputMessage("Inspect mode PAUSED (selections retained)");
});

// ─── GENERATE ────────────────────────────────────────────────────

document.getElementById("generate").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  setOutputTabsVisible(false);
  chrome.tabs.sendMessage(tab.id, { action: "GENERATE" });
});

// ─── CAPTURE DOM SNAPSHOT ───────────────────────────────────────

document.getElementById("capture-dom").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (e) {
    console.log("Content script already injected");
  }

  chrome.tabs.sendMessage(tab.id, { action: "CAPTURE_DOM" });
  showOutputMessage("Capturing filtered DOM snapshot...");
});

// ─── RESET ────────────────────────────────────────────────────────

document.getElementById("reset").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "RESET" });
  resetOutputPanel(document.getElementById("language-select")?.value || "typescript");
});

// ─── COPY ─────────────────────────────────────────────────────────

document.getElementById("copy").addEventListener("click", () => {
  const text = outputContents[activeOutputTab] || document.getElementById("output").textContent || "";
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
  const jsonMatch = rawText.match(/===JSON_START===([\s\S]*?)===JSON_END===/);

  const pom = pomMatch
    ? pomMatch[1].trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
    : null;

  const spec = specMatch
    ? specMatch[1].trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
    : null;

  const json = jsonMatch
    ? jsonMatch[1].trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim()
    : null;

  return { pom, spec, json };
}

// ─── FORMAT DISPLAY OUTPUT ───────────────────────────────────────

function formatCombinedOutput(spec, pom, json) {
  return [spec, pom, json].filter(Boolean).join("\n\n");
}

// ─── HANDLE MESSAGES FROM content.js ─────────────────────────────

chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message received in sidepanel:", msg);

  if (msg.type === "DOM_CAPTURED") {
    const list = msg.selectors || [];
    const pageUrl = msg.pageUrl;
    lastCapturedSelectors = list;

    chrome.storage.local.set({ lastCapturedSelectors: list });

    if (!list || list.length === 0) {
      showOutputMessage("No elements selected for capture.");
      return;
    }

    const memory = buildPOMMemory(pageUrl, JSON.stringify(list, null, 2), document.getElementById("language-select").value);
    savePOMMemory(pageUrl, JSON.stringify(list, null, 2), document.getElementById("language-select").value);

    showOutputMessage(`Captured filtered DOM snapshot for ${memory.pageId}.`);
    return;
  }

  if (msg.type === "ELEMENTS_GENERATED") {
    const list    = (msg.selectors && msg.selectors.length > 0 ? msg.selectors : lastCapturedSelectors) || [];
    const pageUrl = msg.pageUrl;

    if (!list || list.length === 0) {
      showOutputMessage("No elements selected or captured.");
      return;
    }

    const framework    = document.getElementById("framework-select").value;
    const language     = document.getElementById("language-select").value;
    const languageLabel = languageLabelMap[language] || "TypeScript";
    const customPrompt = document.getElementById("custom-prompt").value.trim();
    const testSteps    = document.getElementById("test-steps").value.trim();

    if (framework === "selenium" && language === "typescript") {
      showOutputMessage("⚠️ Selenium does not support TypeScript.\nPlease select Java, Python, JavaScript, or C#.");
      return;
    }

    if (framework === "selenium" && testSteps.length > 0) {
      showOutputMessage("⚠️ Spec file generation is currently supported for Playwright only.\nPlease clear the Test Case Steps or switch to Playwright.");
      return;
    }

    const output = document.getElementById("output");
    output.className = `language-${highlightLangMap[language] || "typescript"}`;

    const selectedSample = framework === "selenium"
      ? seleniumSampleMap[language]
      : playwrightSampleMap[language];

    loadExistingPOMMemory(pageUrl, (existingMemory) => {
      const existingPOMContext = serializeExistingPOMMemory(existingMemory);

      if (existingMemory) {
        showOutputMessage(`Reusing saved POM for this page (${existingMemory.pageId})...`);
      }

      if (testSteps.length > 0) {
        showOutputMessage(existingMemory
          ? `Generating Spec + POM + JSON using saved page memory (${languageLabel})...`
          : `Generating Spec + POM + JSON (${languageLabel})...`, language);

        const prompt = getCombinedPrompt(
          list,
          pageUrl,
          languageLabel,
          selectedSample,
          testSteps,
          customPrompt,
          existingPOMContext
        );

        callGemini(prompt)
          .then((rawResult) => {
            const { pom, spec, json } = parseCombinedResponse(rawResult);

            if (!pom && !spec && !json) {
              updateOutputContent("spec", rawResult
                .replace(/^```[a-zA-Z]*\n?/, "")
                .replace(/```$/, "")
                .trim(), language);
              updateOutputContent("pom", "No POM generated.", language);
              updateOutputContent("json", "No JSON generated.", language);
              setOutputTabsVisible(true);
              renderActiveOutput(language);
            } else if (!spec && !json) {
              updateOutputContent("spec", spec || "No spec generated.", language);
              updateOutputContent("pom", pom || "No POM generated.", language);
              updateOutputContent("json", json || "No JSON generated.", language);
              setOutputTabsVisible(true);
              renderActiveOutput(language);
            } else {
              updateOutputContent("spec", spec || "No spec generated.", language);
              updateOutputContent("pom", pom || "No POM generated.", language);
              updateOutputContent("json", json || "No JSON generated.", language);
              setOutputTabsVisible(true);
              renderActiveOutput(language);
            }

            if (pom) {
              savePOMMemory(pageUrl, pom, language);
            }

            switchToOutputTab();

            if (window.hljs) {
              delete output.dataset.highlighted;
              window.hljs.highlightElement(output);
            }
          })
          .catch((err) => {
            console.error(err);
            showOutputMessage("Error generating code. Please try again.", language);
          });
      } else {
        showOutputMessage(existingMemory
          ? `Generating POM class using saved page memory (${languageLabel})...`
          : `Generating POM class (${languageLabel})...`);

        const prompt = framework === "selenium"
          ? getSeleniumPrompt(list, pageUrl, languageLabel, selectedSample, existingPOMContext)
          : getPlaywrightPrompt(list, pageUrl, languageLabel, selectedSample, existingPOMContext);

        callGemini(prompt)
          .then((result) => {
            const cleanedResult = result
              .replace(/^```[a-zA-Z]*\n?/, "")
              .replace(/```$/, "")
              .trim();

            updateOutputContent("pom", cleanedResult, language);
            updateOutputContent("spec", "No spec generated.", language);
            updateOutputContent("json", "No JSON generated.", language);
            setOutputTabsVisible(true);
            renderActiveOutput(language);
            savePOMMemory(pageUrl, cleanedResult, language);

            switchToOutputTab();

            if (window.hljs) {
              delete output.dataset.highlighted;
              window.hljs.highlightElement(output);
            }
          })
          .catch((err) => {
            console.error(err);
            showOutputMessage("Error generating code. Please try again.", language);
          });
      }
    });
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