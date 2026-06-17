export const SAMPLE_POM_TYPESCRIPT = `
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

  async fillUsernameInput(username: string) {
    const usernameInputLocators = [
      this.page.getByLabel('Username'),
      this.page.getByPlaceholder('Enter username'),
      this.page.locator('#username')
    ];

    const usernameInput = await tryLocators(
      usernameInputLocators,
      'Unable to find the Username input locator'
    );

    await usernameInput.fill(username);
    console.log(\`Filled Username input with: \${username}\`);
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

  async clickSubmitButton() {
    const submitButtonLocators = [
      this.page.getByRole('button', { name: 'Submit' }),
      this.page.locator('#submit')
    ];

    const submitButton = await tryLocators(
      submitButtonLocators,
      'Unable to find the Submit button locator'
    );

    await submitButton.click();
    console.log('Clicked Submit button');
  }
}
`;

export const SAMPLE_POM_JAVA = `
import com.microsoft.playwright.*;

public class SamplePage {

    private Page page;
    private FrameLocator paymentFrame;

    public SamplePage(Page page) {
        this.page = page;
        this.paymentFrame = page.frameLocator("#payment-frame");
    }

    public void checkSportsCheckbox() {
        Locator sportsCheckbox = page.getByLabel("Sports")
            .or(page.locator("#sports"));

        sportsCheckbox.check();
        System.out.println("Checked Sports checkbox");
    }

    public void checkMaleRadioButton() {
        Locator maleRadioButton = page.getByLabel("Male")
            .or(page.locator("#gender-radio-1"));

        maleRadioButton.check();
        System.out.println("Checked Male radio button");
    }

    public void fillUsernameInput(String username) {
        Locator usernameInput = page.getByLabel("Username")
            .or(page.getByPlaceholder("Enter username"))
            .or(page.locator("#username"));

        usernameInput.fill(username);
        System.out.println("Filled Username input with: " + username);
    }

    public void selectCardTypeDropdown(String cardType) {
        Locator cardTypeDropdown = paymentFrame.getByRole(AriaRole.COMBOBOX)
            .or(paymentFrame.locator("#cardType"));

        cardTypeDropdown.selectOption(cardType);
        System.out.println("Selected Card Type: " + cardType);
    }

    public void clickSubmitButton() {
        Locator submitButton = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"))
            .or(page.locator("#submit"));

        submitButton.click();
        System.out.println("Clicked Submit button");
    }
}
`;

export const SAMPLE_POM_PYTHON = `
from playwright.sync_api import Page, FrameLocator

class SamplePage:

    def __init__(self, page: Page):
        self.page = page
        self.payment_frame: FrameLocator = page.frame_locator("#payment-frame")

    def check_sports_checkbox(self):
        sports_checkbox = self.page.get_by_label("Sports")
        if not sports_checkbox.is_visible():
            sports_checkbox = self.page.locator("#sports")

        sports_checkbox.check()
        print("Checked Sports checkbox")

    def check_male_radio_button(self):
        male_radio_button = self.page.get_by_label("Male")
        if not male_radio_button.is_visible():
            male_radio_button = self.page.locator("#gender-radio-1")

        male_radio_button.check()
        print("Checked Male radio button")

    def fill_username_input(self, username: str):
        username_input = self.page.get_by_label("Username")
        if not username_input.is_visible():
            username_input = self.page.get_by_placeholder("Enter username")
        if not username_input.is_visible():
            username_input = self.page.locator("#username")

        username_input.fill(username)
        print(f"Filled Username input with: {username}")

    def select_card_type_dropdown(self, card_type: str):
        card_type_dropdown = self.payment_frame.get_by_role("combobox")
        if not card_type_dropdown.is_visible():
            card_type_dropdown = self.payment_frame.locator("#cardType")

        card_type_dropdown.select_option(card_type)
        print(f"Selected Card Type: {card_type}")

    def click_submit_button(self):
        submit_button = self.page.get_by_role("button", name="Submit")
        if not submit_button.is_visible():
            submit_button = self.page.locator("#submit")

        submit_button.click()
        print("Clicked Submit button")
`;

export const SAMPLE_POM_CSHARP = `
using Microsoft.Playwright;

public class SamplePage
{
    private readonly IPage _page;
    private readonly IFrameLocator _paymentFrame;

    public SamplePage(IPage page)
    {
        _page = page;
        _paymentFrame = page.FrameLocator("#payment-frame");
    }

    public async Task CheckSportsCheckboxAsync()
    {
        ILocator sportsCheckbox = _page.GetByLabel("Sports")
            .Or(_page.Locator("#sports"));

        await sportsCheckbox.CheckAsync();
        Console.WriteLine("Checked Sports checkbox");
    }

    public async Task CheckMaleRadioButtonAsync()
    {
        ILocator maleRadioButton = _page.GetByLabel("Male")
            .Or(_page.Locator("#gender-radio-1"));

        await maleRadioButton.CheckAsync();
        Console.WriteLine("Checked Male radio button");
    }

    public async Task FillUsernameInputAsync(string username)
    {
        ILocator usernameInput = _page.GetByLabel("Username")
            .Or(_page.GetByPlaceholder("Enter username"))
            .Or(_page.Locator("#username"));

        await usernameInput.FillAsync(username);
        Console.WriteLine($"Filled Username input with: {username}");
    }

    public async Task SelectCardTypeDropdownAsync(string cardType)
    {
        ILocator cardTypeDropdown = _paymentFrame.GetByRole(AriaRole.Combobox)
            .Or(_paymentFrame.Locator("#cardType"));

        await cardTypeDropdown.SelectOptionAsync(cardType);
        Console.WriteLine($"Selected Card Type: {cardType}");
    }

    public async Task ClickSubmitButtonAsync()
    {
        ILocator submitButton = _page.GetByRole(AriaRole.Button, new() { Name = "Submit" })
            .Or(_page.Locator("#submit"));

        await submitButton.ClickAsync();
        Console.WriteLine("Clicked Submit button");
    }
}
`;