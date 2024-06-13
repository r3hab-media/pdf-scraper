import axios from "axios";
import { load } from "cheerio";
import { createWriteStream } from "fs";
import archiver from "archiver";
import { basename, join, dirname } from "path";
import { fileURLToPath } from "url";

// URL of the page to scrape
const url = "https://www.scottsdaleaz.gov/court/forms"; // Replace with the actual URL

// Get the __dirname equivalent in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

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

// Main function to scrape the page and download PDFs
const scrapeAndDownloadPDFs = async () => {
	try {
		const { data } = await axios.get(url);
		const $ = load(data);

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
		const downloadPromises = pdfLinks.map((link, index) => {
			const filePath = join(__dirname, `file${index + 1}.pdf`);
			return downloadFile(link, filePath).then(() => filePath);
		});

		const files = await Promise.all(downloadPromises);

		// Create a zip file
		const zipFilePath = join(__dirname, "pdfs.zip");
		await createZip(files, zipFilePath);

		console.log("PDFs downloaded and zipped successfully!");
	} catch (error) {
		console.error("Error:", error.message);
	}
};

scrapeAndDownloadPDFs();

//by Jared Newnam
