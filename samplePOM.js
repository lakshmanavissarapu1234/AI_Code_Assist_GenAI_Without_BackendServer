export const SAMPLE_POM = `
import { Page, FrameLocator } from '@playwright/test';
import { tryLocators } from './utils/commonMethods';

export class SamplePage {

private page: Page;
private paymentFrame: FrameLocator;

constructor(page: Page) {
this.page = page;
this.paymentFrame = page.frameLocator('#payment-frame');
}

async checkSportsCheckbox() {

const sportsCheckboxLocators = [
  this.page.getByLabel('Sports'),
  this.page.locator('#sports')
];

const sportsCheckbox = await tryLocators(
  sportsCheckboxLocators,
  'Unable to find the Sports checkbox locator'
);

await sportsCheckbox.check();

console.log('Checked Sports checkbox');
}

async checkMaleRadioButton() {

const maleRadioButtonLocators = [
  this.page.getByLabel('Male'),
  this.page.locator('#gender-radio-1')
];

const maleRadioButton = await tryLocators(
  maleRadioButtonLocators,
  'Unable to find the Male radio button locator'
);

await maleRadioButton.check();

console.log('Checked Male radio button');
}

async selectCardTypeDropdown(cardType: string) {

const cardTypeDropdownLocators = [
  this.paymentFrame.getByRole('combobox'),
  this.paymentFrame.locator('#cardType')
];

const cardTypeDropdown = await tryLocators(
  cardTypeDropdownLocators,
  'Unable to find the Card Type dropdown locator'
);

await cardTypeDropdown.selectOption(cardType);

console.log(\`Selected Card Type: \${cardType}\`);
}
}
`;