import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { load } from "cheerio";
import { createWriteStream, mkdirSync } from "fs";
import archiver from "archiver";
import { basename, join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Get the __dirname equivalent in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

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

		stream.on("close", () => resolve(archive.pointer()));
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
	const outputDir = req.body.outputDir || "./downloads";

	try {
		const { data } = await axios.get(url);
		const $ = load(data);

		// Ensure the output directory exists
		mkdirSync(outputDir, { recursive: true });

		// Find all PDF links
		const pdfLinks = [];
		$('a[href$=".pdf"]').each((index, element) => {
			let pdfUrl = $(element).attr("href");
			// Handle relative URLs
			if (!pdfUrl.startsWith("http") && !pdfUrl.startsWith("//")) {
				pdfUrl = new URL(pdfUrl, url).href;
			} else if (pdfUrl.startsWith("//")) {
				pdfUrl = `https:${pdfUrl}`;
			}
			pdfLinks.push(pdfUrl);
		});

		// Download each PDF
		const downloadPromises = pdfLinks.map((link) => {
			const fileName = basename(new URL(link).pathname);
			const filePath = join(outputDir, fileName);
			return downloadFile(link, filePath).then(() => filePath);
		});

		const files = await Promise.all(downloadPromises);

		// Create a zip file
		const zipFilePath = join(outputDir, "pdfs.zip");
		await createZip(files, zipFilePath);

		res.send(`PDFs downloaded and zipped successfully in ${resolve(outputDir)}!`);
	} catch (error) {
		res.status(500).send(`Error: ${error.message}`);
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
