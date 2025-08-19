import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { load } from "cheerio";
import { createWriteStream, mkdirSync, unlinkSync } from "fs";
import archiver from "archiver";
import { basename, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

// Function to download a file
const downloadFile = async (url, filePath) => {
	try {
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
	} catch (error) {
		console.error(`Error downloading file: ${error.message}`);
	}
};

// Function to create a zip file
const createZip = (files, output) => {
	return new Promise((resolve, reject) => {
		const archive = archiver("zip", {
			zlib: { level: 9 },
		});

		const stream = createWriteStream(output);

		stream.on("close", () => resolve());
		archive.on("error", (err) => reject(err));

		archive.pipe(stream);

		files.forEach((file) => {
			archive.file(file, { name: basename(file) });
		});

		archive.finalize();
	});
};

// Route for the form
app.get("/", (req, res) => {
	res.render("index");
});

// Route to handle form submission
app.post("/scrape", async (req, res) => {
	const url = req.body.url;
	const zipName = req.body.zipName || "pdfs";
	const outputDir = join(__dirname, "temp");
	const zipFilePath = join(outputDir, `${zipName}.zip`);

	try {
		mkdirSync(outputDir, { recursive: true });

		const { data } = await axios.get(url);
		const $ = load(data);

		const fileTypes = req.body.fileTypes || ["pdf"]; // from form input
		const pattern = new RegExp(`\\.(${Array.isArray(fileTypes) ? fileTypes.join("|") : fileTypes})$`, "i");

		const fileLinks = [];
		$("a[href]").each((i, el) => {
			let href = $(el).attr("href");
			if (pattern.test(href)) {
				if (!href.startsWith("http") && !href.startsWith("//")) {
					href = new URL(href, url).href;
				} else if (href.startsWith("//")) {
					href = `https:${href}`;
				}
				fileLinks.push(href);
			}
		});

		const downloadPromises = fileLinks.map((link) => {
			const fileName = decodeURIComponent(basename(new URL(link).pathname));
			const filePath = join(outputDir, fileName);
			return downloadFile(link, filePath).then(() => filePath);
		});

		const files = await Promise.all(downloadPromises);

		await createZip(files, zipFilePath);

		// Clean up individual files after creating zip
		files.forEach((file) => unlinkSync(file));

		res.download(zipFilePath, (err) => {
			if (err) {
				res.status(500).send("Failed to download the zip file.");
			}

			// Delete zip file after download
			unlinkSync(zipFilePath);
		});
	} catch (error) {
		res.status(500).send(`Error: ${error.message}`);
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
