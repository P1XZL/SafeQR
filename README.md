# SafeQR

SafeQR is a Firefox extension that **cleans URLs like CleanShare** and generates **stylish QR codes** in a minimal Material 3 UI. It removes trackers from links, shortens them for popular sites, and allows easy sharing via QR codes.

The majority of the coding was done with the help of ChatGPT and the source code from other GitHub repositories. The creator of SafeQR contributed the design work and conceptual ideas.

This extension combines features and inspiration from two open-source projects:

* [CleanShare](https://github.com/tahir-ozcan/cleanshare) — for URL cleaning and tracker removal.
* [Offline QR Code](https://github.com/rugk/offline-qr-code) — for offline QR code generation.

---

## Features

* Clean URLs automatically, removing tracking and privacy-sensitive parameters.
* Shorten links for popular sites: Amazon, YouTube, Twitter, TikTok, Facebook, LinkedIn, Reddit.
* Generate stylish QR codes using [QR Code Styling](https://github.com/kozakdenys/qr-code-styling) with rounded dots and pastel Material 3 colors.
* Copy cleaned URL to clipboard.
* Download QR code as PNG.
* Minimalist popup with animated edit field for changing URLs.

---

## Folder Structure

```
SafeQR/
├─ manifest.json
├─ popup.html
├─ popup.js
├─ popup.css
├─ background.js
├─ qr-code-styling.js
└─ icons/
    ├─ icon-16.png
    ├─ icon-32.png
    ├─ icon-48.png
    └─ icon-128.png
```

---

## Build from Source

### Prerequisites

* Modern Firefox browser for testing.
* Node.js and npm (optional, only if using npm for dependency management).

### Manual Build (Recommended)

1. Download or clone the SafeQR source code.
2. Ensure `qr-code-styling.js` and all icons exist in the proper folders.
3. Test locally:

   * Open Firefox → `about:debugging#/runtime/this-firefox`.
   * Click **“Load Temporary Add-on”** and select `manifest.json`.
   * The SafeQR icon should appear in the toolbar.
4. Zip the **contents of the folder** (manifest at root) to distribute or submit to AMO.

### Optional: Using npm

1. Initialize npm and install dependencies:

```bash
npm init -y
npm install qr-code-styling
```

2. Replace the local `qr-code-styling.js` with `node_modules/qr-code-styling/lib/qr-code-styling.js`.
3. Use a bundler (Webpack, Parcel, etc.) to create a `dist/` folder.
4. Zip the `dist/` folder for submission.

---

## Testing & Debugging

* Use **temporary add-on loading** in Firefox for rapid testing.
* Open **Browser Console** (`Ctrl+Shift+J`) to check for errors.
* Edit HTML, CSS, or JS and reload the add-on in `about:debugging`.
* Verify that URLs are cleaned, QR codes render correctly, and copy/download buttons work.

---

## Credits

SafeQR was inspired by and builds upon the work of:

* **[CleanShare](https://github.com/tahir-ozcan/cleanshare)** — for the URL cleaning logic.
* **[Offline QR Code](https://github.com/rugk/offline-qr-code)** — for offline QR code generation techniques.
* **[QR Code Styling](https://github.com/kozakdenys/qr-code-styling)** — for creating stylish, customizable QR codes.
* The majority of the coding was done by **ChatGPT** and from the above open-source repositories, while the SafeQR creator provided design input and conceptual ideas.

