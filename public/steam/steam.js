// Steam API integration using greenworks
// This is a utility class for direct Steam API interactions

class SteamIntegration {
  constructor() {
    this.initialized = false;
    this.greenworks = null;

    try {
      // Try to load the real greenworks
      this.greenworks = require("greenworks");
      this.initialized = this.greenworks.initAPI();
      console.log(`Steam API initialized: ${this.initialized}`);
    } catch (err) {
      console.error("Error initializing Steam API:", err);

      // Try to load the mock version
      try {
        this.greenworks = require("./mock-greenworks");
        this.initialized = true;
        console.log("Using Steam API mock implementation");
      } catch (mockErr) {
        console.error("Failed to load mock Steam API:", mockErr);
      }
    }
  }

  // Check if Steam is initialized
  isInitialized() {
    return this.initialized;
  }

  // Get the current user's Steam ID
  getSteamId() {
    if (!this.initialized) return null;
    return this.greenworks.getSteamId();
  }

  // Get the current user's display name
  getPersonaName() {
    if (!this.initialized) return "Unknown Player";
    return this.greenworks.getPersonaName();
  }

  // Get the current user's Steam friends
  getFriends() {
    if (!this.initialized) return Promise.reject(new Error("Steam not initialized"));
    return new Promise((resolve, reject) => {
      try {
        const friends = this.greenworks.getFriends(this.greenworks.FriendFlags.Immediate);
        resolve(friends);
      } catch (err) {
        console.error("Error getting friends:", err);
        reject(err);
      }
    });
  }

  // Create a new lobby
  createLobby(lobbyType = 2, maxMembers = 4) {
    if (!this.initialized) return Promise.reject(new Error("Steam not initialized"));
    return new Promise((resolve, reject) => {
      this.greenworks.createLobby(
        lobbyType,
        maxMembers,
        (lobbyID) => {
          console.log(`Lobby created: ${lobbyID}`);
          resolve(lobbyID);
        },
        (err) => {
          console.error("Error creating lobby:", err);
          reject(err);
        }
      );
    });
  }

  // Join an existing lobby
  joinLobby(lobbyId) {
    if (!this.initialized) return Promise.reject(new Error("Steam not initialized"));
    return new Promise((resolve, reject) => {
      this.greenworks.joinLobby(
        lobbyId,
        (lobby) => {
          console.log(`Joined lobby: ${lobbyId}`);
          resolve(lobby);
        },
        (err) => {
          console.error("Error joining lobby:", err);
          reject(err);
        }
      );
    });
  }

  // Leave the current lobby
  leaveLobby(lobbyId) {
    if (!this.initialized) return false;
    try {
      this.greenworks.leaveLobby(lobbyId);
      return true;
    } catch (err) {
      console.error("Error leaving lobby:", err);
      return false;
    }
  }

  // Set data on a lobby
  setLobbyData(lobbyId, key, value) {
    if (!this.initialized) return false;
    try {
      return this.greenworks.setLobbyData(lobbyId, key, value);
    } catch (err) {
      console.error(`Error setting lobby data (${key}=${value}):`, err);
      return false;
    }
  }

  // Get data from a lobby
  getLobbyData(lobbyId, key) {
    if (!this.initialized) return null;
    try {
      return this.greenworks.getLobbyData(lobbyId, key);
    } catch (err) {
      console.error(`Error getting lobby data (${key}):`, err);
      return null;
    }
  }

  // Invite a friend to a lobby
  inviteFriend(steamId, lobbyId) {
    if (!this.initialized) return Promise.reject(new Error("Steam not initialized"));
    return new Promise((resolve, reject) => {
      try {
        this.greenworks.inviteUserToLobby(lobbyId, steamId);
        console.log(`Invited friend ${steamId} to lobby ${lobbyId}`);
        resolve();
      } catch (err) {
        console.error("Error inviting friend to lobby:", err);
        reject(err);
      }
    });
  }

  // Unlock an achievement
  unlockAchievement(achievementName) {
    if (!this.initialized) return Promise.reject(new Error("Steam not initialized"));
    return new Promise((resolve, reject) => {
      this.greenworks.activateAchievement(
        achievementName,
        () => {
          console.log(`Achievement unlocked: ${achievementName}`);
          resolve();
        },
        (err) => {
          console.error(`Error unlocking achievement ${achievementName}:`, err);
          reject(err);
        }
      );
    });
  }

  // Save data to the Steam Cloud
  saveToCloud(filename, data) {
    if (!this.initialized) return Promise.reject(new Error("Steam not initialized"));
    return new Promise((resolve, reject) => {
      this.greenworks.saveTextToFile(
        filename,
        data,
        () => {
          console.log(`Saved to Steam Cloud: ${filename}`);
          resolve();
        },
        (err) => {
          console.error("Error saving to Steam Cloud:", err);
          reject(err);
        }
      );
    });
  }

  // Load data from the Steam Cloud
  loadFromCloud(filename) {
    if (!this.initialized) return Promise.reject(new Error("Steam not initialized"));
    return new Promise((resolve, reject) => {
      this.greenworks.readTextFromFile(
        filename,
        (content) => {
          console.log(`Loaded from Steam Cloud: ${filename}`);
          resolve(content);
        },
        (err) => {
          console.error("Error loading from Steam Cloud:", err);
          reject(err);
        }
      );
    });
  }

  // Get statistics about Steam availability
  getStats() {
    return {
      initialized: this.initialized,
      username: this.initialized ? this.getPersonaName() : null,
      steamId: this.initialized ? this.getSteamId()?.getRawSteamID() : null,
      isMock: this.initialized && this.greenworks.constructor.name !== "Object",
    };
  }
}

// Export as a singleton
module.exports = new SteamIntegration();
