// Created by Mark Zhdan
// https://github.com/markzhdan/Valbility
// https://twitter.com/Valbility

//Electron Required
const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  shell,
} = require("electron");
const path = require("path");

// Local Data
const config = require("./data/store");
const { keyMap } = require("./data/keyboardMap");
const { ProcessesListener } = require("./listeners/process-listener");
const {
  WindowChangeListener,
  getActiveWindow,
} = require("./listeners/window-change-listener");

// Node Modules
const activeWindow = require("active-win");
const { NodeAudioVolumeMixer } = require("node-audio-volume-mixer");
const robot = require("robotjs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const statusStyles = {
  Offline: {
    text: "Offline",
    color: "gray",
  },
  RiotClient: {
    text: "Client",
    color: "goldenrod",
  },
  Valorant: {
    text: "Playing",
    color: "forestgreen",
  },
};

const processes = {
  VALORANT: {
    pid: null,
    started: false,
  },
  RiotClient: {
    pid: null,
    started: false,
  },
  Off: {
    pid: null,
    started: false,
  },
};

let mainWindow = null;

const createWindow = () => {
  // Creates the browser window.
  mainWindow = new BrowserWindow({
    title: "Valbility",
    icon: path.join(__dirname, "../../valbility/assets/icons/256_256.ico"),
    width: 400,
    height: 190,
    resizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: false,
      sandbox: false,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
    },
  });

  // IPC listeners
  ipcMain.on("config-get", async (event, value) => {
    event.returnValue = config.get(value);
  });
  ipcMain.on("config-set", async (e, key, value) => {
    config.set(key, value);
  });
  ipcMain.on("mute-processes", (e, muteGame, muteVoice, status) => {
    muteProcesses(muteGame, muteVoice, status);
  });

  ipcMain.on(
    "register-new-hotkey",
    async (e, configKey, newKey, keyFunctionality) => {
      const oldKey = config.get(configKey);

      globalShortcut.unregister(keyMap[oldKey].replace("\n", ""));
      config.set(configKey, newKey);

      // Resets keybind back to original keybind if invalid key to prevent app crashing.
      try {
        createGlobalShortcut(newKey, keyFunctionality);
      } catch {
        config.set(configKey, oldKey);
        createGlobalShortcut(oldKey, keyFunctionality);

        mainWindow.webContents.send(
          "update-keybind-text",
          oldKey,
          keyFunctionality
        );
      }
    }
  );

  ipcMain.on("get-keyboard-map", async (event) => {
    event.returnValue = keyMap;
  });

  ipcMain.on("get-app-version", async (event) => {
    event.returnValue = app.getVersion();
  });

  ipcMain.on("close-or-minizmize-app", (e, functionality) => {
    if (functionality === "minimize-btn") {
      mainWindow.minimize();
    } else {
      mainWindow.close();
    }
  });

  ipcMain.on("open-url", (e, url) => {
    shell.openExternal(url);
  });

  ipcMain.on("reset-config-to-default", (e) => {
    // Clears config and reloads window to reset UI
    config.clear();
    mainWindow.webContents.reloadIgnoringCache();

    // Resets keybinds
    globalShortcut.unregisterAll();
    createGlobalShortcut(config.get("mute-key"), false);
    createGlobalShortcut(config.get("unmute-key"), true);

    // Unmutes processes
    muteProcesses(true, true, false);
  });

  ipcMain.on("press-voice-key", async (e, action) => {
    // Exits if focused process is not VALOARANT
    const activeWin = await getActiveWindow();
    if (
      !activeWin.owner ||
      !activeWin.owner.path.endsWith("VALORANT-Win64-Shipping.exe")
    ) {
      return;
    }

    robot.keyToggle(keyMap[config.get("valorant-voice-keybind")], action);
  });

  // Default shortcuts
  createGlobalShortcut(config.get("mute-key"), false);
  createGlobalShortcut(config.get("unmute-key"), true);

  // Load main html to app window
  mainWindow.loadFile(path.join(__dirname, "public/index.html"));

  // Opens devtools
  // mainWindow.webContents.openDevTools();
};

