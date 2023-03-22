import { stopAudioStream, startAudioStream } from "./voice-audio.js";

const muteGameButton = document.getElementById("mute-game-checkbox");
const muteVoiceButton = document.getElementById("mute-voice-checkbox");
const thresholdSlider = document.getElementById("threshold-slider");

const toggleVoiceKey = document.getElementById("toggle-voice-key");
const toggleGameKey = document.getElementById("toggle-game-key");
const voiceHotkey = document.getElementById("voice-key");

const micButton = document.getElementById("mic");
const micIcon = document.getElementById("mic-icon");

const settingsButton = document.getElementById("settings-button");
const menuPopup = document.getElementById("menu-popup");
const resetButton = document.getElementById("reset-button");

const statusText = document.getElementById("game-status");
const versionText = document.getElementById("version");
const updaterText = document.getElementById("updater");

const externalLinkURLS = [
  "https://twitter.com/valbility", // Twitter
  "https://github.com/markzhdan/valbility", // GitHub
  "http://valbility.com/", // Website
];

window.addEventListener("DOMContentLoaded", () => {
  versionText.innerText = `Version • ${window.electronAPI.getValbilityVersion()}`;
});

muteGameButton.addEventListener("click", () => {
  audioButtonsClicked("is-game-muted", true, false, muteGameButton.checked);
});
muteVoiceButton.addEventListener("click", () => {
  audioButtonsClicked("is-voice-muted", false, true, muteVoiceButton.checked);
});
function audioButtonsClicked(key, muteGame, muteVoice, status) {
  // Sets user config to button status [ON/OFF]
  window.electronAPI.config.set(key, status);
  // Mutes/unmutes process when clicked
  window.electronAPI.muteProcesses(muteGame, muteVoice, status);
}

thresholdSlider.addEventListener("change", () => {
  window.electronAPI.config.set(
    "voice-activity-threshold",
    thresholdSlider.value
  );
});

toggleVoiceKey.addEventListener("click", async () => {
  addNewHotkey(toggleVoiceKey, "toggle-voice-keybind");
});
toggleGameKey.addEventListener("click", async () => {
  addNewHotkey(toggleGameKey, "toggle-game-keybind");
});
async function addNewHotkey(button, configKey) {
  let newKeybind = await newHotkeyPress();
  button.value = formatKeyInput(newKeybind);
  button.blur();

  window.electronAPI.registerNewHotkey(configKey, newKeybind);
}
voiceHotkey.addEventListener("click", async () => {
  let newKeybind = await newHotkeyPress();
  voiceHotkey.value = formatKeyInput(newKeybind);
  voiceHotkey.blur();

  window.electronAPI.config.set("valorant-voice-keybind", newKeybind);
});

micButton.addEventListener("click", () => {
  if (micIcon.className == "fa-solid fa-microphone") {
    stopAudioStream();
  } else {
    startAudioStream();
  }
});

settingsButton.addEventListener("click", () => {
  if (menuPopup.style.visibility === "visible") {
    menuPopup.style.visibility = "hidden";
  } else {
    menuPopup.style.visibility = "visible";
  }
});

resetButton.addEventListener("click", () => {
  window.electronAPI.resetConfigToDefault();
});

const linkButtons = document.querySelectorAll("a.link");
linkButtons.forEach(function (button, i) {
  button.addEventListener("click", () =>
    window.electronAPI.openURL(externalLinkURLS[i])
  );
});

const navButtons = document.querySelectorAll("button.nav-button");
navButtons.forEach(function (button, i) {
  button.addEventListener("click", () =>
    window.electronAPI.closeOrMinimizeApp(button.id)
  );
});

window.electronAPI.updateStatusStyle((e, text, color) => {
  statusText.innerText = text;
  statusText.style.color = color;
});

window.electronAPI.updateUpdaterMessage((e, message) => {
  updaterText.innerText = message;
});

window.electronAPI.updateKeybindText((e, keyValue, keyFunctionality) => {
  keyFunctionality === "toggle-game-keybind"
    ? (toggleGameKey.value = formatKeyInput(keyValue))
    : (toggleVoiceKey.value = formatKeyInput(keyValue));
});

// Waits and returns next keypress
function newHotkeyPress() {
  return new Promise((resolve) => {
    document.addEventListener("keydown", onKeyHandler);
    function onKeyHandler(event) {
      document.removeEventListener("keydown", onKeyHandler);
      // Returns string of key - "PageDown".
      resolve(event.key);
    }
  });
}

function formatKeyInput(newKey) {
  try {
    const newKeybindArray = newKey.match(/[A-Z][a-z]+|[0-9]+/g);
    return newKeybindArray.join("\n").toUpperCase();
  } catch {
    return newKey.toUpperCase();
  }
}
