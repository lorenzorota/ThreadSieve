// Default settings
const defaultSettings = {
  isExtensionEnabled: true,
  enableServer: false,
  enableRegex: true,
  regexCondition: "^[^A-Z]*$"
};

  
  // Initialize options with default settings when the extension is installed
  chrome.runtime.onInstalled.addListener(() => {
    // Get settings from chrome.storage or use defaults
    chrome.storage.local.get("settings", (result) => {
      if (!result.settings) {
        // If no settings are found, store the default ones
        chrome.storage.local.set({ settings: defaultSettings });
        console.log("background.js: Settings initialized with defaults:", defaultSettings);
      } else {
        console.log("background.js: Settings loaded:", result.settings);
      }
    });
  });
  