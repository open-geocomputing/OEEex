# Open Earth Engine Extension (OEEex)

The Open Earth Engine Extension (OEEex) is an unofficial browser extension designed to enhance the Google Earth Engine (GEE) Code Editor with additional features and improved usability.

## Installation

OEEex is available for both Google Chrome and Mozilla Firefox browsers.

- **Google Chrome**: Install the extension from the [Chrome Web Store](https://chrome.google.com/webstore/detail/open-earth-engine-extensio/dhkobehdekjgdahfldleahkekjffibhg). After installation, refresh any open GEE Code Editor pages to activate the extension.
- **Mozilla Firefox**: Install the extension from the [Firefox Add-ons Store](https://addons.mozilla.org/en-US/firefox/addon/oeeex/). Refresh any open GEE Code Editor pages to activate the extension.

## Features

OEEex offers a variety of features to enhance your GEE experience:

- **Run All!**: A single button that starts all tasks present in the task manager. To use it, run a set of tasks, and the button will appear. Simply press it, and the tasks will start running.
- **Night Mode**: Introduces a dark theme to the GEE Code Editor. Select your preferred mode by clicking the logo in the upper right corner. For automatic mode based on your browser or system settings, double-click the logo or select the mode in the [options page](chrome-extension://dhkobehdekjgdahfldleahkekjffibhg/options.html). All Earth Engine tabs open in the same browser are linked; changing the mode in one tab will change it in the others.
- **Code Editor Shortcuts**: Allows customization of keyboard shortcuts within the code editor. Mac users have a pre-configured selection (e.g., ⌘+S, ⌘+Enter). Modify these in the extension's [options page](chrome-extension://dhkobehdekjgdahfldleahkekjffibhg/options.html).
- **OEEL Caching**: Provides a 1-hour cache for files from the [Open Earth Engine Library](https://www.open-geocomputing.org/OpenEarthEngineLibrary/), reducing execution time when using the library. This feature is enabled by default and cannot be disabled.
- **Manifest Upload**: Allows drag-and-drop ingestion of GeoTIFFs with their manifest files directly into GEE. Create a manifest following the guidelines [here](https://developers.google.com/earth-engine/guides/asset_manifest), using local relative Unix-style file paths instead of `gs://` addresses. Store the `manifest.json` file in a folder with your GeoTIFFs (or zipped tables), then drag and drop this folder onto the upload icon in the asset tab to initiate the upload.

For detailed information on each feature, please refer to the [feature documentation](https://www.open-geocomputing.org/OEEex/).

## Recent Changes

- **Removal of Planet Imagery Transfer**: The feature related to Planet imagery transfer has been removed.
- **Removal of Asset Availability**: The asset availability check feature has been discontinued.
- **Discontinuation of Automatic Export**: The automatic export feature has been replaced with the "Run All!" functionality.

## Contributing

Contributions are welcome!

## License

This project is licensed under the LGPLv3 License.