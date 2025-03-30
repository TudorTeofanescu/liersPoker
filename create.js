/**
 * LiersPoker React/Electron Project Structure Generator
 *
 * This script creates a new React-based Electron project structure for the
 * LiersPoker card game with Steam integration.
 *
 * It creates the directory structure and empty files that you can populate
 * with your existing code.
 *
 * Usage:
 * 1. Create a new directory for your project
 * 2. Place this script in that directory
 * 3. Run: node create-project-structure.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Project setup questions
const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// Create directory if it doesn't exist
const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Create an empty file
const createEmptyFile = (filePath) => {
  fs.writeFileSync(filePath, "");
  console.log(`Created empty file: ${filePath}`);
};

// Main function to set up the project structure
async function setupProjectStructure() {
  console.log("\n========== LiersPoker React/Electron Project Structure Setup ==========\n");

  // Get project configuration
  const projectPath = (await askQuestion("Project directory path (default is current directory): ")) || process.cwd();
  const fullProjectPath = path.resolve(projectPath);

  console.log(`\nSetting up project structure in: ${fullProjectPath}`);

  // Create the project directory structure
  const directories = [
    "", // Root directory
    "public",
    "public/steam",
    "src",
    "src/components",
    "src/contexts",
    "src/services",
    "src/utils",
    "src/assets",
    "src/styles",
    // Components subdirectories
    "src/components/Card",
    "src/components/Hand",
    "src/components/Board",
    "src/components/Login",
    "src/components/Rooms",
    "src/components/Lobby",
    "src/components/Game",
    "src/components/Steam",
    "src/components/common",
  ];

  // Create all directories
  for (const dir of directories) {
    createDir(path.join(fullProjectPath, dir));
  }

  // Create root-level files
  const rootFiles = ["package.json", ".gitignore", "README.md"];

  // Create public files
  const publicFiles = ["public/electron.js", "public/preload.js", "public/index.html", "public/manifest.json", "public/robots.txt"];

  // Create Steam-related files
  const steamFiles = ["public/steam/mock-greenworks.js", "public/steam/steamGameManager.js", "public/steam/steam.js"];

  // Create src files
  const srcFiles = ["src/index.js", "src/App.js", "src/reportWebVitals.js"];

  // Create context files
  const contextFiles = ["src/contexts/SteamContext.js", "src/contexts/GameContext.js", "src/contexts/SettingsContext.js"];

  // Create service files
  const serviceFiles = ["src/services/socket.js", "src/services/api.js", "src/services/storage.js"];

  // Create utility files
  const utilFiles = ["src/utils/gameLogic.js", "src/utils/cardDeck.js", "src/utils/validation.js", "src/utils/constants.js"];

  // Create style files
  const styleFiles = [
    "src/styles/index.css",
    "src/styles/App.css",
    "src/styles/Card.css",
    "src/styles/Hand.css",
    "src/styles/Board.css",
    "src/styles/LoginScreen.css",
    "src/styles/RoomsScreen.css",
    "src/styles/LobbyScreen.css",
    "src/styles/GameScreen.css",
  ];

  // Create component files
  const componentFiles = [
    // Card components
    "src/components/Card/Card.js",
    "src/components/Card/CardStack.js",
    // Hand components
    "src/components/Hand/Hand.js",
    "src/components/Hand/PlayerHand.js",
    // Board components
    "src/components/Board/Board.js",
    "src/components/Board/GameTable.js",
    // Screen components
    "src/components/Login/LoginScreen.js",
    "src/components/Rooms/RoomsScreen.js",
    "src/components/Lobby/LobbyScreen.js",
    "src/components/Game/GameScreen.js",
    // Steam components
    "src/components/Steam/SteamFriends.js",
    "src/components/Steam/SteamStatus.js",
    // Game mechanic components
    "src/components/Game/Declaration.js",
    "src/components/Game/Challenge.js",
    "src/components/Game/GameControls.js",
    "src/components/Game/GameLog.js",
    // Common components
    "src/components/common/Button.js",
    "src/components/common/Modal.js",
    "src/components/common/Notification.js",
    "src/components/common/Header.js",
    "src/components/common/Loading.js",
  ];

  // Create all files
  const allFiles = [...rootFiles, ...publicFiles, ...steamFiles, ...srcFiles, ...contextFiles, ...serviceFiles, ...utilFiles, ...styleFiles, ...componentFiles];

  for (const file of allFiles) {
    createEmptyFile(path.join(fullProjectPath, file));
  }

  console.log("\nProject structure created successfully!");
  console.log("\nNext steps:");
  console.log("1. Fill the empty files with your existing code");
  console.log("2. Set up your package.json with the required dependencies");
  console.log("3. Run npm install to install dependencies");
  console.log("4. Use npm start to run the development server and Electron app");

  rl.close();
}

// Run the setup
setupProjectStructure().catch((err) => {
  console.error("Error setting up project structure:", err);
  process.exit(1);
});