// Waits for Electron initialization and creates browser window.
app.whenReady().then(() => {
  createWindow();

  const listener = new ProcessesListener([
    "RiotClientServices.exe",
    "VALORANT.exe",
  ]);

  listener.started(async ({ pid, name }) => {
    if (name === "VALORANT.exe") {
      updateStyle(pid, processes.VALORANT, statusStyles.Valorant);
    } else if (!processes.VALORANT.started) {
      // Riot Client accesses the correct pid
      updateStyle(pid, processes.RiotClient, statusStyles.RiotClient);
    }
  });

  listener.exited(({ pid, name }) => {
    if (name === "VALORANT.exe") {
      processes.VALORANT.started = false;

      if (processes.RiotClient.started) {
        updateStyle(-1, processes.RiotClient, statusStyles.RiotClient);
      } else {
        updateStyle(-1, processes.Off, statusStyles.Offline);
      }
    } else {
      processes.RiotClient.started = false;

      if (processes.VALORANT.started) {
        updateStyle(-1, processes.VALORANT, statusStyles.VALORANT);
      } else {
        updateStyle(-1, processes.Off, statusStyles.Offline);
      }
    }
  });

  const changeListener = new WindowChangeListener();

  changeListener.changed(({ windowInfo }) => {
    const toMuteGame = config.get("is-game-muted");
    const toMuteVoice = config.get("is-voice-muted");
    if (!toMuteGame && !toMuteVoice) {
      return;
    }

    if (
      windowInfo.title.includes("VALORANT") &&
      windowInfo.name.includes("VALORANT") &&
      windowInfo.path.endsWith("VALORANT-Win64-Shipping.exe")
    ) {
      processes.VALORANT.pid = windowInfo.pid;
      muteProcesses(toMuteGame, toMuteVoice, false);
    } else if (
      windowInfo.title.includes("Riot Client") &&
      windowInfo.name.includes("Riot Client") &&
      windowInfo.path.includes("RiotClient")
    ) {
      processes.RiotClient.pid = windowInfo.pid;
      muteProcesses(toMuteGame, toMuteVoice, true);
    } else {
      // If current window is not valorant or riot client

      muteProcesses(toMuteGame, toMuteVoice, true);
      // If the user tabs out while talking, it doesnt get stuck in the down press.
      robot.keyToggle(keyMap[config.get("valorant-voice-keybind")], "up");
      return;
    }
  });

  // OS X / macOS specific.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// OS X / macOS specific.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    muteProcesses(true, true, false);
    app.quit();
  }
});

// Volume unmute and global shortcut cleanup
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// App's specific main process code (helper functions):
async function muteProcesses(toMuteGame, toMuteVoice, action) {
  if (toMuteGame && processes.VALORANT.pid) {
    // *NOTE:
    // For some reason, ps-list does not give the accurate pid to match the audio session pid.
    // However, the active-win module does retrieve the correct pid.
    // This will be updated in the future so "./process-listener" will use the active-win module instead of ps-list
    // Sometimes ps-works but active win doesnt
    try {
      NodeAudioVolumeMixer.setAudioSessionMute(processes.VALORANT.pid, action);
    } catch {
      try {
        const actualPID = await getProcessPID("VALORANT");
        NodeAudioVolumeMixer.setAudioSessionMute(actualPID, action);
      } catch {
        console.log("An error occurred.");
      }
    }
  }
  if (toMuteVoice && processes.RiotClient.pid) {
    NodeAudioVolumeMixer.setAudioSessionMute(processes.RiotClient.pid, action);
  }
}

// Temporary function to get correct VALORANT pid on startup (*Read note above)
function getProcessPID(processName) {
  return activeWindow.getOpenWindows().then((openWindows) => {
    const processWindow = openWindows.find(
      (window) =>
        window.title.includes(processName) &&
        window.owner.path.includes(processName) &&
        window.owner.name.includes(processName)
    );
    return processWindow.owner.processId;
  });
}

function updateStyle(pid, processInfo, styles) {
  processInfo.pid = pid;
  processInfo.started = true;
  // Delay to ensure style change.
  setTimeout(() => {
    mainWindow.webContents.send(
      "update-status-style",
      styles.text,
      styles.color
    );
  }, 1000);
}

function createGlobalShortcut(newKey, action) {
  // Action: true: startAudio, false: stopAudio
  globalShortcut.register(keyMap[newKey].replace("\n", ""), () => {
    mainWindow.webContents.send("toggle-voice", action);
  });
}
