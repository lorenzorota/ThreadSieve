(() => {
  // Initialize flagged data
  if (!window.flaggedData) {
    window.flaggedData = {
      flaggedHandles: [],
      flaggedComments: [],
    };
  }

  let observer = null; // Declare observer at the top level

  // Function to undo everything once extension is disabled 
  const removeChanges = () => {
    console.log("content.js: Removing changes applied by the extension");
    const flaggedElements = document.querySelectorAll(".flagged-comment");
    flaggedElements.forEach((el) => {
        el.style.border = ""; // Reset border
        el.style.borderRadius = ""; // Reset border radius
        el.style.padding = ""; // Reset padding
        el.style.margin = ""; // Reset margin
        el.style.backgroundColor = ""; // Reset background color
        el.style.color = ""; // Reset color
    });
    window.flaggedData.flaggedHandles = [];
    window.flaggedData.flaggedComments = [];
  };

  // Flag comments based on settings
  const shouldFlagCommentRegex = (commentText) => {
    try {
      const regex = new RegExp(window.settings.regexCondition, 'g');
      return regex.test(commentText);
    } catch (error) {
      console.error("Invalid regex:", window.settings.regexCondition);
      return false;
    }
  };

  const checkCommentWithServer = async (commentText) => {
    if (!window.settings.enableServer) return false;

    try {
      const response = await fetch("http://localhost:5959/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });

      if (!response.ok) {
        console.error("content.js: Server returned an error:", response.statusText);
        return false;
      }

      const data = await response.json();
      return data.flagged || false;
    } catch (error) {
      console.error("content.js: Error communicating with the server:", error);
      return false;
    }
  };

  const isDarkMode = () => {
    const bodyBackgroundColor = getComputedStyle(document.body).backgroundColor;
    const rgb = bodyBackgroundColor.match(/\d+/g);
    if (!rgb) return false;

    const [r, g, b] = rgb.map(Number);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 128; // Dark mode if luminance < 128
  };

  const highlightCommentContainer = (commentContainer, isDark) => {
    commentContainer.style.border = "2px solid red";
    commentContainer.style.borderRadius = "6px";
    commentContainer.style.padding = "8px";
    commentContainer.style.margin = "8px 0";
    commentContainer.style.backgroundColor = isDark ? "#333333" : "#ffe6e6";
    commentContainer.style.color = isDark ? "#ffffff" : "#000000";
    commentContainer.classList.add("flagged-comment");
  };

  const processComment = async (renderer) => {
    const commentContainer = renderer.querySelector("#body");
    const commentElement = renderer.querySelector("#content-text");
    const commentText = commentElement?.textContent || "";

    if (!commentText || commentContainer.classList.contains("processed-comment")) return;

    // Mark the comment container as processed
    commentContainer.classList.add("processed-comment");

    const isFlagged = (window.settings.enableRegex && shouldFlagCommentRegex(commentText)) ||
                      (window.settings.enableServer && await checkCommentWithServer(commentText));

    if (isFlagged) {
    const handleElement = renderer.querySelector("#author-text span");
    if (handleElement) {
        const handle = handleElement.textContent.trim();
        if (!window.flaggedData.flaggedHandles.includes(handle)) {
        window.flaggedData.flaggedHandles.push(handle);
        console.log("content.js: Flagged handle:", handle);
        }
    }

    // Add the flagged comment text to the flaggedComments array
    if (!window.flaggedData.flaggedComments.includes(commentText)) {
        window.flaggedData.flaggedComments.push(commentText);
        // console.log("content.js: Flagged comment:", commentText);
    }

    // Highlight the flagged comment container
    const commentContainer = renderer.querySelector("#body");
    highlightCommentContainer(commentContainer, isDarkMode());
    }
  };
  
  const flagAllComments = async () => {
    console.log("content.js: Running flagging logic");
    const commentRenderers = document.querySelectorAll("ytd-comment-thread-renderer");

    for (const renderer of commentRenderers) {
      await processComment(renderer);
    }

    console.log("content.js: Flagged data:", window.flaggedData);
  };

  const observeComments = () => {
    const commentSection = document.querySelector("ytd-comments");

    if (!commentSection) {
        console.warn("content.js: Comment section not found, retrying...");
        setTimeout(observeComments, 1000);
        return;
    }

    if (observer) observer.disconnect(); // Disconnect the observer if it already exists

    observer = new MutationObserver(() => {
        if (!window.settings.isExtensionEnabled) {
            console.log("content.js: Extension is disabled, ignoring mutations.");
            return;
        }
        console.log("content.js: New comments detected, running flagging logic...");
        flagAllComments();
    });

    observer.observe(commentSection, { childList: true, subtree: true });
    console.log("content.js: MutationObserver set up for comment section");
  };

  const applySettings = (settings) => {
    if (!settings.isExtensionEnabled) {
        console.log("content.js: Extension is disabled. Removing changes.");
        if (observer) observer.disconnect(); // Stop observing
        removeChanges();
        return;
    }

    console.log("content.js: Extension is enabled. Processing comments.");
    observeComments(); // Reinitialize observation when enabled
    flagAllComments(); // Process existing comments
  };

  // Initialize settings
  chrome.storage.local.get("settings", (result) => {
    const settings = result.settings || { isExtensionEnabled: true };
    window.settings = settings;
    applySettings(settings);
  });

  // React to settings changes
  chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings) {
          const updatedSettings = changes.settings.newValue;
          console.log("content.js: Detected settings change:", updatedSettings);
          window.settings = updatedSettings;
          applySettings(updatedSettings);
      }
  });
})();
