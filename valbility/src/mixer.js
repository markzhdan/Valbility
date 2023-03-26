("use strict");
Object.defineProperty(exports, "__esModule", { value: true });
var NativeSoundMixer = require("native-sound-mixer");

class Mixer {
  constructor(processName, appName) {
    this.processName = processName;
    this.appName = appName;
    this.appStarted = false;
    this.defaultDevice = this.getDefaultDevice();
    this.defaultDeviceSessions = this.getAudioSessions();
    this.processAudioSession = this.getProcessSession();
  }

  getDefaultDevice() {
    return NativeSoundMixer.default.getDefaultDevice(
      NativeSoundMixer.DeviceType.RENDER
    );
  }
  getAudioSessions() {
    return this.defaultDevice.sessions;
  }

  getProcessSession() {
    return this.defaultDeviceSessions.find(
      (session) =>
        session.name.includes(this.processName) &&
        session.appName.includes(this.appName)
    );
  }

  resetSession() {
    this.defaultDevice = null;
    this.defaultDeviceSessions = null;
    this.processAudioSession = null;
  }

  async ensureSessionIsSet() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.processAudioSession) {
          clearInterval(interval);
          return resolve();
        } else {
          this.defaultDevice = this.getDefaultDevice();
          this.defaultDeviceSessions = this.getAudioSessions();
          this.processAudioSession = this.getProcessSession();
        }
      }, 1000);
    });
  }

  mute() {
    if (this.processAudioSession) {
      this.processAudioSession.mute = true;
    }
  }
  unmute() {
    if (this.processAudioSession) {
      this.processAudioSession.mute = false;
    }
  }

  flipMute() {
    if (this.processAudioSession) {
      if (this.processAudioSession.mute) {
        this.processAudioSession.mute = false;
      } else {
        this.processAudioSession.mute = true;
      }
    }
  }
}
exports.Mixer = Mixer;
