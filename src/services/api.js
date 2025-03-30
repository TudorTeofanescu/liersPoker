// API service for LiersPoker
import socketService from "./socket";

class ApiService {
  constructor() {
    this.isConnected = socketService.isSocketConnected();
    this.currentPlayer = null;
    this.currentRoom = null;

    // Listen for connection changes
    if (socketService.socket) {
      socketService.on("connect", () => {
        this.isConnected = true;
      });

      socketService.on("disconnect", () => {
        this.isConnected = false;
      });
    }
  }

  // Initialize the API service
  async initialize() {
    try {
      // Only connect if not already connected
      if (!this.isConnected) {
        await socketService.connect();
        this.isConnected = true;
      }
      return true;
    } catch (error) {
      console.error("Failed to initialize API service:", error);
      this.isConnected = false;
      return false;
    }
  }

  // Ensure socket is connected before operations
  async ensureConnection() {
    if (!this.isConnected) {
      return this.initialize();
    }
    return true;
  }

  // Register a new player
  async registerPlayer(name, steamId = null) {
    await this.ensureConnection();

    try {
      const response = await socketService.emitAsync("player:register", { name, steamId });

      if (response.success) {
        this.currentPlayer = response.player;
      }

      return response;
    } catch (error) {
      console.error("Error registering player:", error);
      return { success: false, error: error.message || "Failed to register player" };
    }
  }

  // Get the current registered player
  getPlayer() {
    return this.currentPlayer;
  }

  // List available game rooms
  async listRooms() {
    await this.ensureConnection();

    try {
      return await socketService.emitAsync("room:list", {});
    } catch (error) {
      console.error("Error listing rooms:", error);
      return { success: false, error: error.message || "Failed to list rooms" };
    }
  }

  // Create a new game room
  async createRoom(options = {}) {
    await this.ensureConnection();

    try {
      const response = await socketService.emitAsync("room:create", options);

      if (response.success) {
        this.currentRoom = {
          id: response.roomId,
          ...response.room,
        };
      }

      return response;
    } catch (error) {
      console.error("Error creating room:", error);
      return { success: false, error: error.message || "Failed to create room" };
    }
  }

