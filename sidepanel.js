import { SAMPLE_POM } from "./samplePOM.js";

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
async function generateWithAI(selectors, pageUrl) {
  try {

    const prompt = `
You are a senior Playwright automation framework architect.

Generate a complete Playwright Page Object Model (POM) class in TypeScript.

REQUIREMENTS :

Output ONLY valid TypeScript code.
Generate methods only for the selected elements.
Follow the SAMPLE_POM style exactly.
Use tryLocators in every method.
Use FrameLocator when iframeOuterHTML exists.
Do not generate helper methods.
Use only information available in pageUrl, iframeOuterHTML, and elementOuterHTML.
Do not invent locators.

IMPLEMENTATION GUIDELINES :

Generate meaningful page class names from the page URL.
Generate meaningful method names from the selected element.
Generate meaningful locator array names.
Generate meaningful resolved locator names.
Use only locators that can be inferred from the provided DOM content.
Locator priority: getByRole > getByLabel > getByPlaceholder > id > getByText > name > css > xpath.
Prefer fewer strong locators over many weak locators.
Avoid duplicate locators.
Avoid .first(), .last(), and .nth() unless absolutely necessary.
Every generated method must include a meaningful console.log after the action.

CLASS PATTERN :

Follow the class structure shown in SAMPLE_POM.
Generate FrameLocator properties and initialization only when iframe elements exist.
Generate method names from the selected element, not from parent containers or sections.

SAMPLE_POM :

The SAMPLE_POM is the reference implementation.

Observe and follow the SAMPLE_POM as the reference implementation for naming, locator generation, tryLocators usage, FrameLocator usage, logging, formatting, and overall coding style.

${SAMPLE_POM}

PAGE URL :

${pageUrl}

DOM CONTENT :

Each selected element contains:

- iframeOuterHTML
- elementOuterHTML

Use elementOuterHTML as the primary source of truth.

Use iframeOuterHTML only for FrameLocator generation.

${JSON.stringify(selectors, null, 2)}
`;

    const API_KEY = ""; // 🔥 API Key

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
    generateWithAI(list, pageUrl)
      .then((result) => {
        document.getElementById("output").textContent = result;
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("output").textContent =
          "Error generating code";
      });
  }
});
