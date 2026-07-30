// ─── PLAYWRIGHT PROMPT ────────────────────────────────────────────

export function getPlaywrightPrompt(selectors, pageUrl, languageLabel, selectedSample, existingPOMContext = "") {
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
${existingPOMContext ? `
${existingPOMContext}

IMPORTANT:
- Reuse the existing methods above whenever they match the selected elements.
- Do not regenerate the whole POM unless a new action is required.
- If a relevant method already exists, keep it and add only new methods for genuinely new actions.
` : ""}

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

BUSINESS METHOD GENERATION:
- After generating or reusing Element Methods, analyze the test case steps.
- If one or more existing/new Element Methods together satisfy a business action in the test case, generate a reusable Logic Method in the POM.
- The Logic Method must call the Element Methods instead of using locators directly.
- Reuse an existing Logic Method if it already represents the same workflow.
- Do not generate duplicate Logic Methods.

Example:
Existing Element Methods:
fillUsernameInput()
fillPasswordInput()
clickLoginButton()

Test Step:
Login with valid credentials

Generate:
async login(userName, password) {
    await this.fillUsernameInput(userName);
    await this.fillPasswordInput(password);
    await this.clickLoginButton();
    console.log("Logged in successfully");
}

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

export function getSeleniumPrompt(selectors, pageUrl, languageLabel, selectedSample, existingPOMContext = "") {
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
${existingPOMContext ? `
${existingPOMContext}

IMPORTANT:
- Reuse the existing methods above whenever they match the selected elements.
- Do not regenerate the whole POM unless a new action is required.
- If a relevant method already exists, keep it and add only new methods for genuinely new actions.
` : ""}

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
Each selected element contains iframeOuterHTML, elementOuterHTML, and elementSnapshot.
- Use elementOuterHTML and elementSnapshot as primary sources of truth.
- elementSnapshot contains filtered, valid attributes and visible text, and excludes scripts/styles.
- iframeOuterHTML is not used for Selenium (no FrameLocator in Selenium).
- Use the PAGE URL above for deriving the class name.

${JSON.stringify(selectors, null, 2)}
`;
}

// ─── COMBINED POM + SPEC + TEST DATA PROMPT (Playwright only, for now) ───────

export function getCombinedPrompt(selectors, pageUrl, languageLabel, selectedSample, testSteps, customPrompt = "", existingPOMContext = "") {
  return `
You are a senior Playwright automation framework architect.

You must complete this task in THREE ORDERED STAGES, all inside this single response.
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
- POM generation must be based only on the captured DOM and selected elements.
- Do not use the test case steps to invent or rename methods.

BUSINESS METHOD RULE:
- Test case steps must NOT be used to invent new Element Methods or locators.
- Before generating a new Logic Method, check whether an existing Logic Method already satisfies the business action. Reuse it if available.
- Otherwise, if two or more existing or newly generated Element Methods together satisfy a single business action in the test case, generate a reusable Logic Method in the POM.
- Logic Methods must reuse existing Element Methods and must never contain locators directly.
- The generated Spec must use the Logic Method instead of calling multiple Element Methods directly.
- Logic Method names should be derived from the business action described in the test case (e.g. login(), registerUser(), searchProduct(), checkout()) rather than from UI element names.

${existingPOMContext ? `
${existingPOMContext}

IMPORTANT:
- Reuse the existing methods above whenever they match the selected elements.
- Do not regenerate the whole POM unless a new action is required.
- If a relevant method already exists, keep it and add only new methods for genuinely new actions.
` : ""}

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
Each selected element contains iframeOuterHTML, elementOuterHTML, and elementSnapshot.
- Use elementOuterHTML and elementSnapshot as primary sources of truth.
- elementSnapshot contains filtered, valid attributes and visible text, and excludes scripts/styles.
- Use iframeOuterHTML only for FrameLocator generation.
- Use the PAGE URL above for deriving the class name.

${JSON.stringify(selectors, null, 2)}

═══════════════════════════════════════════
STAGE 2 — GENERATE THE SPEC (TEST) FILE
═══════════════════════════════════════════

Using ONLY the exact method names you wrote in Stage 1, generate a complete Playwright
test spec file in ${languageLabel} that implements the test case steps provided below.

SPEC REQUIREMENTS:
- Output ONLY valid ${languageLabel} test code using the Playwright test runner.
- Import and instantiate the POM class from Stage 1 (assume it is exported from a
  relative path like '../pages/<ClassName>').
- Spec generation must be based only on the test case steps.
- Do not inspect the DOM or infer additional steps from the page structure.
- Call ONLY the POM methods that are actually needed to satisfy the test steps below.
- If a Logic Method exists for a business action, always use the Logic Method in the Spec instead of calling multiple Element Methods.
- If the required Element Methods already exist in the generated or reused POM and together represent a business action, generate a reusable Logic Method in the POM and use that Logic Method in the Spec.
- Do NOT call every method in the POM — only the relevant ones for this test.
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
- Do NOT declare or define the abc data object in the spec itself.
  The spec should reference data using abc.fieldName only, for example:
  await page.fillNameInput(abc.userName);
  await page.fillEmailInput(abc.email);
  await page.fillPhoneInput(abc.phone);
- The spec must not influence the POM or the JSON output.

METHOD CONSISTENCY:
- Every method used in the Spec must exist in the generated or reused POM.
- Never invent method names that do not exist in the POM.
- The Spec must always use Logic Methods when available.
- Element Methods should only be used directly when no suitable Logic Method exists.

═══════════════════════════════════════════
STAGE 3 — GENERATE THE TEST DATA (JSON) FILE
═══════════════════════════════════════════

Generate a standalone JSON object containing test data values that appear explicitly
in the test case steps below.

JSON REQUIREMENTS:
- Output ONLY valid JSON.
- JSON generation must be based only on values explicitly present in the test case steps.
- Do not derive values from the DOM or from the POM methods.
- Do not include selectors, locators, or method names.
- Use descriptive keys such as userName, email, phone, firstName, lastName, date, or country.
- If a value is not explicitly present in the test steps, omit it from the JSON object.
- The JSON output must not influence the POM or the spec.

TEST CASE STEPS:
${testSteps || "No explicit test steps provided."}

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

===JSON_START===
<the complete JSON metadata for the test case goes here>
===JSON_END===
`;
}
