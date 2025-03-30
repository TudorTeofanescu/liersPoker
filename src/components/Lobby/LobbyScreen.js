import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useSteam } from "../../contexts/SteamContext";
import "./LobbyScreen.css";

const LobbyScreen = () => {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();
  const { player, roomId, isHost, roomPlayers, actions } = useGame();
  const { soundEnabled, playSoundEffect, musicEnabled, playMusic, stopMusic } = useSettings();
  const { isAvailable: isSteamAvailable, friends, actions: steamActions } = useSteam();

  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showInvites, setShowInvites] = useState(false);
  const [gameSettings, setGameSettings] = useState({});
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(null);

  // Play lobby music if enabled
  useEffect(() => {
    if (musicEnabled) {
      playMusic("lobby_music");
    }

    return () => {
      if (musicEnabled) {
        stopMusic();
      }
    };
  }, [musicEnabled, playMusic, stopMusic]);

  // Verify player is logged in
  useEffect(() => {
    if (!player) {
      navigate("/login");
    }
  }, [player, navigate]);

  // Verify room ID match
  useEffect(() => {
    if (roomId && urlRoomId && roomId !== urlRoomId) {
      navigate(`/lobby/${roomId}`);
    } else if (!roomId && urlRoomId) {
      // Try to join the room in the URL
      handleJoinRoom(urlRoomId);
    } else if (!roomId && !urlRoomId) {
      // No room, go back to rooms screen
      navigate("/rooms");
    }
  }, [roomId, urlRoomId, navigate]);

  // Set up socket listeners for chat
  useEffect(() => {
    if (window.socket) {
      window.socket.on("room:chat", handleChatMessage);

      return () => {
        window.socket.off("room:chat", handleChatMessage);
      };
    }
  }, []);

  // Fetch game settings when room is joined
  useEffect(() => {
    if (roomId) {
      fetchGameSettings();
    }
  }, [roomId]);

  const fetchGameSettings = async () => {
    // This would typically be an API call or socket event
    // For now, let's use a mock implementation
    setGameSettings({
      gameMode: "standard",
      maxPlayers: 4,
      initialCards: 2,
      eliminationThreshold: 6,
    });
  };

  const handleJoinRoom = async (targetRoomId) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await actions.joinRoom(targetRoomId);

      if (!result.success) {
        setError(result.error || "Failed to join room");
        setTimeout(() => {
          navigate("/rooms");
        }, 2000);
      }
    } catch (err) {
      console.error("Error joining room:", err);
      setError("An unexpected error occurred");
      setTimeout(() => {
        navigate("/rooms");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    try {
      await actions.leaveRoom();
      navigate("/rooms");
    } catch (err) {
      console.error("Error leaving room:", err);
      setError("Failed to leave room");
    }
  };

  const handleStartGame = async () => {
    if (!isHost) return;

    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    setIsStarting(true);
    setError("");

    try {
      // Start countdown
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown("GO!");

      // Start the game
      const result = await actions.startGame();

      if (result.success) {
        if (soundEnabled) {
          playSoundEffect("game_start");
        }

        // Navigation to game screen happens automatically through socket event
      } else {
        setError(result.error || "Failed to start game");
        setCountdown(null);
      }
    } catch (err) {
      console.error("Error starting game:", err);
      setError("An unexpected error occurred");
      setCountdown(null);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!chatMessage.trim()) return;

    if (window.socket) {
      window.socket.emit("room:chat", {
        message: chatMessage.trim(),
      });

      // Add local message
      const newMessage = {
        sender: player.name,
        text: chatMessage.trim(),
        timestamp: Date.now(),
        isLocal: true,
      };

      setChatMessages((prev) => [...prev, newMessage]);
      setChatMessage("");
    }
  };

  const handleChatMessage = (data) => {
    if (soundEnabled) {
      playSoundEffect("chat_message");
    }

    setChatMessages((prev) => [
      ...prev,
      {
        sender: data.sender,
        text: data.message,
        timestamp: data.timestamp || Date.now(),
        isLocal: false,
      },
    ]);
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

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      if (soundEnabled) {
        playSoundEffect("button_click");
      }
    });
  };

  const toggleInvitePanel = () => {
    setShowInvites(!showInvites);
  };

  // Render player list with status indicators
  const renderPlayerList = () => {
    return (
      <div className="players-list">
        <h3>
          Players ({roomPlayers.length}/{gameSettings.maxPlayers || 4})
        </h3>
        <div className="player-entries">
          {roomPlayers.map((roomPlayer) => (
            <div key={roomPlayer.id} className="player-entry">
              <div className="player-name">
                {roomPlayer.name || `Player ${roomPlayer.id}`}
                {roomPlayer.id === player?.id && <span className="self-indicator"> (You)</span>}
                {isHost && roomPlayer.id === player?.id && <span className="host-badge">Host</span>}
              </div>
              <div className="player-status">
                <span className="status-indicator ready"></span>
                Ready
              </div>
            </div>
          ))}

          {/* Placeholder slots for empty positions */}
          {Array(Math.max(0, (gameSettings.maxPlayers || 4) - roomPlayers.length))
            .fill()
            .map((_, index) => (
              <div key={`empty-${index}`} className="player-entry empty">
                <div className="player-name">Waiting for player...</div>
                <div className="player-status">
                  <span className="status-indicator empty"></span>
                  Empty
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Render game settings information
  const renderGameSettings = () => {
    return (
      <div className="game-settings">
        <h3>Game Settings</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-label">Game Mode:</div>
            <div className="setting-value">{gameSettings.gameMode || "Standard"}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">Initial Cards:</div>
            <div className="setting-value">{gameSettings.initialCards || 2}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">Elimination at:</div>
            <div className="setting-value">{gameSettings.eliminationThreshold || 6}+ cards</div>
          </div>
          <div className="setting-item">
            <div className="setting-label">Max Players:</div>
            <div className="setting-value">{gameSettings.maxPlayers || 4}</div>
          </div>
        </div>
      </div>
    );
  };

  // Render chat area
  const renderChat = () => {
    return (
      <div className="chat-container">
        <h3>Game Chat</h3>
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-placeholder">Messages will appear here. Be respectful and have fun!</div>
          ) : (
            chatMessages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.isLocal ? "local" : ""}`}>
                <span className="message-sender">{msg.sender}:</span>
                <span className="message-text">{msg.text}</span>
              </div>
            ))
          )}
        </div>
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Type a message..." className="chat-input" />
          <button type="submit" className="send-button" disabled={!chatMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    );
  };

  // Main render
  return (
    <div className="lobby-screen">
      <div className="lobby-container">
        <header className="lobby-header">
          <h1>Game Lobby</h1>
          <div className="room-info">
            <div className="room-code-container">
              <span className="room-code-label">Room Code:</span>
              <span className="room-code">{roomId}</span>
              <button className="copy-button" onClick={copyRoomCode} title="Copy Room Code">
                📋
              </button>
            </div>
            <div className="host-info">Host: {roomPlayers.find((p) => (isHost && p.id === player?.id) || !isHost)?.name || "Unknown"}</div>
          </div>
        </header>

        <div className="lobby-content">
          <div className="lobby-main">
            {renderPlayerList()}
            {renderGameSettings()}

            <div className="lobby-actions">
              {isHost ? (
                <button className="start-game-button" onClick={handleStartGame} disabled={isStarting || roomPlayers.length < 2}>
                  {isStarting ? "Starting..." : "Start Game"}
                </button>
              ) : (
                <div className="waiting-message">Waiting for host to start the game...</div>
              )}

              <button className="leave-room-button" onClick={handleLeaveRoom}>
                Leave Room
              </button>
            </div>
          </div>

          <div className="lobby-sidebar">
            {renderChat()}

            {isSteamAvailable && (
              <div className="invite-section">
                <button className="toggle-invites-button" onClick={toggleInvitePanel}>
                  {showInvites ? "Hide Friends" : "Invite Friends"}
                </button>

                {showInvites && (
                  <div className="friends-list">
                    {friends && friends.length > 0 ? (
                      friends.map((friend) => (
                        <div key={friend.id} className="friend-item">
                          <span className="friend-name">{friend.name}</span>
                          <button className="invite-friend-button" onClick={() => handleInviteFriend(friend.id)}>
                            Invite
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="no-friends-message">No online friends available</div>
                    )}
                  </div>
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

        {countdown && (
          <div className="countdown-overlay">
            <div className="countdown-value">{countdown}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyScreen;
