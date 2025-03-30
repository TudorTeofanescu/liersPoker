// Steam Lobby Manager
// Handles Steam lobbies for LiersPoker game

class SteamLobbyManager {
  constructor(greenworks, gameManager) {
    this.greenworks = greenworks;
    this.gameManager = gameManager;
    this.isAvailable = !!greenworks;

    // Maps for lobby/room tracking
    this.steamLobbyMap = new Map(); // Maps Steam lobby IDs to room IDs
    this.roomToSteamMap = new Map(); // Maps room IDs to Steam lobby IDs
  }

  // Create a new Steam lobby for a room
  createSteamLobby(roomId, hostId, hostName, options = {}) {
    if (!this.isAvailable) return false;

    // LobbyType: 1 = private, 2 = friends only, 3 = public, 4 = invisible
    const lobbyType = options.isPrivate ? 1 : options.friendsOnly ? 2 : 3;
    const maxPlayers = options.maxPlayers || 4;

    this.greenworks.createLobby(lobbyType, maxPlayers, (err, steamLobbyId) => {
      if (err) {
        console.error("Failed to create Steam lobby:", err);
        return;
      }

      // Store mapping between Steam lobby and our room ID
      this.steamLobbyMap.set(steamLobbyId, roomId);
      this.roomToSteamMap.set(roomId, steamLobbyId);
      this.gameManager.activeSteamLobby = steamLobbyId;

      // Set metadata for the lobby
      this.greenworks.setLobbyData(steamLobbyId, "roomId", roomId);
      this.greenworks.setLobbyData(steamLobbyId, "hostName", hostName);
      this.greenworks.setLobbyData(steamLobbyId, "gameMode", options.gameMode || "standard");

      console.log(`Created Steam lobby ${steamLobbyId} for room ${roomId}`);
    });

    return true;
  }

  // Join a Steam lobby for a room
  joinSteamLobby(roomId) {
    if (!this.isAvailable) return false;

    const steamLobbyId = this.roomToSteamMap.get(roomId);
    if (!steamLobbyId) return false;

    this.greenworks.joinLobby(steamLobbyId, (err) => {
      if (err) {
        console.error(`Failed to join Steam lobby ${steamLobbyId}:`, err);
      } else {
        console.log(`Joined Steam lobby ${steamLobbyId} for room ${roomId}`);
        this.gameManager.activeSteamLobby = steamLobbyId;
      }
    });

    return true;
  }

  // Leave a Steam lobby
  leaveSteamLobby(steamLobbyId) {
    if (!this.isAvailable) return false;

    try {
      this.greenworks.leaveLobby(steamLobbyId);
      return true;
    } catch (err) {
      console.error(`Failed to leave Steam lobby ${steamLobbyId}:`, err);
      return false;
    }
  }

  // Update the status of a room's lobby
  updateLobbyStatus(roomId, status) {
    if (!this.isAvailable) return false;

    const steamLobbyId = this.roomToSteamMap.get(roomId);
    if (!steamLobbyId) return false;

    try {
      this.greenworks.setLobbyData(steamLobbyId, "status", status);
      return true;
    } catch (err) {
      console.error(`Failed to update lobby status for ${roomId}:`, err);
      return false;
    }
  }

  // Invite a friend to join a lobby
  inviteFriendToLobby(steamLobbyId, friendSteamId) {
    if (!this.isAvailable) return { success: false, error: "Steam not available" };

    try {
      this.greenworks.inviteFriendToLobby(steamLobbyId, friendSteamId, (err) => {
        if (err) {
          console.error(`Failed to invite friend ${friendSteamId}:`, err);
          return { success: false, error: err.message };
        } else {
          console.log(`Invited friend ${friendSteamId} to lobby ${steamLobbyId}`);
          return { success: true };
        }
      });

      return { success: true };
    } catch (err) {
      console.error(`Failed to invite friend ${friendSteamId}:`, err);
      return { success: false, error: err.message };
    }
  }

  // Accept an invite to join a lobby
  acceptInvite(inviteData) {
    if (!this.isAvailable) return { success: false, error: "Steam not available" };

    // Parse Steam connect string
    // Connect string format: +connect_lobby [lobbyId]
    const match = inviteData.connectString.match(/\+connect_lobby\s+(\d+)/);
    if (!match || !match[1]) {
      return { success: false, error: "Invalid invite data" };
    }

    const steamLobbyId = match[1];

    // Join the lobby
    this.greenworks.joinLobby(steamLobbyId, (err) => {
      if (err) {
        console.error(`Failed to join lobby ${steamLobbyId}:`, err);
        return { success: false, error: err.message };
      }

      console.log(`Joined lobby ${steamLobbyId} from invite`);
      return { success: true };
    });

    return { success: true, pending: true };
  }

  // Get a list of available public lobbies
  listPublicLobbies(callback) {
    if (!this.isAvailable) {
      callback({ success: false, error: "Steam not available" });
      return;
    }

    // Request lobby list from Steam
    this.greenworks.requestLobbyList(
      {
        distance: 3, // worldwide
        filters: [{ key: "status", value: "waiting", comparison: "=" }],
      },
      (err, lobbies) => {
        if (err) {
          console.error("Failed to get lobby list:", err);
          callback({ success: false, error: err.message });
          return;
        }

        // Convert Steam lobby data to room list
        const rooms = lobbies.map((lobby) => {
          const roomId = this.greenworks.getLobbyData(lobby, "roomId");
          const hostName = this.greenworks.getLobbyData(lobby, "hostName");
          const gameMode = this.greenworks.getLobbyData(lobby, "gameMode");
          const memberCount = this.greenworks.getLobbyMemberCount(lobby);
          const maxMembers = this.greenworks.getLobbyMemberLimit(lobby);

          return {
            roomId: roomId,
            steamLobbyId: lobby,
            hostName: hostName,
            gameMode: gameMode || "standard",
            players: memberCount,
            maxPlayers: maxMembers,
          };
        });

        callback({ success: true, rooms });
      }
    );
  }

