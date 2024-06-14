# ScrapeStack

**ScrapeStack** is a web tool that helps you download all PDF files from a specified webpage into a single ZIP file. Just enter the URL of the webpage containing the PDFs and specify a name for the ZIP file. The tool will then gather all the PDFs from the page, bundle them into the ZIP file, and prompt you to download it, making it easier to save multiple PDFs at once.

## Features

- **Extract PDFs**: Automatically finds and collects all PDF links from a given webpage.
- **Single ZIP Download**: Bundles all PDFs into a single ZIP file for easy download.
- **Custom ZIP Name**: Allows you to specify a name for the ZIP file.

## Requirements

- Node.js
- npm (Node Package Manager)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/r3hab-media/pdf-scraper.git
   cd pdf-scraper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Access the web tool**: Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

3. **Use the tool**:

   - Enter the URL of the webpage containing PDFs.
   - Specify a name for the ZIP file.
   - Click "Scrape" to start the process.

4. **Download the ZIP file**: Once the process is complete, a ZIP file containing all the PDFs will be automatically downloaded to your default download location.

## Example

Here’s how you can use **ScrapeStack**:

1. Go to [http://localhost:3000](http://localhost:3000) after starting the server.
2. Enter a URL, for example: `https://example.com/reports`
3. Enter a name for the ZIP file, such as `reports_archive`
4. Click "Scrape".
5. Wait for the tool to process and download your ZIP file.

## Troubleshooting

- **Ensure the URL is correct**: Make sure you enter a valid URL pointing to a webpage containing PDF links.
- **Check server logs**: If the tool isn't working as expected, check the terminal for any error messages or logs.

## Contributing

Feel free to contribute to the project by opening a pull request or submitting issues.

## License

This project is licensed under the MIT License. See the [LICENSE](license) file for details.

## Acknowledgements

- **Bootstrap**: For the responsive layout and styles.
- **Font Awesome**: For the awesome icons used in the footer.

---

Made with ❤️ & ☕ by [Jared Newnam](https://jarednewnam.com)
