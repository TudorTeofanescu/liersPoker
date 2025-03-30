import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useSteam } from "../../contexts/SteamContext";
import { validateRoomCode, validateGameSettings } from "../../utils/validation";
import "./RoomsScreen.css";

const RoomsScreen = () => {
  const navigate = useNavigate();
  const { player, roomId, availableRooms, isLoadingRooms, queueStatus, actions } = useGame();
  const { soundEnabled, playSoundEffect } = useSettings();
  const { isAvailable: isSteamAvailable, friends, actions: steamActions } = useSteam();

  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Game settings for creating a room
  const [gameSettings, setGameSettings] = useState({
    maxPlayers: 4,
    gameMode: "standard",
    isPrivate: false,
    friendsOnly: false,
  });

  // Matchmaking settings
  const [matchmakingSettings, setMatchmakingSettings] = useState({
    queueType: "casual",
    playerCount: 4,
  });

  // Check if user is logged in
  useEffect(() => {
    if (!player) {
      navigate("/login");
    }
  }, [player, navigate]);

  // Check if already in a room
  useEffect(() => {
    if (roomId) {
      navigate(`/lobby/${roomId}`);
    }
  }, [roomId, navigate]);

  // Load rooms on mount and set refresh timer
  useEffect(() => {
    loadRooms();

    // Set up auto-refresh every 15 seconds
    const timer = setInterval(() => {
      loadRooms();
    }, 15000);

    setRefreshTimer(timer);

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []);

  // Load Steam friends if available
  useEffect(() => {
    if (isSteamAvailable && steamActions?.loadFriends) {
      setIsLoadingFriends(true);
      steamActions.loadFriends().finally(() => setIsLoadingFriends(false));
    }
  }, [isSteamAvailable, steamActions]);

  // Add a useEffect hook to check for direct join requests
  useEffect(() => {
    checkForDirectRoomJoin();
  }, []);
  // Function to handle direct room access by ID (from URL query parameter)
  const checkForDirectRoomJoin = () => {
    // Check if there's a room ID in the URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdParam = urlParams.get("roomId");

    if (roomIdParam) {
      // Clean and validate the room ID
      const cleanRoomId = roomIdParam.trim().toUpperCase();
      if (/^[A-Z0-9]{6}$/.test(cleanRoomId)) {
        console.log(`Direct room join requested for: ${cleanRoomId}`);

        // Set the room code input
        setRoomCode(cleanRoomId);

        // Automatically trigger joining after a short delay
        setTimeout(() => {
          handleJoinRoom({ preventDefault: () => {} });
        }, 500);

        // Clear the URL parameter to avoid rejoining on page refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  };
  const loadRooms = async () => {
    if (actions.loadRooms) {
      try {
        await actions.loadRooms();
      } catch (err) {
        console.error("Error loading rooms:", err);
      }
    }
  };

  const handleJoinRoom = async (event) => {
    event.preventDefault();

    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    // Validate room code
    const validation = validateRoomCode(roomCode);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const result = await actions.joinRoom(roomCode.toUpperCase());

      if (!result.success) {
        setError(result.error || "Failed to join room");
      }
    } catch (err) {
      console.error("Error joining room:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateRoom = async () => {
    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    // Validate game settings
    const validation = validateGameSettings(gameSettings);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const result = await actions.createRoom(gameSettings);

      if (!result.success) {
        setError(result.error || "Failed to create room");
      }
    } catch (err) {
      console.error("Error creating room:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinQueue = async () => {
    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    try {
      const result = await actions.joinQueue(matchmakingSettings.queueType, { playerCount: matchmakingSettings.playerCount });

      if (!result.success) {
        setError(result.error || "Failed to join matchmaking queue");
      }
    } catch (err) {
      console.error("Error joining queue:", err);
      setError("An unexpected error occurred");
    }
  };

  const handleLeaveQueue = async () => {
    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    try {
      await actions.leaveQueue();
    } catch (err) {
      console.error("Error leaving queue:", err);
    }
  };

  const handleInviteFriend = async (friendId) => {
    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    try {
      await steamActions.inviteFriend(friendId);
    } catch (err) {
      console.error("Error inviting friend:", err);
      setError("Failed to send invite");
    }
  };

  const handleRefreshRooms = () => {
    if (soundEnabled) {
      playSoundEffect("button_click");
    }
    loadRooms();
  };

  const toggleCreatePanel = () => {
    setShowCreate(!showCreate);
    setShowMatchmaking(false);
    setError("");
  };

  const toggleMatchmakingPanel = () => {
    setShowMatchmaking(!showMatchmaking);
    setShowCreate(false);
    setError("");
  };

  return (
    <div className="rooms-screen">
      <div className="rooms-container">
        <header className="rooms-header">
          <h1>Liers Poker</h1>
          <div className="user-info">
            <span className="username">{player?.name || ""}</span>
            {isSteamAvailable && <span className="steam-badge">Steam</span>}
          </div>
        </header>

        <div className="rooms-content">
          <div className="rooms-sidebar">
            <div className="sidebar-section">
              <h2>Play Options</h2>
              <div className="sidebar-buttons">
                <button className={`sidebar-button ${showCreate ? "active" : ""}`} onClick={toggleCreatePanel}>
                  Create Game
                </button>
                <button className={`sidebar-button ${showMatchmaking ? "active" : ""}`} onClick={toggleMatchmakingPanel}>
                  Matchmaking
                </button>
              </div>
            </div>

            <div className="sidebar-section">
              <h2>Join Game</h2>
              <form onSubmit={handleJoinRoom} className="join-form">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code"
                  className="room-code-input"
                  maxLength={6}
                />
                <button type="submit" className="join-button" disabled={isJoining || !roomCode.trim()}>
                  {isJoining ? "Joining..." : "Join"}
                </button>
              </form>
            </div>

            {isSteamAvailable && (
              <div className="sidebar-section">
                <h2>Steam Friends</h2>
                <div className="friends-list">
                  {isLoadingFriends ? (
                    <div className="loading-message">Loading friends...</div>
                  ) : friends?.length > 0 ? (
                    friends.map((friend) => (
                      <div key={friend.id} className="friend-item">
                        <span className="friend-name">{friend.name}</span>
                        <button className="invite-button" onClick={() => handleInviteFriend(friend.id)}>
                          Invite
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-friends-message">No online friends found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rooms-main">
            {showCreate && (
              <div className="create-panel">
                <h2>Create New Game</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Game Mode:</label>
                    <select value={gameSettings.gameMode} onChange={(e) => setGameSettings({ ...gameSettings, gameMode: e.target.value })}>
                      <option value="standard">Standard</option>
                      <option value="quick">Quick</option>
                      <option value="tournament">Tournament</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Max Players:</label>
                    <select value={gameSettings.maxPlayers} onChange={(e) => setGameSettings({ ...gameSettings, maxPlayers: parseInt(e.target.value) })}>
                      <option value="2">2 Players</option>
                      <option value="3">3 Players</option>
                      <option value="4">4 Players</option>
                      <option value="6">6 Players</option>
                      <option value="8">8 Players</option>
                    </select>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={gameSettings.isPrivate}
                        onChange={(e) => setGameSettings({ ...gameSettings, isPrivate: e.target.checked })}
                      />
                      Private Room
                    </label>
                  </div>

                  {isSteamAvailable && !gameSettings.isPrivate && (
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={gameSettings.friendsOnly}
                          onChange={(e) => setGameSettings({ ...gameSettings, friendsOnly: e.target.checked })}
                        />
                        Friends Only
                      </label>
                    </div>
                  )}

                  <button className="create-button" onClick={handleCreateRoom} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Game"}
                  </button>
                </div>
              </div>
            )}

            {showMatchmaking && (
              <div className="matchmaking-panel">
                <h2>Matchmaking</h2>

                {queueStatus.inQueue ? (
                  <div className="queue-status">
                    <div className="status-message">Searching for players...</div>
                    <div className="queue-info">
                      <div className="queue-type">
                        Queue: <span>{queueStatus.queueType || "Casual"}</span>
                      </div>
                      <div className="estimated-time">
                        Estimated wait: <span>{queueStatus.estimatedTime || "~"} seconds</span>
                      </div>
                      <div className="queue-position">
                        Position:{" "}
                        <span>
                          {queueStatus.queuePosition || "1"}/{queueStatus.queueSize || "1"}
                        </span>
                      </div>
                    </div>
                    <button className="cancel-queue-button" onClick={handleLeaveQueue}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="matchmaking-form">
                    <div className="form-group">
                      <label>Queue Type:</label>
                      <select
                        value={matchmakingSettings.queueType}
                        onChange={(e) =>
                          setMatchmakingSettings({
                            ...matchmakingSettings,
                            queueType: e.target.value,
                          })
                        }
                      >
                        <option value="casual">Casual</option>
                        <option value="ranked">Ranked</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Players:</label>
                      <select
                        value={matchmakingSettings.playerCount}
                        onChange={(e) =>
                          setMatchmakingSettings({
                            ...matchmakingSettings,
                            playerCount: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value="2">2 Players</option>
                        <option value="4">4 Players</option>
                        <option value="6">6 Players</option>
                      </select>
                    </div>

                    <button className="queue-button" onClick={handleJoinQueue}>
                      Find Match
                    </button>
                  </div>
                )}
              </div>
            )}

            {!showCreate && !showMatchmaking && (
              <div className="rooms-list-container">
                <div className="rooms-list-header">
                  <h2>Available Rooms</h2>
                  <button className="refresh-button" onClick={handleRefreshRooms} disabled={isLoadingRooms}>
                    {isLoadingRooms ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {isLoadingRooms ? (
                  <div className="loading-rooms">Loading available rooms...</div>
                ) : availableRooms && availableRooms.length > 0 ? (
                  <div className="rooms-list">
                    {availableRooms.map((room) => (
                      <div key={room.roomId} className="room-item">
                        <div className="room-info">
                          <div className="room-host">{room.name}'s Room</div>
                          <div className="room-details">
                            <span className="room-mode">{room.gameMode}</span>
                            <span className="room-players">
                              {room.players}/{room.maxPlayers}
                            </span>
                            {room.isFriendsOnly && <span className="room-friends-only">Friends Only</span>}
                          </div>
                        </div>
                        <div className="room-actions">
                          <div className="room-code">{room.roomId}</div>
                          <button
                            className="join-room-button"
                            onClick={() => {
                              setRoomCode(room.roomId);
                              handleJoinRoom({ preventDefault: () => {} });
                            }}
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-rooms-message">No rooms available. Create a new game or try again later.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsScreen;