  // Handle Steam lobby enter event
  handleLobbyEnter(steamLobbyId) {
    if (!this.isAvailable) return;

    // Get room ID from Steam lobby data
    const roomId = this.greenworks.getLobbyData(steamLobbyId, "roomId");
    if (!roomId) {
      console.error(`No room ID found in Steam lobby ${steamLobbyId}`);
      return;
    }

    this.gameManager.activeSteamLobby = steamLobbyId;
    this.gameManager.activeRoomId = roomId;

    // If the room doesn't exist locally, create it
    if (!this.gameManager.gameRooms.has(roomId)) {
      const hostName = this.greenworks.getLobbyData(steamLobbyId, "hostName") || "Host";
      const gameMode = this.greenworks.getLobbyData(steamLobbyId, "gameMode") || "standard";

      // Get lobby owner
      const lobbyOwner = this.greenworks.getLobbyOwner(steamLobbyId);

      const gameRoom = {
        id: roomId,
        hostId: lobbyOwner.getRawSteamID(),
        players: [],
        maxPlayers: this.greenworks.getLobbyMemberLimit(steamLobbyId),
        gameMode: gameMode,
        status: this.greenworks.getLobbyData(steamLobbyId, "status") || "waiting",
        game: null,
        created: Date.now(),
      };

      this.gameManager.gameRooms.set(roomId, gameRoom);
      this.steamLobbyMap.set(steamLobbyId, roomId);
      this.roomToSteamMap.set(roomId, steamLobbyId);
    }

    // Sync lobby members with room players
    this.syncLobbyMembers(steamLobbyId);
  }

  // Sync lobby members with room players
  syncLobbyMembers(steamLobbyId) {
    if (!this.isAvailable) return;

    const roomId = this.steamLobbyMap.get(steamLobbyId);
    if (!roomId) return;

    const room = this.gameManager.gameRooms.get(roomId);
    if (!room) return;

    // Get all Steam lobby members
    const lobbyMembers = this.greenworks.getLobbyMembers(steamLobbyId);

    // Update room players based on lobby members
    room.players = lobbyMembers.map((member) => {
      const steamId = member.getRawSteamID();
      const existingPlayer = room.players.find((p) => p.steamId === steamId);

      return {
        id: existingPlayer?.id || steamId,
        name: member.getPersonaName(),
        steamId: steamId,
      };
    });
  }

  // Sync lobby data with room state
  syncLobbyData(steamLobbyId) {
    if (!this.isAvailable) return;

    const roomId = this.steamLobbyMap.get(steamLobbyId);
    if (!roomId) return;

    const room = this.gameManager.gameRooms.get(roomId);
    if (!room) return;

    // Update room state based on lobby data
    room.status = this.greenworks.getLobbyData(steamLobbyId, "status") || room.status;
    room.gameMode = this.greenworks.getLobbyData(steamLobbyId, "gameMode") || room.gameMode;
  }

  // Handle player joined lobby event
  handlePlayerJoinedLobby(steamLobbyId, steamId) {
    if (!this.isAvailable) return;

    const roomId = this.steamLobbyMap.get(steamLobbyId);
    if (!roomId) return;

    const room = this.gameManager.gameRooms.get(roomId);
    if (!room) return;

    // Get player info from Steam
    const memberName = steamId.getPersonaName();
    const steamPlayerId = steamId.getRawSteamID();

    // Check if player is already in the room
    const existingPlayer = room.players.find((p) => p.steamId === steamPlayerId);
    if (existingPlayer) return;

    // Add player to room
    const newPlayer = {
      id: steamPlayerId,
      name: memberName,
      steamId: steamPlayerId,
    };

    room.players.push(newPlayer);
    this.gameManager.playerToRoomMap.set(steamPlayerId, roomId);

    // Trigger event
    this.gameManager.events.trigger("player-joined", { roomId, player: newPlayer });
  }

  // Handle player left lobby event
  handlePlayerLeftLobby(steamLobbyId, steamId) {
    if (!this.isAvailable) return;

    const roomId = this.steamLobbyMap.get(steamLobbyId);
    if (!roomId) return;

    const room = this.gameManager.gameRooms.get(roomId);
    if (!room) return;

    const steamPlayerId = steamId.getRawSteamID();

    // Find and remove player from room
    const playerIndex = room.players.findIndex((p) => p.steamId === steamPlayerId);
    if (playerIndex !== -1) {
      const player = room.players[playerIndex];
      room.players.splice(playerIndex, 1);
      this.gameManager.playerToRoomMap.delete(player.id);

      // Trigger event
      this.gameManager.events.trigger("player-left", { roomId, playerId: player.id });

      // If room is empty, clean up
      if (room.players.length === 0) {
        this.gameManager.gameRooms.delete(roomId);
        this.cleanupRoomMapping(roomId);
      } else {
        // If host left, assign new host
        if (player.id === room.hostId && room.players.length > 0) {
          room.hostId = room.players[0].id;
        }
      }
    }
  }

  // Clean up room mapping when a room is deleted
  cleanupRoomMapping(roomId) {
    const steamLobbyId = this.roomToSteamMap.get(roomId);
    if (steamLobbyId) {
      this.steamLobbyMap.delete(steamLobbyId);
      this.roomToSteamMap.delete(roomId);
    }
  }
}

module.exports = SteamLobbyManager;
