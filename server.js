import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ API Key
const API_KEY = ""; // 🔥 API Key

if (!API_KEY) {
  console.error("❌ Missing API_KEY in .env");
  process.exit(1);
}

// ✅ Init GenAI
const ai = new GoogleGenAI({ apiKey: API_KEY });

// ✅ Route
app.post("/generate", async (req, res) => {
  try {
    const { selectors, url = "" } = req.body;

    if (!selectors || selectors.length === 0) {
      return res.status(400).json({
        error: "Selectors are required"
      });
    }

    // 🔥 Prompt (embedded)
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

    // ✅ Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let output = response.text?.trim() || "";

    // 🧹 Clean markdown if present
    output = output
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```$/, "")
      .trim();

    return res.json({ output });

  } catch (error) {
    console.error("❌ Error:", error);

    return res.status(500).json({
      error: "Failed to generate code"
    });
  }
});

// ✅ Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("✅ AI Code Assist Backend Running");
});

// ✅ Start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});