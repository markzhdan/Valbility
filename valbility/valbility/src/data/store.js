const Store = require("electron-store");

module.exports = new Store({
  defaults: {
    "voice-activity-threshold": 40,
    "toggle-voice-keybind": "PageUp",
    "toggle-game-keybind": "PageDown",
    "valorant-voice-keybind": "V",
    "is-game-muted": false,
    "is-voice-muted": false,
    "is-mic-enabled": true,
  },
});
