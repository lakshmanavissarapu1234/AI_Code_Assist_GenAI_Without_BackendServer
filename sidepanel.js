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
    "No elements selected yet";
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
async function generateWithAI(selectors) {
  try {
    const stored = await chrome.storage.local.get("currentPageUrl");
    const url = stored.currentPageUrl || "";

    const prompt = `
You are a senior Playwright automation framework architect.

Generate a STRICT Page Object Model (POM) class in TypeScript.

=====================
STRICT RULES (MANDATORY)
=====================

1. Output ONLY valid TypeScript code
2. DO NOT include explanation, markdown, or comments
3. DO NOT create any wrapper/helper functions (NO reportStep)
4. DO NOT abstract actions
5. Each method must directly perform the action
6. Add async and await as methods are asynchronous
7. Add meaningful comments before the method (e.g., // Fill First Name input)
8. Generate the POM Class properly with correct format and syntax

=====================
IMPORTS
=====================

import { Page , FrameLocator , Locator } from '@playwright/test';
import { tryLocators } from './utils/commonMethods';

=====================
CLASS RULES
=====================

- Generate smart class name based on URL
- Class MUST be exported:
  export class <PageName>

- Constructor:
  private page: Page

=====================
METHOD RULES
=====================

Each method MUST:

1. Define locators array
2. Call tryLocators
3. Perform action directly
4. Add console.log AFTER action

=====================
NAMING CONVENTIONS (STRICT)
=====================

- Method names MUST follow:

  fill<FieldName>Input
  click<ElementName>Button
  click<ElementName>Link
  check<ElementName>Radio
  check<ElementName>Checkbox
  select<ElementName>Dropdown

- Examples:

  fillFirstNameInput
  fillEmailInput
  clickSubmitButton
  checkMaleRadio
  checkSundayCheckbox
  selectCountryDropdown

- NEVER use:
  element, element1, field, data

=====================
LOCATOR RULES (STRICT FILTERING)
=====================

- Use MINIMUM 2 and MAXIMUM 5 locators (up to 6 only if necessary)

- PRIORITY ORDER (STRICT):

  1. getByRole
  2. getByLabel
  3. getByPlaceholder
  4. id locator (#id)
  5. getByText
  6. name attribute
  7. CSS locator (only if specific)
  8. XPath (last fallback only)

- DO NOT use:
  - onclick attribute
  - value attribute (unless absolutely required)
  - generic CSS (e.g., input.form-control)
  - duplicate locators

- Each locator must be:
  ✔ unique
  ✔ stable
  ✔ meaningful

- If strong locators exist (role/label/id), DO NOT add weak ones unnecessarily
- Prefer fewer high-quality locators over many weak locators.

- DO NOT duplicate locators

=====================
LOCATOR ELIMINATION RULE (CRITICAL)
=====================

- If ID locator is present → DO NOT include xpath
- If label/role exists → DO NOT include name/value/css
- DO NOT include generic css (input.form-control, button.class)
- DO NOT include xpath if id or label is available
- Remove weaker locators if stronger ones exist

- Final locator array must contain ONLY strongest locators

=====================
ACTION RULES
=====================

- input/textarea → element.fill(value)
- button/link → element.click()
- checkbox/radio → element.check()
- select → element.selectOption(value)

LOCATOR ARRAY RULE:

- Locators MUST be direct Playwright locators
- DO NOT wrap locators inside functions
- DO NOT use () => this.page.locator(...)
- Use only:

  this.page.locator(...)
  this.page.getByRole(...)
  this.page.getByLabel(...)
  this.page.getByPlaceholder(...)

LOGGING RULE:

- After every action, add:

  console.log('<Meaningful message>');

- Examples:

  console.log('Filled First Name input');
  console.log('Clicked Submit button');

- DO NOT include prefixes like [ACTION]

=====================
ERROR MESSAGE RULE (STRICT):
=====================

- Format must be:

  'Unable to find the <ElementName> locator'

- Examples:

  'Unable to find the Name input locator'
  'Unable to find the Submit button locator'
  'Unable to find the Male radio locator'

=====================
VALIDATION RULE
=====================

If any of these appear, output is INVALID:

- reportStep
- wrapper functions
- generic locators
- wrong naming pattern
- missing console.log

Regenerate correctly.

=====================
URL
=====================

${url}

=====================
SELECTORS
=====================

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

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating code";
  }
}

// 🔥 HANDLE MESSAGES FROM content.js
chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message received in sidepanel:", msg);

  // Store URL
  if (msg.type === "PAGE_URL") {
    chrome.storage.local.set({ currentPageUrl: msg.url });
  }

  if (msg.type === "ELEMENTS_GENERATED") {

    const list = msg.selectors;

    if (!list || list.length === 0) {
      document.getElementById("output").textContent =
        "No elements selected.";
      return;
    }

    // 🔄 Loading
    document.getElementById("output").textContent =
      "Generating with AI...";

    // 🔥 DIRECT GEMINI CALL
    generateWithAI(list)
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