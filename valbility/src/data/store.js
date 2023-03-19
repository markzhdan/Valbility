const Store = require("electron-store");

module.exports = new Store({
  defaults: {
    "voice-activity-threshold": 40,
    "toggle-voice-keybind": 33, // PAGE_UP
    "toggle-game-keybind": 34, // PAGE_DOWN
    "valorant-voice-keybind": 86, // V
    "is-game-muted": false,
    "is-voice-muted": false,
    "is-mic-enabled": true,
  },
});
