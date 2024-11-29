import puppeteer, { Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const launchBrowser = async () => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  return { browser, page };
};

export const scanForLinks = async (page: Page): Promise<string[]> => {
  return page.evaluate(() => {
    const anchors = document.querySelectorAll("a:has(br)");
    return Array.from(anchors)
      .map((anchor) => anchor.getAttribute("href") || "")
      .filter(Boolean);
  });
};

export const getInstagramAvatar = async (
  profileUrl: string
): Promise<string | null> => {
  const { browser, page } = await launchBrowser();

  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
    );

    await page.goto(profileUrl, { waitUntil: "networkidle2" });

    const avatarUrl = await page.evaluate(() => {
      const img = document.querySelector(
        "header img"
      ) as HTMLImageElement | null;
      return img?.src! || null;
    });

    await browser.close();
    return avatarUrl;
  } catch (error) {
    console.error("Error fetching avatar:", error);
    await browser.close();
    throw new Error("Failed to fetch avatar.");
  }
};
