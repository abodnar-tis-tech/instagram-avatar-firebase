import * as functions from "firebase-functions";
import {
  launchBrowser,
  scanForLinks,
  getInstagramAvatar,
} from "./puppeteerUtils";

export const fetchInstagramData = functions.https.onRequest(
  async (req, res) => {
    const { name, address } = req.query;

    if (!name || !address) {
      res
        .status(400)
        .json({ error: 'Both "name" and "address" are required.' });
      return;
    }

    const query = `instagram "${name}" "${address}"`;

    try {
      const { browser, page } = await launchBrowser();
      const url = `https://www.google.com/search?q=${query}`;

      await page.goto(url, { waitUntil: "networkidle2" });
      const links = await scanForLinks(page);

      await browser.close();

      if (!links || links.length === 0) {
        res.status(404).json({ error: "No Instagram link found." });
        return;
      }

      const avatarUrl = await getInstagramAvatar(links[0]);

      res.status(200).json({ link: links[0], avatar: avatarUrl });
    } catch (error) {
      console.error("Error during Puppeteer operation:", error);
      res.status(500).json({
        error: "Failed to fetch Instagram link or avatar.",
        details: error,
      });
    }
  }
);
