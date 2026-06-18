// ─── PLAYWRIGHT SAMPLES ───────────────────────────────────────────

export const SAMPLE_POM_PLAYWRIGHT_TYPESCRIPT = `
import { Page, FrameLocator } from '@playwright/test';
import { tryLocators } from './utils/commonMethods';

export class SamplePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillUsernameInput(username: string) {
    const usernameInputLocators = [
      this.page.getByLabel('Username'),
      this.page.getByPlaceholder('Enter username'),
      this.page.locator('#username')
    ];
    const usernameInput = await tryLocators(usernameInputLocators, 'Unable to find Username input');
    await usernameInput.fill(username);
    console.log(\`Filled Username input with: \${username}\`);
  }

  async checkSportsCheckbox() {
    const sportsCheckboxLocators = [
      this.page.getByLabel('Sports'),
      this.page.locator('#sports')
    ];
    const sportsCheckbox = await tryLocators(sportsCheckboxLocators, 'Unable to find Sports checkbox');
    await sportsCheckbox.check();
    console.log('Checked Sports checkbox');
  }

  async clickSubmitButton() {
    const submitButtonLocators = [
      this.page.getByRole('button', { name: 'Submit' }),
      this.page.locator('#submit')
    ];
    const submitButton = await tryLocators(submitButtonLocators, 'Unable to find Submit button');
    await submitButton.click();
    console.log('Clicked Submit button');
  }
}
`;

export const SAMPLE_POM_PLAYWRIGHT_JAVASCRIPT = `
const { tryLocators } = require('./utils/commonMethods');

class SamplePage {
  constructor(page) {
    this.page = page;
  }

  async fillUsernameInput(username) {
    const usernameInputLocators = [
      this.page.getByLabel('Username'),
      this.page.getByPlaceholder('Enter username'),
      this.page.locator('#username')
    ];
    const usernameInput = await tryLocators(usernameInputLocators, 'Unable to find Username input');
    await usernameInput.fill(username);
    console.log(\`Filled Username input with: \${username}\`);
  }

  async checkSportsCheckbox() {
    const sportsCheckboxLocators = [
      this.page.getByLabel('Sports'),
      this.page.locator('#sports')
    ];
    const sportsCheckbox = await tryLocators(sportsCheckboxLocators, 'Unable to find Sports checkbox');
    await sportsCheckbox.check();
    console.log('Checked Sports checkbox');
  }

  async clickSubmitButton() {
    const submitButtonLocators = [
      this.page.getByRole('button', { name: 'Submit' }),
      this.page.locator('#submit')
    ];
    const submitButton = await tryLocators(submitButtonLocators, 'Unable to find Submit button');
    await submitButton.click();
    console.log('Clicked Submit button');
  }
}

module.exports = { SamplePage };
`;

export const SAMPLE_POM_PLAYWRIGHT_JAVA = `
import com.microsoft.playwright.*;

public class SamplePage {
  private Page page;

  public SamplePage(Page page) {
    this.page = page;
  }

  public void fillUsernameInput(String username) {
    Locator usernameInput = page.getByLabel("Username")
        .or(page.getByPlaceholder("Enter username"))
        .or(page.locator("#username"));
    usernameInput.fill(username);
    System.out.println("Filled Username input with: " + username);
  }

  public void checkSportsCheckbox() {
    Locator sportsCheckbox = page.getByLabel("Sports")
        .or(page.locator("#sports"));
    sportsCheckbox.check();
    System.out.println("Checked Sports checkbox");
  }

  public void clickSubmitButton() {
    Locator submitButton = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"))
        .or(page.locator("#submit"));
    submitButton.click();
    System.out.println("Clicked Submit button");
  }
}
`;

export const SAMPLE_POM_PLAYWRIGHT_PYTHON = `
from playwright.sync_api import Page

class SamplePage:
  def __init__(self, page: Page):
    self.page = page

  def fill_username_input(self, username: str):
    username_input = self.page.get_by_label("Username")
    if not username_input.is_visible():
      username_input = self.page.get_by_placeholder("Enter username")
    if not username_input.is_visible():
      username_input = self.page.locator("#username")
    username_input.fill(username)
    print(f"Filled Username input with: {username}")

  def check_sports_checkbox(self):
    sports_checkbox = self.page.get_by_label("Sports")
    if not sports_checkbox.is_visible():
      sports_checkbox = self.page.locator("#sports")
    sports_checkbox.check()
    print("Checked Sports checkbox")

  def click_submit_button(self):
    submit_button = self.page.get_by_role("button", name="Submit")
    if not submit_button.is_visible():
      submit_button = self.page.locator("#submit")
    submit_button.click()
    print("Clicked Submit button")
`;

