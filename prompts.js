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