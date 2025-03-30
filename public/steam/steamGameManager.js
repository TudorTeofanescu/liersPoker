// Steam Game Manager for LiersPoker
// This component bridges your game logic with Steam services
const SteamLobbyManager = require("./steamLobbyManager");
const SteamEventEmitter = require("./steamEventEmitter");
const SteamMatchmaking = require("./steamMatchmaking");

class SteamGameManager {
  constructor(greenworks) {
    this.greenworks = greenworks;
    this.isAvailable = !!greenworks;
    this.activeSteamLobby = null;
    this.activeRoomId = null;

    // Initialize component managers
    this.lobbyManager = new SteamLobbyManager(greenworks, this);
    this.matchmaking = new SteamMatchmaking(greenworks, this);
    this.events = new SteamEventEmitter();

    // Maps and collections
    this.gameRooms = new Map(); // Maps room IDs to game instances
    this.playerToRoomMap = new Map(); // Maps player IDs to room IDs

    // Initialize Steam event listeners if available
    if (this.isAvailable) {
      this.initSteamCallbacks();
    }
  }

  // Initialize Steam callbacks
  initSteamCallbacks() {
    if (!this.isAvailable) return;

    // Listen for Steam lobby events
    this.greenworks.on("lobby-created", (lobbyId) => {
      console.log(`Steam lobby created: ${lobbyId}`);
      this.events.trigger("lobby-created", lobbyId);
    });

    this.greenworks.on("lobby-joined", (lobbyId) => {
      console.log(`Steam lobby joined: ${lobbyId}`);
      this.events.trigger("lobby-joined", lobbyId);
    });

    this.greenworks.on("lobby-enter", (lobbyId, response) => {
      console.log(`Entered Steam lobby: ${lobbyId}, response: ${response}`);
      this.lobbyManager.handleLobbyEnter(lobbyId);
    });

    this.greenworks.on("lobby-data-update", (lobbyId, memberId, success) => {
      console.log(`Lobby data updated: ${lobbyId}`);
      this.lobbyManager.syncLobbyData(lobbyId);
    });

    this.greenworks.on("lobby-chat-update", (lobbyId, memberId, memberStateChange, chatterActedOn, makingChangeIsSelf) => {
      if (memberStateChange === 1) {
        // EChatMemberStateChange.Entered
        this.lobbyManager.handlePlayerJoinedLobby(lobbyId, memberId);
      } else if (memberStateChange === 2) {
        // Left
        this.lobbyManager.handlePlayerLeftLobby(lobbyId, memberId);
      }
    });

    this.greenworks.on("game-invite", (steamId, connectString) => {
      console.log(`Game invite received from ${steamId}`);
      this.events.trigger("invite-received", { steamId, connectString });
    });
  }

  // Create a new game room with Steam integration
  createRoom(hostId, hostName, options = {}) {
    const roomId = this.generateRoomId();

    // If Steam is available, create a Steam lobby
    if (this.isAvailable) {
      this.lobbyManager.createSteamLobby(roomId, hostId, hostName, options);
    }

    // Create local room
    const gameRoom = {
      id: roomId,
      hostId: hostId,
      players: [
        {
          id: hostId,
          name: hostName,
          steamId: this.isAvailable ? this.greenworks.getSteamId().getRawSteamID() : null,
        },
      ],
      maxPlayers: options.maxPlayers || 4,
      gameMode: options.gameMode || "standard",
      status: "waiting", // waiting, playing, finished
      game: null,
      created: Date.now(),
    };

    this.gameRooms.set(roomId, gameRoom);
    this.playerToRoomMap.set(hostId, roomId);
    this.activeRoomId = roomId;

    return { roomId, room: gameRoom };
  }

  // Join an existing room
  joinRoom(roomId, playerId, playerName) {
    const room = this.gameRooms.get(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.status !== "waiting") {
      return { success: false, error: "Game already in progress" };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: "Room is full" };
    }

    // Add player to room
    room.players.push({
      id: playerId,
      name: playerName,
      steamId: this.isAvailable ? this.greenworks.getSteamId().getRawSteamID() : null,
    });

