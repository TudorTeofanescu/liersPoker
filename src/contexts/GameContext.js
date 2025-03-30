import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import socketService from "../services/socket";
import storageService from "../services/storage";

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const navigate = useNavigate(); // This is now safe because it's inside a Router context

  // State management
  const [activeScreen, setActiveScreen] = useState("login");
  const [player, setPlayer] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  // Game state
  const [gameState, setGameState] = useState(null);
  const [gamePhase, setGamePhase] = useState(null);
  const [currentHand, setCurrentHand] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [dealerId, setDealerId] = useState(null);
  const [currentDeclaration, setCurrentDeclaration] = useState(null);
  const [lastChallenger, setLastChallenger] = useState(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameLogs, setGameLogs] = useState([]);

  // Matchmaking state
  const [queueStatus, setQueueStatus] = useState({
    inQueue: false,
    queueType: null,
    estimatedTime: 0,
    queuePosition: 0,
    queueSize: 0,
  });
  const [mmr, setMmr] = useState(1000);

  // Initialize socket connection when component mounts
  useEffect(() => {
    // Establish socket connection if not already connected
    if (!socketService.isSocketConnected()) {
      socketService.connect().catch((error) => {
        console.error("Failed to connect to game server:", error);
      });
    }

    // Clean up on unmount
    return () => {
      // We don't disconnect here as the socket might be used by other components
    };
  }, []);

  // Set up event listeners when player is registered
  useEffect(() => {
    if (player && socketService.isSocketConnected()) {
      // Player joined event
      socketService.on("room:playerJoined", (data) => {
        console.log("Player joined:", data);
        if (data.allPlayers) {
          // Use the complete player list from the server
          setRoomPlayers(data.allPlayers);
        } else {
          // Fallback to adding just the new player
          setRoomPlayers((prev) => {
            // Check if player already exists
            if (prev.some((p) => p.id === data.player.id)) {
              return prev;
            }
            return [...prev, data.player];
          });
        }
      });

      // Player left event
      socketService.on("room:playerLeft", (data) => {
        console.log("Player left:", data);
        setRoomPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
      });

      // Host changed event
      socketService.on("room:hostChanged", (data) => {
        console.log("Host changed:", data);
        setIsHost(data.newHostId === player.id);
      });

      // Game started event
      socketService.on("game:started", (data) => {
        console.log("Game started:", data);
        setGameState(data.gameState);
        setGamePhase(data.gameState.phase);

        // Important: Check if there's a hand property and it has actual card data
        if (data.gameState.hand && Array.isArray(data.gameState.hand)) {
          console.log("Setting initial hand data:", data.gameState.hand);
          // Make sure we're storing the hand with proper card structure
          setCurrentHand(
            data.gameState.hand.map((card) => ({
              id: card.id || `player_card_${Math.random().toString(36).substring(2, 9)}`,
              rank: card.rank,
              suit: card.suit,
            }))
          );
        } else {
          // Reset hand if no data available
          console.log("No hand data available in game:started event");
          setCurrentHand([]);
        }

        setCurrentPlayerId(data.gameState.currentPlayerId);
        setDealerId(data.gameState.dealerPlayerId);
        setRoundNumber(data.gameState.roundNumber || 1);
        setGameLogs(data.gameState.logs || []);
        navigate(`/game/${roomId}`);
      });

      // Game update event
      socketService.on("game:update", (data) => {
        console.log("Game update received:", data);
        setGameState(data.gameState);
        setGamePhase(data.gameState.phase);

        // Important: Check if there's a hand property and it has actual card data
        if (data.gameState.hand && Array.isArray(data.gameState.hand)) {
          console.log("Setting hand data:", data.gameState.hand);
          // Make sure we're storing the hand with proper card structure
          setCurrentHand(
            data.gameState.hand.map((card) => ({
              id: card.id || `player_card_${Math.random().toString(36).substring(2, 9)}`,
              rank: card.rank,
              suit: card.suit,
            }))
          );
        }

        setCurrentPlayerId(data.gameState.currentPlayerId);
        setDealerId(data.gameState.dealerPlayerId);
        setCurrentDeclaration(data.gameState.currentDeclaration);
        setLastChallenger(data.gameState.lastChallenger);
        setRoundNumber(data.gameState.roundNumber || 1);
        setGameLogs(data.gameState.logs || []);
      });

      // Game over event
      socketService.on("game:over", (data) => {
        console.log("Game over:", data);
        // Update game statistics
        const stats = storageService.getGameStats();
        const newStats = {
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: player.id === data.winnerId ? stats.gamesWon + 1 : stats.gamesWon,
        };
        storageService.setGameStats(newStats);
      });

      // Round end event
      socketService.on("game:roundEnd", (data) => {
        console.log("Round ended:", data);
        // You can add specific logic here for round end events
      });

      // Match found event
      socketService.on("matchmaking:match-found", (data) => {
        console.log("Match found:", data);
        setQueueStatus({
          inQueue: false,
          queueType: null,
          estimatedTime: 0,
          queuePosition: 0,
          queueSize: 0,
        });
        setRoomId(data.roomId);
        setRoomPlayers(data.players || []);
        navigate(`/lobby/${data.roomId}`);
      });

      // Queue update event
      socketService.on("matchmaking:queue-update", (data) => {
        console.log("Queue update:", data);
        setQueueStatus({
          inQueue: true,
          queueType: data.queueType || queueStatus.queueType,
          estimatedTime: data.estimatedTime || 0,
          queuePosition: data.position || 1,
          queueSize: data.queueSize || 1,
        });
      });

      // Room status changed event
      socketService.on("room:statusChanged", (data) => {
        console.log("Room status changed:", data);
        if (data.status === "waiting") {
          // Reset game state
          setGameState(null);
          setGamePhase(null);
          setCurrentHand([]);
          setCurrentDeclaration(null);

          // Navigate back to lobby
          navigate(`/lobby/${roomId}`);
        }
      });

      // Disconnect and reconnect handlers
      socketService.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socketService.on("reconnect", () => {
        console.log("Reconnected to server, re-authenticating...");
        // Re-authenticate on reconnection
        if (player) {
          apiService.registerPlayer(player.name, player.steamId);
        }

        // Rejoin room if in a room
        if (roomId) {
          apiService.joinRoom(roomId);
        }
      });
    }

    return () => {
      // Clean up when player changes
      if (socketService.isSocketConnected()) {
        socketService.off("room:playerJoined");
        socketService.off("room:playerLeft");
        socketService.off("room:hostChanged");
        socketService.off("game:started");
        socketService.off("game:update");
        socketService.off("game:over");
        socketService.off("game:roundEnd");
        socketService.off("matchmaking:match-found");
        socketService.off("matchmaking:queue-update");
        socketService.off("room:statusChanged");
        socketService.off("disconnect");
        socketService.off("reconnect");
      }
    };
  }, [player, roomId, navigate, queueStatus.queueType]);

  // Join a room by ID (directly)
  const joinRoomById = async (roomIdToJoin) => {
    if (!roomIdToJoin) {
      return { success: false, error: "Room ID is required" };
    }

    // Validate room ID format
    if (!/^[A-Z0-9]{6}$/.test(roomIdToJoin)) {
      return { success: false, error: "Invalid room ID format. Room IDs must be 6 alphanumeric characters." };
    }

    // Clean up any existing room connection
    if (roomId) {
      await leaveRoom();
    }

    // Attempt to join the room
    const result = await joinRoom(roomIdToJoin);
    return result;
  };

  // Register player with server
  const registerPlayer = async (name, steamId = null) => {
    try {
      // Ensure socket is connected
      if (!socketService.isSocketConnected()) {
        await socketService.connect();
      }

      const result = await apiService.registerPlayer(name, steamId);

      if (result.success) {
        setPlayer(result.player);
        storageService.setLastUsername(name);

        // Track MMR if available
        if (result.player.mmr) {
          setMmr(result.player.mmr);
        }

        // Navigate to rooms screen after successful registration
        navigate("/rooms");
      }

      return result;
    } catch (error) {
      console.error("Error registering player:", error);
      return { success: false, error: error.message || "Failed to register player" };
    }
  };

  // Create a new room
  const createRoom = async (options = {}) => {
    try {
      const result = await apiService.createRoom(options);

      if (result.success) {
        setRoomId(result.roomId);
        setIsHost(true);
        setRoomPlayers([player]);

        // Save to recent rooms
        storageService.addRecentRoom(result.roomId, {
          name: player.name + "'s Room",
          mode: options.gameMode || "standard",
        });

        // Navigate to lobby
        navigate(`/lobby/${result.roomId}`);
      }

      return result;
    } catch (error) {
      console.error("Error creating room:", error);
      return { success: false, error: error.message || "Failed to create room" };
    }
  };

  // Join an existing room
  const joinRoom = async (targetRoomId) => {
    try {
      // Normalize the room code by removing "ROOM-" prefix if present
      const normalizedRoomId = targetRoomId.replace(/^ROOM-/, "");

      const result = await apiService.joinRoom(normalizedRoomId);

      if (result.success) {
        setRoomId(normalizedRoomId);
        setIsHost(result.isHost || false);
        setRoomPlayers(result.players || [player]);

        // Save to recent rooms
        storageService.addRecentRoom(normalizedRoomId, {
          name: result.name || "Game Room",
          mode: result.gameMode || "standard",
        });

        // Navigate to lobby
        navigate(`/lobby/${normalizedRoomId}`);
      }

      return result;
    } catch (error) {
      console.error("Error joining room:", error);
      return { success: false, error: error.message || "Failed to join room" };
    }
  };

  // Leave the current room
  const leaveRoom = async () => {
    try {
      const result = await apiService.leaveRoom();

      if (result.success) {
        setRoomId(null);
        setIsHost(false);
        setRoomPlayers([]);
        setGameState(null);
        setGamePhase(null);
        setCurrentHand([]);

        // Navigate back to rooms screen
        navigate("/rooms");
      }

      return result;
    } catch (error) {
      console.error("Error leaving room:", error);
      return { success: false, error: error.message || "Failed to leave room" };
    }
  };

  // Load available rooms
  const loadRooms = async () => {
    setIsLoadingRooms(true);

    try {
      const result = await apiService.listRooms();

      if (result.success) {
        setAvailableRooms(result.rooms || []);
      }

      return result;
    } catch (error) {
      console.error("Error loading rooms:", error);
      return { success: false, error: error.message || "Failed to load rooms" };
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Start a game
  const startGame = async () => {
    try {
      const result = await apiService.startGame();
      return result;
    } catch (error) {
      console.error("Error starting game:", error);
      return { success: false, error: error.message || "Failed to start game" };
    }
  };

  // Perform game action
  const performGameAction = async (action, params = {}) => {
    try {
      const result = await apiService.gameAction(action, params);

      // Update local stats for certain actions
      if (result.success) {
        // Track challenge statistics
        if (action === "challenge") {
          const stats = storageService.getGameStats();
          storageService.updateGameStats({
            totalChallenges: stats.totalChallenges + 1,
          });

          if (result.challengeSuccess) {
            storageService.updateGameStats({
              successfulChallenges: stats.successfulChallenges + 1,
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error(`Error performing game action ${action}:`, error);
      return { success: false, error: error.message || "Failed to perform action" };
    }
  };

  // Join matchmaking queue
  const joinQueue = async (queueType = "casual", preferences = {}) => {
    try {
      const result = await apiService.joinMatchmaking(queueType, preferences);

      if (result.success) {
        setQueueStatus({
          inQueue: true,
          queueType,
          estimatedTime: result.estimatedTime || 0,
          queuePosition: result.position || 1,
          queueSize: result.queueSize || 1,
        });
      }

      return result;
    } catch (error) {
      console.error("Error joining queue:", error);
      return { success: false, error: error.message || "Failed to join matchmaking queue" };
    }
  };

  // Leave matchmaking queue
  const leaveQueue = async () => {
    try {
      const result = await apiService.leaveMatchmaking();

      if (result.success) {
        setQueueStatus({
          inQueue: false,
          queueType: null,
          estimatedTime: 0,
          queuePosition: 0,
          queueSize: 0,
        });
      }

      return result;
    } catch (error) {
      console.error("Error leaving queue:", error);
      return { success: false, error: error.message || "Failed to leave matchmaking queue" };
    }
  };

  // Send chat message
  const sendChatMessage = async (message) => {
    if (!socketService.isSocketConnected() || !message.trim()) {
      return { success: false };
    }

    try {
      socketService.emit("room:chat", { message: message.trim() });
      return { success: true };
    } catch (error) {
      console.error("Error sending chat message:", error);
      return { success: false, error: error.message };
    }
  };

  const contextValue = {
    // Screen state
    activeScreen,
    setActiveScreen,

    // Player and room state
    player,
    roomId,
    isHost,
    roomPlayers,
    availableRooms,
    isLoadingRooms,

    // Game state
    gameState,
    gamePhase,
    currentHand, // Make sure this is included
    currentPlayerId,
    dealerId,
    currentDeclaration,
    lastChallenger,
    roundNumber,
    gameLogs,

    // Matchmaking state
    queueStatus,
    mmr,

    // Actions
    actions: {
      registerPlayer,
      createRoom,
      joinRoom,
      leaveRoom,
      loadRooms,
      startGame,
      performGameAction,
      joinQueue,
      leaveQueue,
      joinRoomById,
      sendChatMessage,
    },
  };

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export default GameContext;
