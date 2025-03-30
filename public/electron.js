const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const SteamGameManager = require("./steam/steamGameManager");

// Setup environment flags
const isDev = process.env.NODE_ENV === "development";
const mockSteam = isDev || process.env.MOCK_STEAM === "true";

// Initialize greenworks (real or mock)
let greenworks;
try {
  if (mockSteam) {
    console.log("Using mock Steam implementation for development/testing");
    greenworks = require("./steam/mock-greenworks");
  } else {
    greenworks = require("greenworks");

    if (!greenworks.init()) {
      console.log("Error initializing Greenworks - Steam may not be running");
      greenworks = null;
    } else {
      console.log("Greenworks initialized successfully");
    }
  }
} catch (e) {
  console.error("Failed to load Greenworks:", e);
  greenworks = null;

  if (!mockSteam) {
    console.log("Falling back to mock Steam implementation");
    try {
      greenworks = require("./steam/mock-greenworks");
    } catch (mockErr) {
      console.error("Failed to load mock Greenworks:", mockErr);
    }
  }
}

// Initialize Steam Game Manager
const steamGameManager = new SteamGameManager(greenworks);

// Set up IPC handlers for Steam game manager
ipcMain.handle("steam-game:create-room", (event, { hostId, hostName, options }) => {
  return steamGameManager.createRoom(hostId, hostName, options);
});

ipcMain.handle("steam-game:join-room", (event, { roomId, playerId, playerName }) => {
  return steamGameManager.joinRoom(roomId, playerId, playerName);
});

ipcMain.handle("steam-game:leave-room", (event, { playerId }) => {
  return steamGameManager.leaveRoom(playerId);
});

ipcMain.handle("steam-game:invite-friend", (event, { friendSteamId }) => {
  return steamGameManager.inviteFriend(friendSteamId);
});

ipcMain.handle("steam-game:queue", (event, { playerId, playerName, preferences }) => {
  return steamGameManager.addToQueue(playerId, playerName, preferences);
});

// Keep a global reference of the window objects
let mainWindow = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "LiersPoker",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html
  if (isDev) {
    // In development, connect to the dev server
    mainWindow.loadURL("http://localhost:3000");

    // Open DevTools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the bundled files
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "../build/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  // Expose Steam functionality to renderer process
  if (greenworks) {
    global.utilities = {
      isElectron: true,
      steamId: greenworks.getSteamId(),
      username: greenworks.getPersonaName(),
      isSteamAvailable: true,
    };
  } else {
    global.utilities = {
      isElectron: true,
      steamId: `dev-${Math.floor(Math.random() * 1000000)}`,
      username: "DevPlayer",
      isSteamAvailable: false,
    };
  }

  // Handle window closed event
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.on("ready", createWindow);

// Quit when all windows are closed
app.on("window-all-closed", function () {
  // On macOS it's common to keep the app open until explicitly quit
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for renderer communication
ipcMain.on("steamworks-request", (event, request) => {
  if (!greenworks) {
    event.reply("steamworks-response", {
      error: "Steam is not available",
      request,
    });
    return;
  }

  try {
    let response = { success: true, request };

    switch (request.action) {
      case "get-username":
        response.username = greenworks.getPersonaName();
        break;

      case "get-friends":
        response.friends = greenworks.getSteamFriends();
        break;

      case "activate-achievement":
        greenworks.activateAchievement(request.achievement, (err) => {
          if (err) {
            event.reply("steamworks-response", {
              error: err.message || "Failed to activate achievement",
              request,
            });
          } else {
            event.reply("steamworks-response", {
              success: true,
              request,
              achievement: request.achievement,
            });
          }
        });
        return;

      default:
        response.error = `Unknown action: ${request.action}`;
        response.success = false;
    }

    event.reply("steamworks-response", response);
  } catch (e) {
    event.reply("steamworks-response", {
      error: e.message || "Error processing Steam request",
      request,
    });
  }
});
