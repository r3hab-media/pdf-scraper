# ScrapeStack

**ScrapeStack** is a web tool that helps you download all matching files (PDF or MP4) from a specified webpage into a single ZIP file. Just enter the URL, choose the file type you'd like to scrape, and give your ZIP file a name. ScrapeStack will find all files of that type, bundle them, and prompt you to download them in one convenient archive.

## Features

- **Scrape PDFs or MP4s**: Choose which file type you want to download from a page.
- **Single ZIP Download**: Bundles all matching files into a single downloadable ZIP.
- **Real-Time Progress**: Watch chunked scraping updates live on the page.
- **Smart File Naming**: Files are downloaded using their original names.
- **Custom ZIP Name**: Easily name your download package.

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

2. **Open the tool** in your browser:

   [http://localhost:3000](http://localhost:3000)

3. **Scrape files**:

   - Enter the URL of the page containing the files.
   - Select the file type to scrape (`PDF` or `MP4`).
   - Specify a name for your ZIP file.
   - Click **Scrape** to begin.

4. **Download**: Once processing is complete, the ZIP file will be automatically offered for download.

## Example

Here’s how you can use **ScrapeStack**:

1. Start the server and visit [http://localhost:3000](http://localhost:3000)
2. Enter a target page (e.g. `https://example.com/media`)
3. Select `MP4` or `PDF`
4. Name your ZIP file (e.g. `downloads`)
5. Click **Scrape**
6. ScrapeStack will collect and zip all matching files, and prompt you to download

> If no matching files are found, ScrapeStack will display a message and skip the ZIP creation.

## Troubleshooting

- **No files found?** Double-check your selected file type matches what’s on the page.
- **Empty ZIP file?** ScrapeStack prevents this by skipping ZIP creation if nothing is found.
- **Server errors?** Check your terminal/console for logs.

## Contributing

Pull requests and feature suggestions are welcome!

## License

MIT License. See the [LICENSE](license) file for details.

## Acknowledgements

- [Bootstrap](https://getbootstrap.com) for UI components
- [Font Awesome](https://fontawesome.com) for icons
- [Cheerio](https://cheerio.js.org) and [Axios](https://axios-http.com) for HTML parsing and HTTP requests
- [Archiver](https://www.npmjs.com/package/archiver) for ZIP generation
- [Socket.IO](https://socket.io) for real-time progress display

---

Made with ❤️ & ☕ by [Jared Newnam](https://jarednewnam.com)