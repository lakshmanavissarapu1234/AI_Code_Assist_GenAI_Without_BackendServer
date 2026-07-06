// ─── PLAYWRIGHT PROMPT ────────────────────────────────────────────

export function getPlaywrightPrompt(selectors, pageUrl, languageLabel, selectedSample) {
  return `
You are a senior Playwright automation framework architect.

Generate a complete Playwright Page Object Model (POM) class in ${languageLabel}.

REQUIREMENTS:
- Output ONLY valid ${languageLabel} code.
- Generate methods strictly for the provided selected elements.
- Follow the SAMPLE_POM style exactly.
- Use tryLocators in every method (only for TypeScript and JavaScript, skip for other languages).
- Use FrameLocator only when iframeOuterHTML exists.
- Do not generate helper methods.
- Use only information available in pageUrl, iframeOuterHTML, and elementOuterHTML.
- Do not invent locators.

IMPLEMENTATION GUIDELINES:
- Derive meaningful page class names from the page URL.
- Derive meaningful method names directly from the selected element.
- Use only locators inferred from the provided DOM content.
- Locator priority: getByRole > getByLabel > getByPlaceholder > id > getByText > name > css > xpath.
- For Java: use Playwright Java API (com.microsoft.playwright). Follow SAMPLE_POM exactly.
- For Python: use Playwright Python API (playwright.sync_api). Follow SAMPLE_POM exactly.
- For C#: use Playwright C# API (Microsoft.Playwright). Follow SAMPLE_POM exactly.
- For JavaScript: use Playwright JS API. Follow SAMPLE_POM exactly.
- Always follow the SAMPLE_POM language style strictly. Do not mix languages.
- Use XPath only when no other locator type can be inferred.
- Prefer fewer strong locators over multiple weak locators.
- Avoid duplicate locators.
- Avoid .first(), .last(), and .nth() unless absolutely necessary.
- Every generated method must include a meaningful console.log after the action.

ACTION AND NAMING PATTERN:
- textbox, email, password, number, textarea → fill → fill<ElementName>Input()
- checkbox → check → check<ElementName>Checkbox()
- radio → check → check<ElementName>RadioButton()
- dropdown, combobox → select<ElementName>Dropdown(value)
- Use selectOption(value) only for native HTML select elements.
- For React, custom, combobox-based dropdowns → generate single select<ElementName>Dropdown(value) method.
- button → click → click<ElementName>Button()
- link → click → click<ElementName>Link()
- date picker → select → select<ElementName>Date()
- file upload → upload → upload<ElementName>()

CLASS PATTERN:
- Follow the SAMPLE_POM class structure exactly.
- Generate FrameLocator properties only when iframe elements exist.
- Method names must come from the selected element, not parent containers.

REFERENCE SAMPLE_POM:
${selectedSample}

PAGE URL:
${pageUrl}

DOM CONTENT:
Each selected element contains iframeOuterHTML and elementOuterHTML.
- Use elementOuterHTML as primary source of truth.
- Use iframeOuterHTML only for FrameLocator generation.
- Use the PAGE URL above for deriving the class name.

${JSON.stringify(selectors, null, 2)}
`;
}

// ─── SELENIUM PROMPT ──────────────────────────────────────────────

