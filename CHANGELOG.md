# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Expected: March 28, 2023

### Upcoming Features

- Decrease volume on unfocus/hotkey instead of muting.
- Remove/unbind hotkey to blank.
- UI improvements for Audio and Settings sections.
- Possible game overlay for mic status?

### QOL

- Listener optimizations

### Known Bugs

- Certain key binds don't currently work.

## [0.2.7] - March 25, 2023

Install new release from [releases](https://github.com/markzhdan/Valbility/releases/tag/0.2.7)

### Added

- Migrated from [node-audio-volume-mixer](https://www.npmjs.com/package/node-audio-volume-mixer) to [native-sound-mixer](https://www.npmjs.com/package/native-sound-mixer)
  - Fixes bugs with not being able to mute VALORANT/voice chat.
- Valbility now automatically unmutes processes when exiting.

### Fixed

- Settings menu now closes when unfocused.
- Memory leaks.
- Various mute/unmute bugs.
- Config not saving.

## [0.2.5] - March 21, 2023

Install new release from [releases](https://github.com/markzhdan/Valbility/releases/tag/0.2.5)

### Added

- Auto updater
- Status message in the bottom left hand corner states:
  - Checking for update...
  - Downloading update...
  - Restart to update!

### Changed

- Migrated from robotjs to nut.js!
  - Fixes build and prebuild errors.
  - More compatible keys with electron shortcuts.
- Removed keyboardMap.js
- Updated default config to support nut.js.
- Updated key formater to work with nut.js.

### Fixed

- Build errors with node-abi.
- Various mute/unmute bugs when VALORANT was opened.

## [0.2.0] - March 19, 2023

Install new release from [releases](https://github.com/markzhdan/Valbility/releases/tag/0.2.0)

### Added

- Toggle Mic: Single hotkey to mute and unmute voice functionality.
- Toggle Audio: Single hotkey to mute and unmute in-game sound.

### Changed

- Removed unmute/mute keybinds (replaced).
- Updated hotkey bind labels.
- Removed unnecessary electron-store config keys.

### Fixed

- Bug where game/voice was not muted/unmuted when started.
- Bug where mute hotkey did not function before VALORANT was in focus at least once.

## [0.1.0] - March 14, 2023

### Soft Release

Initial Commit!

See [README](https://github.com/markzhdan/Valbility/blob/master/README.md) for a list of features.

- [Twitter](https://twitter.com/Valbility)
- [Website](http://valbility.com/)
