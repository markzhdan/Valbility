const { contextBridge, ipcRenderer } = require("electron");
const config = require("./data/store");

contextBridge.exposeInMainWorld("electronAPI", {
  // Renderer to main functions
  muteProcesses: (key, status) =>
    ipcRenderer.send("mute-processes", key, status),
  registerNewHotkey: (configKey, newKey) =>
    ipcRenderer.send("register-new-hotkey", configKey, newKey),
  getValbilityVersion() {
    return ipcRenderer.sendSync("get-app-version");
  },
  closeOrMinimizeApp: (functionality) =>
    ipcRenderer.send("close-or-minizmize-app", functionality),
  openURL: (url) => ipcRenderer.send("open-url", url),
  resetConfigToDefault: () => ipcRenderer.send("reset-config-to-default"),
  pressVoiceKey: (action) => ipcRenderer.send("press-voice-key", action),

  // Electron-store config default IPC model
  config: {
    get(key) {
      return ipcRenderer.sendSync("config-get", key);
    },
    set(property, value) {
      ipcRenderer.send("config-set", property, value);
    },
  },

  // Main to renderer functions
  toggleVoice: (status) => ipcRenderer.on("toggle-voice", status),
  updateStatusStyle: (text, color) =>
    ipcRenderer.on("update-status-style", text, color),
  updateKeybindText: (keyValue, keyFunctionality) =>
    ipcRenderer.on("update-keybind-text", keyValue, keyFunctionality),
  updateUpdaterMessage: (message) =>
    ipcRenderer.on("update-updater-message", message),
});

window.addEventListener("DOMContentLoaded", () => {
  const muteGameElement = document.getElementById("mute-game-checkbox");
  const muteVoiceElement = document.getElementById("mute-voice-checkbox");
  const thresholdSlider = document.getElementById("threshold-slider");
  const toggleVoiceKey = document.getElementById("toggle-voice-key");
  const toggleGameKey = document.getElementById("toggle-game-key");
  const voiceHotkey = document.getElementById("voice-key");

  muteGameElement.checked = config.get("is-game-muted");
  muteVoiceElement.checked = config.get("is-voice-muted");
  thresholdSlider.value = config.get("voice-activity-threshold");
  toggleVoiceKey.value = formatKeyInput(config.get("toggle-voice-keybind"));
  toggleGameKey.value = formatKeyInput(config.get("toggle-game-keybind"));
  voiceHotkey.value = formatKeyInput(config.get("valorant-voice-keybind"));
});

function formatKeyInput(newKey) {
  try {
    const newKeybindArray = newKey.match(/[A-Z][a-z]+|[0-9]+/g);
    return newKeybindArray.join("\n").toUpperCase();
  } catch {
    return newKey.toUpperCase();
  }
}
