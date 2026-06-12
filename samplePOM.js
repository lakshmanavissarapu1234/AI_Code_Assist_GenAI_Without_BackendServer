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

async fillFirstNameInput(value: string) {
 
const firstNameInputLocators = [
  this.page.getByPlaceholder('First Name'),
  this.page.locator('#firstName')
];

const firstNameInput = await tryLocators(
  firstNameInputLocators,
  'Unable to find the First Name input locator'
);

await firstNameInput.fill(value);

console.log(\`Filled First Name input with: \${value}\`);
}

async clickPayNowButton() {

const payNowButtonLocators = [
  this.paymentFrame.getByRole('button', { name: 'Pay Now' }),
  this.paymentFrame.locator('#payNow')
];

const payNowButton = await tryLocators(
  payNowButtonLocators,
  'Unable to find the Pay Now button locator'
);

await payNowButton.click();

console.log('Clicked Pay Now button');
}
}
`;