# Read Aloud Button to Persistent Control Bar on ChatGPT

This Chrome extension duplicates ChatGPT's `Read aloud` button and places it in the persistent composer bar. The cloned button always stays visible so you can start playback even while scrolling through the conversation.

## Installation

1. Clone or download this repository.
2. Open **chrome://extensions** in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this folder.

The extension will automatically inject the persistent button on pages that match `https://chat.openai.com/*` and `https://chatgpt.com/*`.

## Screenshots

| Before | After |
| --- | --- |
| ![Before screenshot](https://i.imgur.com/D733bfB.png) | ![After screenshot](https://i.imgur.com/AUXU9bf.png) |

The "before" screenshot shows the default position of the Read Aloud button. The "after" screenshot demonstrates the duplicated button pinned to the bottom toolbar.

## Development

See `content.js` for the script that clones the original button and keeps it in sync with the state of the toolbar.