export function getSeleniumPrompt(selectors, pageUrl, languageLabel, selectedSample) {
  return `
You are a senior Selenium automation framework architect.

Generate a complete Selenium Page Object Model (POM) class in ${languageLabel}.

REQUIREMENTS:
- Output ONLY valid ${languageLabel} code.
- Generate methods strictly for the provided selected elements.
- Follow the SAMPLE_POM style exactly.
- Do not generate helper methods.
- Use only information available in pageUrl, iframeOuterHTML, and elementOuterHTML.
- Do not invent locators.

IMPLEMENTATION GUIDELINES:
- Derive meaningful page class names from the page URL.
- Derive meaningful method names directly from the selected element.
- Use only locators inferred from the provided DOM content.
- Locator priority: id > name > css > xpath > linkText.
- Use XPath only when no other locator type can be inferred.
- For Java: use Selenium Java with PageFactory and @FindBy annotations. Follow SAMPLE_POM exactly.
- For Python: use Selenium Python with find_element(By.X). Follow SAMPLE_POM exactly.
- For JavaScript: use Selenium WebDriver JS with findElement. Follow SAMPLE_POM exactly.
- For C#: use Selenium C# with IWebDriver and FindElement(By.X). Follow SAMPLE_POM exactly.
- Always follow the SAMPLE_POM language style strictly. Do not mix languages.
- Every generated method must include a meaningful console.log/print after the action.
- For dropdowns use Select class (Java/C#/Python) or xpath option click (JavaScript).
- For checkboxes check isSelected() before clicking.

ACTION AND NAMING PATTERN:
- textbox, email, password, number, textarea → fill → fill<ElementName>Input()
- checkbox → check → check<ElementName>Checkbox()
- radio → select → select<ElementName>RadioButton()
- dropdown → select → select<ElementName>Dropdown(value)
- button → click → click<ElementName>Button()
- link → click → click<ElementName>Link()

CLASS PATTERN:
- Follow the SAMPLE_POM class structure exactly.
- For Java: use @FindBy annotations and PageFactory.
- For Python: use find_element inside each method.
- For JavaScript: use findElement inside each method.
- For C#: use FindElement inside each method.
- Method names must come from the selected element, not parent containers.

REFERENCE SAMPLE_POM:
${selectedSample}

PAGE URL:
${pageUrl}

DOM CONTENT:
Each selected element contains iframeOuterHTML and elementOuterHTML.
- Use elementOuterHTML as primary source of truth.
- iframeOuterHTML is not used for Selenium (no FrameLocator in Selenium).
- Use the PAGE URL above for deriving the class name.

${JSON.stringify(selectors, null, 2)}
`;
}

// ─── COMBINED POM + SPEC PROMPT (Playwright only, for now) ───────

