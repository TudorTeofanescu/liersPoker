# LiersPoker

A multiplayer card game built with React and Electron, featuring Steam integration.

## About the Game

LiersPoker is a bluffing card game inspired by traditional poker mechanics where players make declarations about poker hands and challenge each other's claims. The game combines strategy, deception, and card game elements for an engaging multiplayer experience.

## Features

- **Cross-platform desktop application** - Built with Electron and React
- **Steam integration** - Friend invites, achievements, and matchmaking
- **Multiple game modes** - Play with friends or join matchmaking
- **Beautiful UI** - Responsive and intuitive interface
- **Multiplayer support** - Play online with friends or strangers

## Technology Stack

- **Frontend**: React.js
- **Desktop Runtime**: Electron
- **Game Server**: Node.js with Socket.IO
- **Steam Integration**: Greenworks SDK

## Development Setup

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- [Steam SDK](https://partner.steamgames.com/) (only for production builds)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/lierspoker.git
   cd lierspoker
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development environment:

   ```
   npm start
   ```

   This will start both the React development server and the Electron application.

### Development Without Steam

For development without Steam SDK:

```
npm run dev:no-steam
```

This uses a mock implementation of the Steam interface.

## Building for Production

To build the application for production:

```
npm run build
```

This will compile the React application and package it with Electron for your current platform.

## Game Rules

### Basic Gameplay

1. Players are dealt initial cards (2 per player).
2. On their turn, players can make a declaration about poker hands.
3. Other players can challenge declarations they believe are false.
4. Losers of challenges receive additional cards.
5. Players with 6 or more cards are eliminated.
6. Last player remaining wins the game.

### Declarations

A declaration is a claim about a poker hand that might exist among all the cards in play. Declarations must follow standard poker hand rankings and must be higher than the previous declaration.

### Challenges

When a player believes a declaration is false, they can challenge with "Trombon!" If the declared hand doesn't exist among all cards in play, the declarer loses the challenge. If it does exist, the challenger loses.

## Project Files Checklist

### Project Root Files

- [x] `package.json` - Project configuration and dependencies
- [ ] `.gitignore` - Git ignore configuration
- [x] `README.md` - Project documentation

### Public Directory

- [x] `public/index.html` - Main HTML template
- [x] `public/manifest.json` - Web app manifest
- [x] `public/robots.txt` - Web crawlers configuration
- [x] `public/electron.js` - Main Electron process
- [x] `public/preload.js` - Preload script for Electron

### Public/Steam Directory

- [x] `public/steam/mock-greenworks.js` - Mock implementation of Steam SDK
- [x] `public/steam/steamGameManager.js` - Steam game manager implementation
- [x] `public/steam/steam.js` - Steam integration utilities
- [x] `public/steam/steamLobbyManager.js` - Steam lobby management
- [x] `public/steam/steamMatchmaking.js` - Steam matchmaking system
- [x] `public/steam/steamEventEmitter.js` - Event handling for Steam

### Source Directory

- [x] `src/index.js` - React entry point
- [x] `src/App.js` - Main React component
- [x] `src/reportWebVitals.js` - Performance metrics

### Contexts

- [x] `src/contexts/SteamContext.js` - Steam-related state and functions
- [x] `src/contexts/GameContext.js` - Game state management
- [x] `src/contexts/SettingsContext.js` - User settings management

### Services

- [x] `src/services/api.js` - API service functions
- [x] `src/services/socket.js` - Socket.io connection setup
- [x] `src/services/storage.js` - Local storage utilities

### Utilities

- [x] `src/utils/gameLogic.js` - Core game logic functions
- [x] `src/utils/cardDeck.js` - Card deck generation and manipulation
- [x] `src/utils/validation.js` - Input validation functions
- [x] `src/utils/constants.js` - Game constants
- [x] `src/utils/HandExtractor.js` - Extract hand information from UI

### Styles

- [ ] `src/styles/index.css` - Global styles
- [ ] `src/styles/App.css` - App container styles
- [ ] `src/styles/Card.css` - Card component styles
- [ ] `src/styles/Hand.css` - Hand component styles
- [ ] `src/styles/GameControls.css` - Game control styles
- [ ] `src/styles/Selectors.css` - Card selector styles
- [ ] `src/styles/Board.css` - Game board styles
- [ ] `src/styles/LoginScreen.css` - Login screen styles
- [ ] `src/styles/RoomsScreen.css` - Rooms screen styles
- [ ] `src/styles/LobbyScreen.css` - Lobby screen styles
- [ ] `src/styles/GameScreen.css` - Game screen styles

### Components - Card Related

- [x] `src/components/Card/Card.js` - Card component
- [x] `src/components/Card/Card.css` - Card component
- [x] `src/components/Card/CardStack.js` - Card stack component
- [x] `src/components/Hand/Hand.js` - Hand component
- [x] `src/components/Hand/Hand.css` - Player hand component

### Components - Board Related

- [x] `src/components/Board/Board.js` - Game board component
- [x] `src/components/Board/GameTable.js` - Game table component

### Components - Screens

- [x] `src/components/Login/LoginScreen.js` - Login screen component
- [x] `src/components/Rooms/RoomsScreen.js` - Rooms screen component
- [x] `src/components/Lobby/LobbyScreen.js` - Lobby screen component
- [x] `src/components/Game/GameScreen.js` - Game screen component

### Components - Steam Related

- [ ] `src/components/Steam/SteamFriends.js` - Steam friends list component
- [ ] `src/components/Steam/SteamStatus.js` - Steam status display component

### Components - Game Mechanics

- [x] `src/components/Game/ChallengeControls.jsx` - Controls for challenging declarations
- [x] `src/components/Game/ChallengeControls.css` - Controls for challenging declarations
- [x] `src/components/Game/DeclarationControls.jsx` - Controls for making declarations
- [x] `src/components/Game/DeclarationControls.css` - Controls for making declarations
- [x] `src/components/Game/GameBoard.jsx` - Card selection interface
- [ ] `src/components/Game/GameBoard.css` - Card selection interface
- [x] `src/components/Game/GameControls.css` - Card selection interface

### Components - Card Selectors

- [ ] `src/components/Game/selectors/CardSelector.jsx` -
- [x] `src/components/Game/selectors/FlushSelector.jsx` - Flush selector
- [x] `src/components/Game/selectors/FourOfAKindSelector.jsx` - Four of a kind selector
- [x] `src/components/Game/selectors/FullHouseSelector.jsx` - Full house selector
- [x] `src/components/Game/selectors/HighCardSelector.jsx` - High card selector
- [x] `src/components/Game/selectors/OnePairSelector.jsx` - One pair selector
- [x] `src/components/Game/selectors/RoyalFlushSelector.jsx` - Royal flush selector
- [x] `src/components/Game/selectors/StraightFlushSelector.jsx` - Straight flush selector
- [x] `src/components/Game/selectors/StraightSelector.jsx` - Straight selector
- [x] `src/components/Game/selectors/ThreeOfAKindSelector.jsx` - Three of a kind selector
- [x] `src/components/Game/selectors/TwoPairSelector.jsx` - Two pair selector

### Components - Common UI

- [ ] `src/components/common/Button.js` - Reusable button component
- [ ] `src/components/common/Modal.js` - Modal dialog component
- [ ] `src/components/common/Notification.js` - Notification component
- [ ] `src/components/common/Header.js` - Header component
- [ ] `src/components/common/Loading.js` - Loading indicator component

## Progress

- ✅ Project structure created
- ✅ Steam integration setup
- ✅ Electron configuration
- ✅ React application foundation
- 🔄 Components development in progress (15% complete)
  - ✅ Game declaration controls
  - ✅ Basic card selectors (HighCard, OnePair)
  - ⬜ Remaining card selectors
  - ⬜ Game board components
  - ⬜ Screen components
- 🔄 Game logic integration in progress (40% complete)
  - ✅ Core game mechanics
  - ⬜ Player interactions
  - ⬜ Steam functionality
- 🔄 UI styling in progress (25% complete)
  - ✅ Card selectors styling
  - ✅ Game controls styling
  - ⬜ Board and layout styling
  - ⬜ Screen-specific styling
- ⬜ Testing and debugging

## License

[MIT License](LICENSE)

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Socket.IO](https://socket.io/)
- [Greenworks](https://github.com/greenheartgames/greenworks)
