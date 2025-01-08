# <img src="media/icon.png" alt="ThreadSieve Logo" width="50" /> ThreadSieve

**ThreadSieve** is a Google Chrome extension that detects and flags comments using customizable checks, such as checks based on search patterns or machine learning model inference.

### Supported Checks
| **Type of Check**          | **Description**                                                                 |
|----------------------------|---------------------------------------------------------------------------------|
| **Regex**                  | Flags comments matching specific regular expression patterns.                   |
| **LLM-based Classification** | Utilizes a [RoBERTa-based](https://huggingface.co/SuperAnnotate/ai-detector) model to detect AI-generated or unsanitary comments. |

### Supported Platforms
- **YouTube**

---

### Getting Started with ThreadSieve

#### 1. Install the Extension Locally

1. Clone ThreadSieve

    ```bash
    git clone git@github.com:lorenzorota/ThreadSieve.git
    ```

2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** and select the ThreadSieve directory.

### Running the Local Server (LLM-based classifier)

1. Navigate to the server directory.

    ```bash
    cd server
    ```
2. Install the required Python libraries using pip:

    ```bash
    pip install -r requirements.txt
    ```

3. Run the server.

    ```bash
    python server.py
    ```

4. Enable server integration in the extension popup by going to *Options > YouTube Settings* and toggling *Enable Server Check*.