  // Join an existing game room
  async joinRoom(roomId) {
    await this.ensureConnection();

    try {
      const response = await socketService.emitAsync("room:join", { roomId });

      if (response.success) {
        this.currentRoom = {
          id: roomId,
          ...response.room,
        };
      }

      return response;
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error);
      return { success: false, error: error.message || "Failed to join room" };
    }
  }

  // Leave the current room
  async leaveRoom() {
    if (!this.isConnected) {
      this.currentRoom = null;
      return { success: true };
    }

    try {
      const response = await socketService.emitAsync("room:leave", {});

      if (response.success) {
        this.currentRoom = null;
      }

      return response;
    } catch (error) {
      console.error("Error leaving room:", error);
      return { success: false, error: error.message || "Failed to leave room" };
    }
  }

  // Start a game in the current room
  async startGame() {
    await this.ensureConnection();

    if (!this.currentRoom) {
      return { success: false, error: "Not in a room" };
    }

    try {
      return await socketService.emitAsync("game:start", { roomId: this.currentRoom.id });
    } catch (error) {
      console.error("Error starting game:", error);
      return { success: false, error: error.message || "Failed to start game" };
    }
  }

  // Perform a game action (declaration, challenge, etc.)
  async gameAction(action, params = {}) {
    await this.ensureConnection();

    try {
      return await socketService.emitAsync("game:action", {
        action,
        ...params,
      });
    } catch (error) {
      console.error(`Error performing game action ${action}:`, error);
      return { success: false, error: error.message || "Failed to perform action" };
    }
  }

  // Steam friends functionality
  async getSteamFriends() {
    await this.ensureConnection();

    try {
      return await socketService.emitAsync("steam:get-friends", {});
    } catch (error) {
      console.error("Error getting Steam friends:", error);
      return { success: false, error: error.message || "Failed to get Steam friends" };
    }
  }

  // Invite a Steam friend to play
  async inviteSteamFriend(friendId) {
    await this.ensureConnection();

    try {
      return await socketService.emitAsync("steam:invite-friend", { friendId });
    } catch (error) {
      console.error(`Error inviting Steam friend ${friendId}:`, error);
      return { success: false, error: error.message || "Failed to invite friend" };
    }
  }

  // Add the player to matchmaking queue
  async joinMatchmaking(queueType = "casual", preferences = {}) {
    await this.ensureConnection();

    try {
      return await socketService.emitAsync("matchmaking:join-queue", {
        queueType,
        preferences,
      });
    } catch (error) {
      console.error("Error joining matchmaking queue:", error);
      return { success: false, error: error.message || "Failed to join matchmaking queue" };
    }
  }

  // Remove the player from matchmaking queue
  async leaveMatchmaking() {
    if (!this.isConnected) {
      return { success: true };
    }

    try {
      return await socketService.emitAsync("matchmaking:leave-queue", {});
    } catch (error) {
      console.error("Error leaving matchmaking queue:", error);
      return { success: false, error: error.message || "Failed to leave matchmaking queue" };
    }
  }

  // Send a chat message
  async sendChatMessage(message) {
    if (!this.isConnected || !message.trim()) {
      return { success: false, error: "Not connected or invalid message" };
    }

    try {
      socketService.emit("room:chat", { message: message.trim() });
      return { success: true };
    } catch (error) {
      console.error("Error sending chat message:", error);
      return { success: false, error: error.message || "Failed to send message" };
    }
  }

  // Register for game-related notifications
  registerNotificationHandlers(handlers = {}) {
    // Ensure the socket exists first
    if (!socketService.socket) {
      console.warn("Cannot register notification handlers: Socket not initialized");
      return false;
    }

    // Room events
    if (handlers.onPlayerJoined) {
      socketService.on("room:playerJoined", handlers.onPlayerJoined);
    }

    if (handlers.onPlayerLeft) {
      socketService.on("room:playerLeft", handlers.onPlayerLeft);
    }

    if (handlers.onHostChanged) {
      socketService.on("room:hostChanged", handlers.onHostChanged);
    }

    // Game events
    if (handlers.onGameStarted) {
      socketService.on("game:started", handlers.onGameStarted);
    }

    if (handlers.onGameUpdate) {
      socketService.on("game:update", handlers.onGameUpdate);
    }

    if (handlers.onRoundEnd) {
      socketService.on("game:roundEnd", handlers.onRoundEnd);
    }

    if (handlers.onGameOver) {
      socketService.on("game:over", handlers.onGameOver);
    }

    // Matchmaking events
    if (handlers.onMatchFound) {
      socketService.on("matchmaking:match-found", handlers.onMatchFound);
    }

    if (handlers.onQueueUpdate) {
      socketService.on("matchmaking:queue-update", handlers.onQueueUpdate);
    }

    // Steam events
    if (handlers.onSteamInvite) {
      socketService.on("steam:invite-received", handlers.onSteamInvite);
    }

    // Chat events
    if (handlers.onChatMessage) {
      socketService.on("room:chat", handlers.onChatMessage);
    }

    // Connection events
    if (handlers.onDisconnect) {
      socketService.on("disconnect", handlers.onDisconnect);
    }

    if (handlers.onReconnect) {
      socketService.on("reconnect", handlers.onReconnect);
    }

    return true;
  }

  // Unregister notification handlers
  unregisterNotificationHandlers(eventNames = []) {
    if (!socketService.socket) return;

    if (eventNames.length === 0) {
      // Default events to unregister if none specified
      eventNames = [
        "room:playerJoined",
        "room:playerLeft",
        "room:hostChanged",
        "game:started",
        "game:update",
        "game:roundEnd",
        "game:over",
        "matchmaking:match-found",
        "matchmaking:queue-update",
        "steam:invite-received",
        "room:chat",
        "disconnect",
        "reconnect",
      ];
    }

    eventNames.forEach((eventName) => {
      socketService.off(eventName);
    });
  }

  // Check server status - Direct API endpoint version
  async checkServerStatus() {
    try {
      // Try to use direct API endpoint if available
      const response = await fetch("/api/status");
      return await response.json();
    } catch (error) {
      // Fallback to socket connection status
      return {
        status: this.isConnected ? "online" : "offline",
        error: error.message,
      };
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected;
  }

  // Get current room info
  getCurrentRoom() {
    return this.currentRoom;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
