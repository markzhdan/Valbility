let stream = null;
let audioLevelLoop = null;

const micIcon = document.getElementById("mic-icon");
const coverBox = document.getElementById("cover-box");
const SLIDER_RANGE = 145; //px long

const thresholdSlider = document.getElementById("threshold-slider");
let threshold = thresholdSlider.value;

let startTime = -1;
const micShutOffDelayInMilliseconds = 500;

window.addEventListener("DOMContentLoaded", () => {
  threshold = window.electronAPI.config.get("voice-activity-threshold");

  const isMicOn = window.electronAPI.config.get("is-mic-enabled");
  isMicOn ? startAudioStream() : stopAudioStream();
});

thresholdSlider.addEventListener("change", () => {
  threshold = thresholdSlider.value;
  window.electronAPI.config.set(
    "voice-activity-threshold",
    thresholdSlider.value
  );
});

window.electronAPI.toggleVoice((e, status) => {
  status ? startAudioStream() : stopAudioStream();
});

export function startAudioStream() {
  // Prevents multiple audio streams from being created
  if (!stream) {
    AudioStream();
    window.electronAPI.config.set("is-mic-enabled", true);

    // UI decoration
    coverBox.style.backgroundColor = "#515570";
    // Mic to white full
    micIcon.className = "fa-solid fa-microphone";
    micIcon.style.color = "white";
  }
}

export function stopAudioStream() {
  if (stream) {
    startTime = -1;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    clearInterval(audioLevelLoop);
    stream = null;
  }
  // If the user mutes while talking, it turns off voice
  window.electronAPI.pressVoiceKey("up");
  window.electronAPI.config.set("is-mic-enabled", false);

  // UI decoration
  coverBox.style.width = SLIDER_RANGE + "px";
  coverBox.style.backgroundColor = "#74445A";
  // Mic to red mute
  micIcon.style.color = "maroon";
  micIcon.className = "fa-solid fa-microphone-slash";
}

function AudioStream() {
  const constraints = { audio: true };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((s) => {
      stream = s;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      // Configure the analyzer
      source.connect(analyser);
      analyser.fftSize = 2048;

      // Calculate the audio level
      function getAudioLevel() {
        const frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);

        // Calculate average amplitude
        const amplitude =
          Array.from(frequencyData).reduce((acc, val) => acc + val, 0) /
          frequencyData.length;
        return amplitude;
      }

      // Use the audio level
      audioLevelLoop = setInterval(async () => {
        const audioLevel = getAudioLevel();
        let adjustedVal = audioLevel * 1.5;
        // Changes cover box to reflect audio level
        coverBox.style.width = SLIDER_RANGE - adjustedVal + "px";

        if (adjustedVal > threshold) {
          // Mic is on
          if (startTime == -1) {
            window.electronAPI.pressVoiceKey("down");
          }
          startTime = Date.now();
        }
        if (
          startTime != -1 &&
          Date.now() - startTime >= micShutOffDelayInMilliseconds
        ) {
          // Mic off
          window.electronAPI.pressVoiceKey("up");
          startTime = -1;
        }
      }, 10);
    })
    .catch((err) => {
      console.error(err);
    });
}

// Different possible way of getting the audio level from the source

// const bufferLength = analyser.fftSize;
// const dataArray = new Uint8Array(bufferLength);
// function getAudioLevel() {
//   analyser.getByteTimeDomainData(dataArray);
//   let rms = 0;
//   for (let i = 0; i < bufferLength; i++) {
//     rms += Math.pow((dataArray[i] - 128) / 128, 2);
//   }
//   rms = Math.sqrt(rms / bufferLength);
//   const db = 20 * Math.log10(rms);
//   return db;
// }
