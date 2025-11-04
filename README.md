# Read Aloud Button for ChatGPT

A Chrome extension that adds a persistent "Read Aloud" button to ChatGPT's bottom toolbar, making it easy to start audio playback without opening context menus.

## Features

- 🎯 **Always Visible** - Button stays in the bottom toolbar while scrolling
- 🔇 **Invisible Menu** - Triggers ChatGPT's native Read Aloud feature without showing menus
- 🎵 **Smart Icons** - Automatically switches between play/stop icons based on audio state
- ⚡ **Event-Driven** - Uses audio event listeners, no constant polling
- 🎨 **Native Styling** - Matches ChatGPT's design language

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `Read-Aloud-Button-to-Persistent-Control-Bar-on-ChatGPT` folder

The extension will automatically activate on:
- `https://chat.openai.com/*`
- `https://chatgpt.com/*`

## How It Works

1. The extension adds a speaker icon to the bottom toolbar
2. Clicking the button opens ChatGPT's "More actions" menu invisibly
3. It automatically finds and clicks the native "Read aloud" option
4. The button icon updates to show play/stop states based on audio playback
5. All menu operations happen off-screen with no visual interference

## Technical Details

- Uses event-driven architecture with audio element listeners
- No constant polling or background processes
- Minimal performance impact
- Works with ChatGPT's existing Read Aloud functionality

## Files

- `content-simple.js` - Main extension script
- `manifest.json` - Extension configuration
- `icons/` - Extension icons

## License

See `LICENSE` file for details.
