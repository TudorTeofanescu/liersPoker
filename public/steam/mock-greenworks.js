// Mock implementation of Greenworks for development without Steam
const EventEmitter = require("events");
console.log("Using mock Greenworks implementation for development");

class MockGreenworks extends EventEmitter {
  constructor() {
    super(); // Initialize EventEmitter functionality

    this._isSteamRunning = false;
    this._steamId = "MOCK_STEAM_ID_" + Math.floor(Math.random() * 1000000);
    this._username = "DevPlayer";
    this._friends = [];

    // Mock lobbies and data
    this._activeLobbies = new Map();
    this._lobbyData = new Map();
  }

  // Core functionality
  init() {
    console.log("Mock Greenworks initialized");
    this._isSteamRunning = true;
    return true;
  }

  getSteamId() {
    return {
      getRawSteamID: () => this._steamId,
      getAccountID: () => "123456",
      getAccountType: () => 1,
      getUniverse: () => 1,
      isValid: () => true,
    };
  }

  getAppId() {
    return 480; // Use a placeholder app ID
  }

  restartAppIfNecessary(appId) {
    console.log(`Mock restart app if necessary: ${appId}`);
    return false;
  }

  isSteamRunning() {
    return this._isSteamRunning;
  }

  // Friends and social
  getFriends() {
    // Return mock friend objects
    return [
      {
        getRawSteamID: () => "MOCK_FRIEND_1",
        getPersonaName: () => "MockFriend1",
        getState: () => 1, // Online
      },
      {
        getRawSteamID: () => "MOCK_FRIEND_2",
        getPersonaName: () => "MockFriend2",
        getState: () => 2, // Busy
      },
      {
        getRawSteamID: () => "MOCK_FRIEND_3",
        getPersonaName: () => "MockFriend3",
        getState: () => 0, // Offline
      },
    ];
  }

  getPersonaName() {
    return this._username;
  }

  // Lobby functions
  createLobby(lobbyType, maxMembers, callback) {
    const lobbyId = `mock_lobby_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Store lobby info
    this._activeLobbies.set(lobbyId, {
      type: lobbyType,
      maxMembers: maxMembers,
      members: [],
      owner: this.getSteamId(),
    });

    // Initialize lobby data store
    this._lobbyData.set(lobbyId, new Map());

    // Emit the created event
    setTimeout(() => {
      this.emit("lobby-created", lobbyId);
      if (callback) callback(null, lobbyId);
    }, 100);

    return true;
  }

  joinLobby(lobbyId, callback) {
    if (!this._activeLobbies.has(lobbyId)) {
      if (callback) callback(new Error("Lobby not found"));
      return false;
    }

    const lobby = this._activeLobbies.get(lobbyId);
    const steamId = this.getSteamId();

    // Add to members if not already there
    if (!lobby.members.some((m) => m.getRawSteamID() === steamId.getRawSteamID())) {
      lobby.members.push(steamId);
    }

    // Emit events
    setTimeout(() => {
      this.emit("lobby-joined", lobbyId);
      this.emit("lobby-enter", lobbyId, 1);
      if (callback) callback(null);
    }, 100);

    return true;
  }

  leaveLobby(lobbyId) {
    if (!this._activeLobbies.has(lobbyId)) {
      return false;
    }

    const lobby = this._activeLobbies.get(lobbyId);
    const steamId = this.getSteamId();

    // Remove from members
    lobby.members = lobby.members.filter((m) => m.getRawSteamID() !== steamId.getRawSteamID());

    // If empty, remove the lobby
    if (lobby.members.length === 0) {
      this._activeLobbies.delete(lobbyId);
      this._lobbyData.delete(lobbyId);
    } else if (lobby.owner.getRawSteamID() === steamId.getRawSteamID()) {
      // Assign new owner if the leaving player was the owner
      lobby.owner = lobby.members[0];
    }

    // Emit leave event
    this.emit("lobby-chat-update", lobbyId, steamId, 2, null, false);

    return true;
  }

  getLobbyData(lobbyId, key) {
    if (!this._lobbyData.has(lobbyId)) return "";
    return this._lobbyData.get(lobbyId).get(key) || "";
  }

  setLobbyData(lobbyId, key, value) {
    if (!this._lobbyData.has(lobbyId)) {
      this._lobbyData.set(lobbyId, new Map());
    }

    this._lobbyData.get(lobbyId).set(key, value);

    // Emit data update event
    setTimeout(() => {
      this.emit("lobby-data-update", lobbyId, this.getSteamId(), true);
    }, 100);

    return true;
  }

  getLobbyOwner(lobbyId) {
    if (!this._activeLobbies.has(lobbyId)) return null;
    return this._activeLobbies.get(lobbyId).owner;
  }

  getLobbyMembers(lobbyId) {
    if (!this._activeLobbies.has(lobbyId)) return [];
    return this._activeLobbies.get(lobbyId).members;
  }

  getLobbyMemberLimit(lobbyId) {
    if (!this._activeLobbies.has(lobbyId)) return 0;
    return this._activeLobbies.get(lobbyId).maxMembers;
  }

  inviteFriendToLobby(lobbyId, friendSteamId, callback) {
    console.log(`Mock invite friend ${friendSteamId} to lobby ${lobbyId}`);

    setTimeout(() => {
      // Simulate invite sent
      this.emit("game-invite", friendSteamId, `+connect_lobby ${lobbyId}`);
      if (callback) callback(null);
    }, 100);

    return true;
  }

  // Stats and achievements
  activateAchievement(achievement_name, callback) {
    console.log(`Mock achievement activated: ${achievement_name}`);
    if (callback) callback(null);
  }

  getAchievement(achievement_name, callback) {
    if (callback) callback(null, false);
  }

  clearAchievement(achievement_name, callback) {
    console.log(`Mock achievement cleared: ${achievement_name}`);
    if (callback) callback(null);
  }

  // Cloud functionality
  saveTextToFile(file_name, text, callback) {
    console.log(`Mock save text to file: ${file_name}`);
    if (callback) callback(null);
  }

  readTextFromFile(file_name, callback) {
    console.log(`Mock read text from file: ${file_name}`);
    if (callback) callback(null, "{}");
  }

  // Utils for the mock
  setFriends(friends) {
    this._friends = friends;
  }

  setUsername(username) {
    this._username = username;
  }
}

// Create and export the mock instance
const mockGreenworks = new MockGreenworks();
mockGreenworks.init();

module.exports = mockGreenworks;
