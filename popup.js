document.addEventListener("DOMContentLoaded", () => {
  const tabOverview = document.getElementById("tab-overview");
  const tabOptions = document.getElementById("tab-options");
  const contentOverview = document.getElementById("content-overview");
  const contentOptions = document.getElementById("content-options");
  const youtubeSettingsFrame = document.getElementById("youtube-settings-frame");
  const youtubeSettingsContent = document.getElementById("youtube-settings-content");
  const backToOptions = document.getElementById("back-to-options");
  const toggleExtensionButton = document.getElementById("toggle-extension");
  const commentCountElement = document.getElementById("comment-count");
  const showFlaggedButton = document.getElementById("show-flagged");
  const flaggedListElement = document.getElementById("flagged-list");

  // Default state
  const defaultSettings = {
    isExtensionEnabled: true
  };

  const loadSettings = () => {
    chrome.storage.local.get("settings", (result) => {
      const settings = result.settings || defaultSettings;
      console.log("popup.js: Loaded settings", settings);

      // Update the UI based on the extension's enabled state
      updateToggleExtensionUI(settings.isExtensionEnabled);
    });
  };

  const saveSettings = (updatedSettings = {}) => {
    chrome.storage.local.get("settings", (result) => {
      const currentSettings = result.settings || defaultSettings;
      const newSettings = { ...currentSettings, ...updatedSettings };

      chrome.storage.local.set({ settings: newSettings }, () => {
        console.log("popup.js: Settings saved successfully", newSettings);
      });
    });
  };

  const toggleExtension = () => {
    chrome.storage.local.get("settings", (result) => {
      const settings = result.settings || defaultSettings;
      const newState = !settings.isExtensionEnabled;

      saveSettings({ isExtensionEnabled: newState });
      updateToggleExtensionUI(newState);
    });
  };

  const updateToggleExtensionUI = (isEnabled) => {
    toggleExtensionButton.textContent = isEnabled ? "Disable" : "Enable";
    toggleExtensionButton.classList.toggle("pressed", isEnabled);
  };

  const displayFlaggedCommentsCount = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => window.flaggedData?.flaggedComments?.length || 0
        },
        (results) => {
          const count = results[0]?.result || 0;
          commentCountElement.textContent = count;
          console.log("popup.js: Total flagged comments:", count);
        }
      );
    });
  };

  const displayFlaggedHandles = () => {
    flaggedListElement.innerHTML = ""; // Clear the previous list
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => window.flaggedData?.flaggedHandles || []
        },
        (results) => {
          const handles = results[0]?.result || [];
          console.log("popup.js: Flagged handles received:", handles);

          handles.forEach((handle) => {
            const li = document.createElement("li");
            li.textContent = handle;
            flaggedListElement.appendChild(li);
          });

          flaggedListElement.style.display =
            flaggedListElement.style.display === "none" ? "block" : "none"; // Toggle visibility
          showFlaggedButton.textContent =
            flaggedListElement.style.display === "none"
              ? "Show Flagged Handles"
              : "Hide Flagged Handles";
        }
      );
    });
  };

  tabOverview.addEventListener("click", () => {
      tabOverview.classList.add("active");
      tabOptions.classList.remove("active");
      contentOverview.style.display = "block";
      contentOptions.style.display = "none";
      youtubeSettingsFrame.style.display = "none";

      displayFlaggedCommentsCount();
  });

  tabOptions.addEventListener("click", () => {
      tabOverview.classList.remove("active");
      tabOptions.classList.add("active");
      contentOverview.style.display = "none";
      contentOptions.style.display = "block";
      youtubeSettingsFrame.style.display = "none";
  });

  document.getElementById("youtube-settings").addEventListener("click", () => {
    contentOptions.style.display = "none";
    youtubeSettingsFrame.style.display = "block";

    fetch("settings/youtube.html")
        .then((response) => response.text())
        .then((html) => {
            youtubeSettingsContent.innerHTML = html;

            // Dynamically load the youtube.js script only once
            if (!window.YouTubeSettings) {
                const script = document.createElement("script");
                script.src = "settings/youtube.js";
                script.onload = () => {
                    console.log("youtube.js loaded dynamically");
                    if (window.YouTubeSettings && window.YouTubeSettings.initialize) {
                        window.YouTubeSettings.initialize();
                    }
                };
                document.body.appendChild(script);
            } else {
                console.log("youtube.js is already loaded, reinitializing");
                if (window.YouTubeSettings.initialize) {
                    window.YouTubeSettings.initialize();
                }
            }
        })
        .catch((error) => console.error("Failed to load YouTube settings page:", error));

    console.log("loaded youtube");
  });

  backToOptions.addEventListener("click", () => {
      youtubeSettingsFrame.style.display = "none";
      contentOptions.style.display = "block";
  });

  toggleExtensionButton.addEventListener("click", toggleExtension);
  showFlaggedButton.addEventListener("click", displayFlaggedHandles);

  loadSettings();
  displayFlaggedCommentsCount();
});