export const SAMPLE_POM_PLAYWRIGHT_CSHARP = `
using Microsoft.Playwright;

public class SamplePage {
  private readonly IPage _page;

  public SamplePage(IPage page) {
    _page = page;
  }

  public async Task FillUsernameInputAsync(string username) {
    ILocator usernameInput = _page.GetByLabel("Username")
        .Or(_page.GetByPlaceholder("Enter username"))
        .Or(_page.Locator("#username"));
    await usernameInput.FillAsync(username);
    Console.WriteLine($"Filled Username input with: {username}");
  }

  public async Task CheckSportsCheckboxAsync() {
    ILocator sportsCheckbox = _page.GetByLabel("Sports")
        .Or(_page.Locator("#sports"));
    await sportsCheckbox.CheckAsync();
    Console.WriteLine("Checked Sports checkbox");
  }

  public async Task ClickSubmitButtonAsync() {
    ILocator submitButton = _page.GetByRole(AriaRole.Button, new() { Name = "Submit" })
        .Or(_page.Locator("#submit"));
    await submitButton.ClickAsync();
    Console.WriteLine("Clicked Submit button");
  }
}
`;

// ─── SELENIUM SAMPLES ─────────────────────────────────────────────

export const SAMPLE_POM_SELENIUM_JAVA = `
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.Select;

public class SamplePage {
  WebDriver driver;

  @FindBy(id = "username")
  WebElement usernameInput;

  @FindBy(id = "sports")
  WebElement sportsCheckbox;

  @FindBy(id = "submit")
  WebElement submitButton;

  public SamplePage(WebDriver driver) {
    this.driver = driver;
    PageFactory.initElements(driver, this);
  }

  public void fillUsernameInput(String username) {
    usernameInput.clear();
    usernameInput.sendKeys(username);
    System.out.println("Filled Username input with: " + username);
  }

  public void checkSportsCheckbox() {
    if (!sportsCheckbox.isSelected()) {
      sportsCheckbox.click();
    }
    System.out.println("Checked Sports checkbox");
  }

  public void clickSubmitButton() {
    submitButton.click();
    System.out.println("Clicked Submit button");
  }
}
`;

export const SAMPLE_POM_SELENIUM_PYTHON = `
from selenium.webdriver.common.by import By

class SamplePage:
  def __init__(self, driver):
    self.driver = driver

  def fill_username_input(self, username: str):
    username_input = self.driver.find_element(By.ID, "username")
    username_input.clear()
    username_input.send_keys(username)
    print(f"Filled Username input with: {username}")

  def check_sports_checkbox(self):
    sports_checkbox = self.driver.find_element(By.ID, "sports")
    if not sports_checkbox.is_selected():
      sports_checkbox.click()
    print("Checked Sports checkbox")

  def click_submit_button(self):
    submit_button = self.driver.find_element(By.ID, "submit")
    submit_button.click()
    print("Clicked Submit button")
`;

export const SAMPLE_POM_SELENIUM_JAVASCRIPT = `
class SamplePage {
  constructor(driver) {
    this.driver = driver;
  }

  async fillUsernameInput(username) {
    const usernameInput = await this.driver.findElement({ id: 'username' });
    await usernameInput.clear();
    await usernameInput.sendKeys(username);
    console.log(\`Filled Username input with: \${username}\`);
  }

  async checkSportsCheckbox() {
    const sportsCheckbox = await this.driver.findElement({ id: 'sports' });
    const isSelected = await sportsCheckbox.isSelected();
    if (!isSelected) {
      await sportsCheckbox.click();
    }
    console.log('Checked Sports checkbox');
  }

  async clickSubmitButton() {
    const submitButton = await this.driver.findElement({ id: 'submit' });
    await submitButton.click();
    console.log('Clicked Submit button');
  }
}

module.exports = { SamplePage };
`;

export const SAMPLE_POM_SELENIUM_CSHARP = `
using OpenQA.Selenium;

public class SamplePage {
  private readonly IWebDriver _driver;

  public SamplePage(IWebDriver driver) {
    _driver = driver;
  }

  public void FillUsernameInput(string username) {
    IWebElement usernameInput = _driver.FindElement(By.Id("username"));
    usernameInput.Clear();
    usernameInput.SendKeys(username);
    Console.WriteLine($"Filled Username input with: {username}");
  }

  public void CheckSportsCheckbox() {
    IWebElement sportsCheckbox = _driver.FindElement(By.Id("sports"));
    if (!sportsCheckbox.Selected) {
      sportsCheckbox.Click();
    }
    Console.WriteLine("Checked Sports checkbox");
  }

  public void ClickSubmitButton() {
    IWebElement submitButton = _driver.FindElement(By.Id("submit"));
    submitButton.Click();
    Console.WriteLine("Clicked Submit button");
  }
}
`;