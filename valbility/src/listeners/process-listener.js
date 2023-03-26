// Worker that listens if a process is started or stopped.
// Updated version of https://www.npmjs.com/package/process-listener?activeTab=readme that includes watching a list of processes
const { EventEmitter } = require("events");
const pslist = require("ps-list");

class ProcessesListener {
  constructor(processesToWatch) {
    this.event = new EventEmitter();
    this.processesToWatch = processesToWatch;
    this.lastLoopOpenedProcess = [];
    this.loop();
  }

  started = (cb) => {
    this.event.on("started", (processInfo) => {
      cb(processInfo);
      return;
    });
  };

  exited = (cb) => {
    this.event.on("exited", (processInfo) => {
      cb(processInfo);
      return;
    });
  };

  loop() {
    pslist().then((allProcesses) => {
      const openedProcesses = allProcesses.filter((process) =>
        this.processesToWatch.includes(process.name)
      );

      let currentOpenedProcesses = [];
      this.processesToWatch.forEach((processToWatch) => {
        const index = openedProcesses
          .map((process) => process.name)
          .indexOf(processToWatch);
        if (index != -1) {
          currentOpenedProcesses.push(openedProcesses[index]);
        }
      });

      this.processesToWatch.forEach((processName) => {
        if (
          currentOpenedProcesses.find(
            (process) => process.name == processName
          ) &&
          !this.lastLoopOpenedProcess.find(
            (process) => process.name == processName
          )
        ) {
          const foundProcess = currentOpenedProcesses.find(
            (process) => process.name == processName
          );
          this.event.emit("started", {
            name: foundProcess.name,
          });
        } else if (
          !currentOpenedProcesses.find(
            (process) => process.name == processName
          ) &&
          this.lastLoopOpenedProcess.find(
            (process) => process.name == processName
          )
        ) {
          const foundProcess = this.lastLoopOpenedProcess.find(
            (process) => process.name == processName
          );
          this.event.emit("exited", {
            name: foundProcess.name,
          });
        }
      });

      this.lastLoopOpenedProcess = currentOpenedProcesses;
    });

    setTimeout(() => this.loop(), 1000);
  }
}
exports.ProcessesListener = ProcessesListener;