export function getCombinedPrompt(selectors, pageUrl, languageLabel, selectedSample, testSteps, customPrompt = "") {
  return `
You are a senior Playwright automation framework architect.

You must complete this task in TWO ORDERED STAGES, both inside this single response.
Do not skip a stage. Do not merge the stages. Follow the exact output format below.

═══════════════════════════════════════════
STAGE 1 — GENERATE THE POM CLASS
═══════════════════════════════════════════

Generate a complete Playwright Page Object Model (POM) class in ${languageLabel}.

REQUIREMENTS:
- Output ONLY valid ${languageLabel} code.
- Generate methods strictly for the provided selected elements.
- Follow the SAMPLE_POM style exactly.
- Use tryLocators in every method (only for TypeScript and JavaScript, skip for other languages).
- Use FrameLocator only when iframeOuterHTML exists.
- Do not generate helper methods.
- Use only information available in pageUrl, iframeOuterHTML, and elementOuterHTML.
- Do not invent locators.

IMPLEMENTATION GUIDELINES:
- Derive meaningful page class names from the page URL.
- Derive meaningful method names directly from the selected element.
- Use only locators inferred from the provided DOM content.
- Locator priority: getByRole > getByLabel > getByPlaceholder > id > getByText > name > css > xpath.
- For Java: use Playwright Java API (com.microsoft.playwright). Follow SAMPLE_POM exactly.
- For Python: use Playwright Python API (playwright.sync_api). Follow SAMPLE_POM exactly.
- For C#: use Playwright C# API (Microsoft.Playwright). Follow SAMPLE_POM exactly.
- For JavaScript: use Playwright JS API. Follow SAMPLE_POM exactly.
- Always follow the SAMPLE_POM language style strictly. Do not mix languages.
- Use XPath only when no other locator type can be inferred.
- Prefer fewer strong locators over multiple weak locators.
- Avoid duplicate locators.
- Avoid .first(), .last(), and .nth() unless absolutely necessary.
- Every generated method must include a meaningful console.log after the action.

ACTION AND NAMING PATTERN:
- textbox, email, password, number, textarea → fill → fill<ElementName>Input()
- checkbox → check → check<ElementName>Checkbox()
- radio → check → check<ElementName>RadioButton()
- dropdown, combobox → select<ElementName>Dropdown(value)
- Use selectOption(value) only for native HTML select elements.
- For React, custom, combobox-based dropdowns → generate single select<ElementName>Dropdown(value) method.
- button → click → click<ElementName>Button()
- link → click → click<ElementName>Link()
- date picker → select → select<ElementName>Date()
- file upload → upload → upload<ElementName>()

CLASS PATTERN:
- Follow the SAMPLE_POM class structure exactly.
- Generate FrameLocator properties only when iframe elements exist.
- Method names must come from the selected element, not parent containers.
- Generate a method for EVERY selected element provided below, even if a particular
  method is not needed for the test steps in Stage 2. The POM should represent
  full page coverage of all selected elements.

REFERENCE SAMPLE_POM:
${selectedSample}

PAGE URL:
${pageUrl}

DOM CONTENT:
Each selected element contains iframeOuterHTML and elementOuterHTML.
- Use elementOuterHTML as primary source of truth.
- Use iframeOuterHTML only for FrameLocator generation.
- Use the PAGE URL above for deriving the class name.

${JSON.stringify(selectors, null, 2)}

═══════════════════════════════════════════
STAGE 2 — GENERATE THE SPEC (TEST) FILE
═══════════════════════════════════════════

Using ONLY the exact method names you just wrote in the POM class above in Stage 1,
generate a complete Playwright test spec file in ${languageLabel} that implements
the test case steps provided below.

SPEC REQUIREMENTS:
- Output ONLY valid ${languageLabel} test code using the Playwright test runner
  (@playwright/test for TS/JS, pytest-playwright style for Python, JUnit/NUnit style
  for Java/C# as appropriate for ${languageLabel}).
- Import and instantiate the POM class from Stage 1 (assume it is exported from a
  relative path like '../pages/<ClassName>').
- Call ONLY the POM methods that are actually needed to satisfy the test steps below.
  Do NOT call every method in the POM — only the relevant ones for this test.
- Do NOT invent any method name. Every method call in the spec MUST exactly match
  a method name that exists in the POM class you wrote in Stage 1, including exact
  casing. If a required action has no matching method in the POM, add a one-line
  comment in the spec explaining which step could not be matched, instead of
  inventing a method or guessing a locator.
- If a test step could match more than one similarly-named POM method (ambiguous
  match), pick the first matching one and add a one-line comment:
  // Note: multiple similar elements found, used first match
- Convert any step phrased as "expect", "verify", "should see", "should be visible",
  "should contain", or similar verification language into a proper Playwright
  assertion (expect(...)) immediately after the relevant action. Use the most
  appropriate assertion type (toBeVisible, toHaveText, toHaveTitle, toHaveValue,
  toBeChecked, toHaveURL, etc.) based on the wording of the step.
- Wrap the test in a single test() block (or framework-equivalent) with a
  descriptive test name derived from the test steps.
- Do not add extra setup/teardown beyond page navigation unless the test steps
  explicitly mention it.

TEST CASE STEPS (provided by user):
${testSteps}

${customPrompt ? `CUSTOM INSTRUCTIONS FROM USER:
${customPrompt}` : ""}

═══════════════════════════════════════════
OUTPUT FORMAT — STRICT
═══════════════════════════════════════════

You MUST wrap each stage's code output with these exact markers, with nothing else
outside the code blocks inside each marker pair. Do not use markdown code fences
(no triple backticks) inside the markers — output raw code only.

===POM_START===
<the complete POM class code from Stage 1 goes here>
===POM_END===

===SPEC_START===
<the complete spec file code from Stage 2 goes here>
===SPEC_END===
`;
}