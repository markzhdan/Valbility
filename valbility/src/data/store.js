const Store = require("electron-store");

module.exports = new Store({
  defaults: {
    "voice-activity-threshold": 40,
    "mute-key": 33, // PAGE_UP
    "unmute-key": 34, // PAGE_DOWN
    "valorant-voice-keybind": 86, // V
    "is-game-muted": false,
    "is-voice-muted": false,
    "mute-game-key": "188", // COMMA
    "mute-voice-key": "190", // PERIOD
    "is-mic-enabled": true,
  },
});
