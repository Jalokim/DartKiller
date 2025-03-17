# Killer Darts App Changelog

## 2023-11-XX - UI and Gameplay Enhancements

### Added

- **Next Player Indicator**: Added a darker green bar at the bottom of the scoreboard showing the upcoming player and their remaining lives
- **Player Order Button**: Added a circular button with down arrow between target and current score to reopen the player order overlay at any time
- **Player Order Overlay**:
  - New overlay showing player turn order at game start
  - Added OK button to dismiss the overlay early
  - Auto-dismisses after 4 seconds if not manually closed
- **Game Over Screen**:
  - Changed background to match the scoreboard's emerald green color
  - Added confetti celebration effect when a player wins

### Changed

- **Lives Input on Home Screen**:
  - Made the lives count input read-only
  - Added plus/minus buttons for easier adjustment
  - Limited maximum lives to 5 (previously 10)
  - Added visual feedback for min/max limits
- **Home Page Layout**:
  - Fixed positioning of the start game button
  - Simplified the display of lives
  - Improved overall spacing and layout
- **Animations**:
  - Increased heart and skull animation size to fill approximately 1/4 of the screen for better visibility

### Fixed

- Various layout and positioning issues
- Improved mobile touch experience with the new plus/minus controls

### Optimized

- Removed unused functions (`getRandomHeartStyle` and `getRandomSize`) to clean up the codebase