    this.playerToRoomMap.set(playerId, roomId);

    // If Steam is available, join the Steam lobby
    if (this.isAvailable) {
      this.lobbyManager.joinSteamLobby(roomId);
    }

    return { success: true, room: room };
  }

  // Leave a room
  leaveRoom(playerId) {
    const roomId = this.playerToRoomMap.get(playerId);
    if (!roomId) return false;

    const room = this.gameRooms.get(roomId);
    if (!room) return false;

    // Remove player from room
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      this.playerToRoomMap.delete(playerId);

      // If Steam is available, leave the Steam lobby
      if (this.isAvailable && this.activeSteamLobby) {
        this.lobbyManager.leaveSteamLobby(this.activeSteamLobby);
        this.activeSteamLobby = null;
      }

      // If room is empty, clean up
      if (room.players.length === 0) {
        this.gameRooms.delete(roomId);
        this.lobbyManager.cleanupRoomMapping(roomId);
      } else {
        // If host left, assign new host
        if (playerId === room.hostId && room.players.length > 0) {
          room.hostId = room.players[0].id;
        }
      }

      if (this.activeRoomId === roomId) {
        this.activeRoomId = null;
      }

      return true;
    }

    return false;
  }

  // Start a game in a room
  startGame(roomId, hostId) {
    const room = this.gameRooms.get(roomId);
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.hostId !== hostId) {
      return { success: false, error: "Only the host can start the game" };
    }

    if (room.players.length < 2) {
      return { success: false, error: "Need at least 2 players" };
    }

    // Create a new game instance - this would be replaced with your actual game logic class
    // const game = new TrombonPokerGame(room.players.map(p => p.id));
    const game = { status: "playing", started: Date.now() }; // Placeholder
    room.game = game;
    room.status = "playing";

    // If Steam is available, update lobby data
    if (this.isAvailable) {
      this.lobbyManager.updateLobbyStatus(roomId, "playing");
    }

    return { success: true, gameState: game };
  }

  // Queue management for matchmaking
  addToQueue(playerId, playerName, preferences = {}) {
    return this.matchmaking.addPlayerToQueue(playerId, playerName, preferences);
  }

  // Remove from queue
  removeFromQueue(playerId) {
    return this.matchmaking.removePlayerFromQueue(playerId);
  }

  // Invite a friend to play
  inviteFriend(friendSteamId) {
    if (!this.isAvailable) {
      return { success: false, error: "Steam not available" };
    }

    if (!this.activeSteamLobby) {
      // Create a new lobby first
      const playerName = this.greenworks.getPersonaName();
      const { roomId } = this.createRoom(this.greenworks.getSteamId().getRawSteamID(), playerName);

      // Wait for lobby creation to complete
      this.events.on("lobby-created", (steamLobbyId) => {
        this.lobbyManager.inviteFriendToLobby(steamLobbyId, friendSteamId);
      });

      return { success: true, pending: true };
    } else {
      // Invite to existing lobby
      return this.lobbyManager.inviteFriendToLobby(this.activeSteamLobby, friendSteamId);
    }
  }

  // Accept a game invite
  acceptInvite(inviteData) {
    if (!this.isAvailable) {
      return { success: false, error: "Steam not available" };
    }

    return this.lobbyManager.acceptInvite(inviteData);
  }

  // List available public lobbies
  listPublicLobbies(callback) {
    if (!this.isAvailable) {
      callback({ success: false, error: "Steam not available" });
      return;
    }

    this.lobbyManager.listPublicLobbies(callback);
  }

  // Generate a random room ID
  generateRoomId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let roomId = "";
    for (let i = 0; i < 6; i++) {
      roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomId;
  }

  // Event subscription system
  on(event, callback) {
    this.events.on(event, callback);
    return this; // For chaining
  }

  // Remove event listener
  off(event, callback) {
    this.events.off(event, callback);
    return this;
  }
}

module.exports = SteamGameManager;
