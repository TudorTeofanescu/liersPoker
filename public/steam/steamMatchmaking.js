// Steam Matchmaking System
// Handles player queuing and matchmaking for LiersPoker

class SteamMatchmaking {
  constructor(greenworks, gameManager) {
    this.greenworks = greenworks;
    this.gameManager = gameManager;
    this.isAvailable = !!greenworks;

    // Matchmaking queue
    this.queuedPlayers = [];
  }

  // Add a player to the matchmaking queue
  addPlayerToQueue(playerId, playerName, preferences = {}) {
    // Remove player from any existing room
    this.gameManager.leaveRoom(playerId);

    // Check if player is already in queue
    const existingIndex = this.queuedPlayers.findIndex((p) => p.id === playerId);
    if (existingIndex !== -1) {
      this.queuedPlayers.splice(existingIndex, 1);
    }

    // Add player to queue with timestamp and preferences
    this.queuedPlayers.push({
      id: playerId,
      name: playerName,
      steamId: this.isAvailable ? this.greenworks.getSteamId().getRawSteamID() : null,
      joinedAt: Date.now(),
      preferences: preferences,
    });

    // Trigger queue update event
    this.gameManager.events.trigger("queue-updated", this.queuedPlayers);

    // Try to match players
    this.processMatchmaking();

    return { success: true, queuePosition: this.queuedPlayers.length };
  }

  // Remove a player from the matchmaking queue
  removePlayerFromQueue(playerId) {
    const index = this.queuedPlayers.findIndex((p) => p.id === playerId);
    if (index !== -1) {
      this.queuedPlayers.splice(index, 1);
      this.gameManager.events.trigger("queue-updated", this.queuedPlayers);
      return true;
    }
    return false;
  }

  // Process the matchmaking queue to form games
  processMatchmaking() {
    if (this.queuedPlayers.length < 2) return;

    // Very basic matchmaking - just grab players in batches
    // You could implement more sophisticated matchmaking based on
    // skill levels, preferences, etc.

    // Try to form groups of 4 (or fewer if enough time has passed)
    while (this.queuedPlayers.length >= 2) {
      const now = Date.now();
      let groupSize = 4;

      // Check wait times to potentially start with fewer players
      const waitTimes = this.queuedPlayers.slice(0, 4).map((p) => now - p.joinedAt);
      const maxWait = Math.max(...waitTimes);

      // If anyone has waited more than 30 seconds, start with 2 or 3 players
      if (maxWait > 30000 && this.queuedPlayers.length >= 2) {
        groupSize = Math.min(groupSize, this.queuedPlayers.length);
      } else if (this.queuedPlayers.length < 4) {
        // Not enough players and nobody has waited long enough
        break;
      }

      // Create a match with these players
      const matchedPlayers = this.queuedPlayers.splice(0, groupSize);

      // Create a room for this match
      const hostPlayer = matchedPlayers[0];
      const { roomId, room } = this.gameManager.createRoom(hostPlayer.id, hostPlayer.name);

      // Add remaining players to the room
      for (let i = 1; i < matchedPlayers.length; i++) {
        const player = matchedPlayers[i];
        this.gameManager.joinRoom(roomId, player.id, player.name);
      }

      // Notify all players that a match has been found
      matchedPlayers.forEach((player) => {
        this.gameManager.events.trigger("player-joined", { roomId, player });
      });

      // If Steam is available, update lobby data
      if (this.isAvailable) {
        const steamLobbyId = this.gameManager.lobbyManager.roomToSteamMap.get(roomId);
        if (steamLobbyId) {
          this.greenworks.setLobbyData(steamLobbyId, "matchmade", "true");
        }
      }
    }
  }

  // Calculate estimated matchmaking time based on queue length and time of day
  calculateEstimatedWaitTime() {
    // Base time in seconds
    let baseTime = 30;

    // Adjust based on queue length
    if (this.queuedPlayers.length > 0) {
      // More players = shorter wait
      baseTime = Math.max(10, baseTime - this.queuedPlayers.length * 5);
    } else {
      // Empty queue = longer wait
      baseTime = 60;
    }

    // Adjust for time of day (simple example)
    const hour = new Date().getHours();
    // Peak hours: 7pm-11pm (19-23) get shorter times
    if (hour >= 19 && hour <= 23) {
      baseTime = Math.max(5, baseTime - 15);
    }
    // Off-peak hours: 2am-6am (2-6) get longer times
    else if (hour >= 2 && hour <= 6) {
      baseTime += 30;
    }

    return baseTime;
  }

  // Get current matchmaking statistics
  getMatchmakingStats() {
    return {
      playersInQueue: this.queuedPlayers.length,
      estimatedWaitTime: this.calculateEstimatedWaitTime(),
      isActive: this.queuedPlayers.length > 0,
    };
  }
}

module.exports = SteamMatchmaking;
