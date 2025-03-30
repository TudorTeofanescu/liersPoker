// Local storage utilities for LiersPoker
class StorageService {
  constructor() {
    this.storagePrefix = "lierspoker_";
    this.isAvailable = this.checkStorageAvailability();

    // Handle Steam Cloud if available
    this.steamCloud = window.utilities?.steam?.saveToCloud ? window.utilities.steam : null;
    this.isCloudAvailable = !!this.steamCloud;
  }

  // Check if localStorage is available
  checkStorageAvailability() {
    try {
      const testKey = `${this.storagePrefix}test`;
      localStorage.setItem(testKey, "test");
      const result = localStorage.getItem(testKey) === "test";
      localStorage.removeItem(testKey);
      return result;
    } catch (e) {
      return false;
    }
  }

  // Store data in localStorage
  set(key, value) {
    if (!this.isAvailable) {
      console.warn("Local storage is not available");
      return false;
    }

    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);

      // Also save to Steam Cloud if available
      this.saveToCloud(key, value);

      return true;
    } catch (error) {
      console.error(`Error storing data for key "${key}":`, error);
      return false;
    }
  }

  // Retrieve data from localStorage
  get(key, defaultValue = null) {
    if (!this.isAvailable) {
      console.warn("Local storage is not available");
      return defaultValue;
    }

    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      const value = localStorage.getItem(prefixedKey);

      if (value === null) {
        // If not in localStorage, try Steam Cloud
        return this.getFromCloud(key, defaultValue);
      }

      return JSON.parse(value);
    } catch (error) {
      console.error(`Error retrieving data for key "${key}":`, error);
      return defaultValue;
    }
  }

  // Remove data from localStorage
  remove(key) {
    if (!this.isAvailable) {
      console.warn("Local storage is not available");
      return false;
    }

    try {
      const prefixedKey = this.getKeyWithPrefix(key);
      localStorage.removeItem(prefixedKey);

      // Also remove from Steam Cloud if available
      this.removeFromCloud(key);

      return true;
    } catch (error) {
      console.error(`Error removing data for key "${key}":`, error);
      return false;
    }
  }

  // Clear all app-related data from localStorage
  clear() {
    if (!this.isAvailable) {
      console.warn("Local storage is not available");
      return false;
    }

    try {
      // Remove only items with our prefix
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.storagePrefix))
        .forEach((key) => localStorage.removeItem(key));

      // Also clear Steam Cloud if available
      this.clearCloud();

      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  }

  // Get all stored keys
  getAllKeys() {
    if (!this.isAvailable) {
      console.warn("Local storage is not available");
      return [];
    }

    try {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(this.storagePrefix))
        .map((key) => key.substring(this.storagePrefix.length));
    } catch (error) {
      console.error("Error getting all keys:", error);
      return [];
    }
  }

  // Add prefix to key for namespacing
  getKeyWithPrefix(key) {
    return `${this.storagePrefix}${key}`;
  }

  // Save data to Steam Cloud
  saveToCloud(key, value) {
    if (!this.isCloudAvailable) return false;

    try {
      const filename = `${key}.json`;
      const data = JSON.stringify(value);

      this.steamCloud.saveToCloud(filename, data).catch((error) => console.error(`Error saving to Steam Cloud for key "${key}":`, error));

      return true;
    } catch (error) {
      console.error(`Error saving to Steam Cloud for key "${key}":`, error);
      return false;
    }
  }

  // Get data from Steam Cloud
  async getFromCloud(key, defaultValue = null) {
    if (!this.isCloudAvailable) return defaultValue;

    try {
      const filename = `${key}.json`;

      try {
        const data = await this.steamCloud.loadFromCloud(filename);
        return JSON.parse(data);
      } catch (error) {
        console.log(`No data in Steam Cloud for key "${key}"`);
        return defaultValue;
      }
    } catch (error) {
      console.error(`Error loading from Steam Cloud for key "${key}":`, error);
      return defaultValue;
    }
  }

  // Remove from Steam Cloud
  removeFromCloud(key) {
    if (!this.isCloudAvailable) return false;

    try {
      const filename = `${key}.json`;
      // Steam cloud doesn't have a direct delete method,
      // but we can overwrite with empty data
      this.steamCloud.saveToCloud(filename, "{}").catch((error) => console.error(`Error removing from Steam Cloud for key "${key}":`, error));

      return true;
    } catch (error) {
      console.error(`Error removing from Steam Cloud for key "${key}":`, error);
      return false;
    }
  }

  // Clear Steam Cloud
  clearCloud() {
    if (!this.isCloudAvailable) return false;

    // Since we can't enumerate Steam Cloud files,
    // we need to clear based on known keys
    const knownKeys = this.getAllKeys();

    knownKeys.forEach((key) => {
      this.removeFromCloud(key);
    });

    return true;
  }

  // Store user preferences
  setUserPreferences(preferences) {
    return this.set("user_prefs", preferences);
  }

  // Get user preferences
  getUserPreferences() {
    return this.get("user_prefs", {
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      language: "en",
      cardTheme: "default",
      colorBlindMode: false,
    });
  }

  // Store game statistics
  setGameStats(stats) {
    return this.set("game_stats", stats);
  }

  // Get game statistics
  getGameStats() {
    return this.get("game_stats", {
      gamesPlayed: 0,
      gamesWon: 0,
      totalChallenges: 0,
      successfulChallenges: 0,
      cardsReceived: 0,
    });
  }

  // Update game statistics
  updateGameStats(update) {
    const currentStats = this.getGameStats();
    const newStats = { ...currentStats, ...update };
    return this.setGameStats(newStats);
  }

  // Store last used username
  setLastUsername(username) {
    return this.set("last_username", username);
  }

  // Get last used username
  getLastUsername() {
    return this.get("last_username", "");
  }

  // Add a room to recent rooms
  addRecentRoom(roomId, roomInfo) {
    // Get recent rooms, ensuring it's an array
    let recentRooms = this.getRecentRooms();

    // If recentRooms is not an array, initialize it as an empty array
    if (!Array.isArray(recentRooms)) {
      recentRooms = [];
    }

    // Remove if already exists
    const filteredRooms = recentRooms.filter((room) => room.id !== roomId);

    // Add to the beginning
    filteredRooms.unshift({
      id: roomId,
      timestamp: Date.now(),
      ...roomInfo,
    });

    // Keep only the 10 most recent
    const trimmedRooms = filteredRooms.slice(0, 10);

    return this.setRecentRooms(trimmedRooms);
  }

  // Store recent rooms
  setRecentRooms(rooms) {
    // Make sure rooms is an array before storing
    if (!Array.isArray(rooms)) {
      rooms = [];
    }
    return this.set("recent_rooms", rooms);
  }

  // Get recent rooms
  getRecentRooms() {
    const rooms = this.get("recent_rooms", []);
    // Return array even if storage returned something else
    return Array.isArray(rooms) ? rooms : [];
  }
}

// Create and export singleton instance
const storageService = new StorageService();
export default storageService;
