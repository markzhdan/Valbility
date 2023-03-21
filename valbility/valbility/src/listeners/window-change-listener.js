// Listens for when the active window changes
const { EventEmitter } = require("events");
const activeWindow = require("active-win");

class WindowChangeListener {
  constructor() {
    this.event = new EventEmitter();
    this.lastWindow = {
      owner: {
        processId: -1,
        path: "",
      },
    };
    this.loop();
  }

  changed = (cb) => {
    this.event.on("changed", (windowInfo) => {
      cb(windowInfo);
      return;
    });
  };

  loop() {
    activeWindow().then((currentWindow) => {
      if (
        currentWindow === null ||
        (currentWindow.title === "" &&
          currentWindow.owner.name === "Windows Explorer")
      ) {
        return;
      }
      if (
        currentWindow.owner.processId !== this.lastWindow.owner.processId &&
        currentWindow.owner.path !== this.lastWindow.owner.path
      ) {
        this.event.emit("changed", {
          windowInfo: {
            title: currentWindow.title,
            name: currentWindow.owner.name,
            pid: currentWindow.owner.processId,
            path: currentWindow.owner.path,
          },
        });
      }

      this.lastWindow = currentWindow;
    });

    setTimeout(() => this.loop(), 100);
  }
}
exports.WindowChangeListener = WindowChangeListener;

async function getActiveWindow() {
  return await activeWindow();
}
exports.getActiveWindow = getActiveWindow;
