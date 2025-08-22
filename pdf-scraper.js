import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { load } from "cheerio";
import { createWriteStream, mkdirSync, unlinkSync, existsSync } from "fs";
import archiver from "archiver";
import { basename, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

/* ------------------ Express setup ------------------ */

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
// No public/ dir since you're not using one

/* ------------------ Helpers ------------------ */

const downloadFile = async (url, filePath) => {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });
  const writer = createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const createZip = (files, output) =>
  new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const stream = createWriteStream(output);
    stream.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(stream);
    files.forEach((file) => archive.file(file, { name: basename(file) }));
    archive.finalize();
  });

/* ------------------ Routes ------------------ */

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/scrape", async (req, res) => {
  const url = req.body.url;
  const zipName = req.body.zipName || "downloads";
  const fileType = req.body.fileType || "pdf";
  const outputDir = join(__dirname, "temp");
  const zipFilePath = join(outputDir, `${zipName}.zip`);

  try {
    mkdirSync(outputDir, { recursive: true });

    const { data } = await axios.get(url);
    const $ = load(data);

    const pattern = new RegExp(`\\.${fileType}$`, "i");
    const fileLinks = [];

    $("a[href]").each((i, el) => {
      let href = $(el).attr("href");
      if (!href) return;
      if (pattern.test(href)) {
        if (!href.startsWith("http") && !href.startsWith("//")) {
          href = new URL(href, url).href;
        } else if (href.startsWith("//")) {
          href = `https:${href}`;
        }
        fileLinks.push(href);
      }
    });

    if (fileLinks.length === 0) {
      return res
        .status(200)
        .send(`
        <html>
          <head><title>No Files Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>No matching <code>.${fileType}</code> files were found on the page.</h2>
            <p><a href="/" style="text-decoration: none; color: #007bff;">&larr; Go back and try again</a></p>
          </body>
        </html>
      `);
    }

    const downloadPromises = fileLinks.map((link) => {
      const fileName = decodeURIComponent(basename(new URL(link).pathname));
      const filePath = join(outputDir, fileName);
      return downloadFile(link, filePath).then(() => filePath);
    });

    const files = await Promise.all(downloadPromises);

    await createZip(files, zipFilePath);

    // Clean up individual files after zipping
    files.forEach((f) => {
      if (existsSync(f)) unlinkSync(f);
    });

    res.download(zipFilePath, (err) => {
      if (existsSync(zipFilePath)) unlinkSync(zipFilePath);
      if (err) res.status(500).send("Failed to download the zip file.");
    });
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

/* ------------------ Start server ------------------ */

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

