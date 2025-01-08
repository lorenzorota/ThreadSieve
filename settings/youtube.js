if (!window.YouTubeSettings) {
    window.YouTubeSettings = {
        initialize: () => {
            console.log("youtube.js: Initializing settings");

            const form = document.getElementById("youtube-settings-form");
            const enableServerCheckbox = document.getElementById("enable-server");
            const enableRegexCheckbox = document.getElementById("enable-regex");
            const regexConditionInput = document.getElementById("regex-condition");
            const saveButton = document.getElementById("save-youtube-settings");

            if (!form) {
                console.error("youtube.js: Form not found in the document");
                return;
            }

            // Default settings
            const defaultSettings = {
                enableServer: false,
                enableRegex: true,
                regexCondition: "^[^A-Z]*$",
            };

            // Load settings from storage
            const loadSettings = () => {
                console.log("youtube.js: Loading settings from chrome.storage.local");

                chrome.storage.local.get("settings", (result) => {
                    const settings = result.settings || {};
                    console.log("youtube.js: Loaded settings", settings);

                    // Update the UI with loaded settings
                    enableServerCheckbox.checked = settings.enableServer;
                    enableRegexCheckbox.checked = settings.enableRegex;
                    regexConditionInput.value = settings.regexCondition;
                });
            };

            // Save settings to storage
            const saveSettings = (updatedFields) => {
                chrome.storage.local.get("settings", (result) => {
                    const currentSettings = result.settings || {}; // Fetch current settings
                    const updatedSettings = { ...currentSettings, ...updatedFields }; // Merge updates
            
                    chrome.storage.local.set({ settings: updatedSettings }, () => {
                        console.log("youtube.js: Settings saved successfully", updatedSettings);
                    });
                });
            };

            // Event listeners
            saveButton.removeEventListener("click", saveSettings); // Avoid duplicate listeners
            saveButton.addEventListener("click", () => {
                const updatedFields = {
                    enableServer: enableServerCheckbox.checked,
                    enableRegex: enableRegexCheckbox.checked,
                    regexCondition: regexConditionInput.value,
                };
        
                saveSettings(updatedFields); // Use the new save function
            });
            
            // Load settings
            loadSettings();
        }
    };

    // Initialize on first load
    window.YouTubeSettings.initialize();
}
