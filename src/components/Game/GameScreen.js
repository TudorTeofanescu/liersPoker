import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useSteam } from "../../contexts/SteamContext";
import Board from "../Board/Board";
import GameBoard from "../Game/GameBoard";
import DeclarationControls from "../Game/DeclarationControls";
import ChallengeControls from "../Game/ChallengeControls";
import "./GameScreen.css";

const GameScreen = () => {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();
  const { player, roomId, gameState, currentHand, currentPlayerId, actions } = useGame();
  const { soundEnabled, playSoundEffect, musicEnabled, playMusic, stopMusic, confirmActions } = useSettings();

  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [roundResult, setRoundResult] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Play game music if enabled
  useEffect(() => {
    if (musicEnabled) {
      playMusic("game_music");
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
      navigate(`/game/${roomId}`);
    } else if (!roomId) {
      // No room, go back to rooms screen
      navigate("/rooms");
    }
  }, [roomId, urlRoomId, navigate]);

  // Log game state for debugging purposes
  useEffect(() => {
    if (gameState) {
      console.log("Current game state:", gameState);
      console.log("Player ID:", player?.id);
      console.log("Hand in gameState:", gameState.hand);
    }
  }, [gameState, player]);

  // Set up socket listeners for game events
  useEffect(() => {
    if (window.socket) {
      window.socket.on("game:roundEnd", handleRoundEnd);
      window.socket.on("game:gameOver", handleGameOver);
      window.socket.on("room:chat", handleChatMessage);

      return () => {
        window.socket.off("game:roundEnd", handleRoundEnd);
        window.socket.off("game:gameOver", handleGameOver);
        window.socket.off("room:chat", handleChatMessage);
      };
    }
  }, []);

  // Handle round end event
  const handleRoundEnd = (data) => {
    if (soundEnabled) {
      playSoundEffect(data.success ? "challenge_success" : "challenge_fail");
    }

    setRoundResult({
      winner: data.winner,
      loser: data.loser,
      reason: data.reason,
      revelation: data.revelation || [],
      declarationType: data.declarationType,
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setRoundResult(null);
    }, 5000);
  };

  // Handle game over event
  const handleGameOver = (data) => {
    setGameEnded(true);

    if (soundEnabled) {
      playSoundEffect(data.winner === player.id ? "game_win" : "game_lose");
    }

    // Show game over modal
    setNotification({
      title: "Game Over",
      message: data.winner === player.id ? "Congratulations! You won the game!" : `Game over! ${data.winnerName || "Another player"} won the game.`,
      type: "info",
      autoHide: false,
    });
  };

  // Handle chat message
  const handleChatMessage = (data) => {
    if (soundEnabled && !chatVisible) {
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

  // Handle sending chat message
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

  // Handle declaration submission
  const handleDeclare = (handType, declaredCards) => {
    if (!handType || !declaredCards) return;

    const declaration = {
      type: handType,
      cards: declaredCards,
    };

    if (confirmActions) {
      setPendingAction({
        type: "declaration",
        data: declaration,
      });
      setShowConfirmation(true);
    } else {
      submitDeclaration(declaration);
    }
  };

  // Handle challenge action
  const handleChallenge = () => {
    if (confirmActions) {
      setPendingAction({
        type: "challenge",
        data: {},
      });
      setShowConfirmation(true);
    } else {
      submitChallenge();
    }
  };

  // Handle pass action
  const handlePass = () => {
    if (confirmActions) {
      setPendingAction({
        type: "pass",
        data: {},
      });
      setShowConfirmation(true);
    } else {
      submitPass();
    }
  };

  // Submit declaration to server
  const submitDeclaration = async (declaration) => {
    setError("");

    try {
      if (soundEnabled) {
        playSoundEffect("card_flip");
      }

      console.log("Submitting declaration:", declaration);

      const result = await actions.performGameAction("declaration", {
        handType: declaration.type,
        cards: declaration.cards,
      });

      if (!result.success) {
        setError(result.error || "Failed to submit declaration");
      }
    } catch (err) {
      console.error("Error submitting declaration:", err);
      setError("An unexpected error occurred");
    }
  };

  // Submit challenge to server
  const submitChallenge = async () => {
    setError("");

    try {
      if (soundEnabled) {
        playSoundEffect("challenge");
      }

      const result = await actions.performGameAction("challenge");

      if (!result.success) {
        setError(result.error || "Failed to submit challenge");
      }
    } catch (err) {
      console.error("Error submitting challenge:", err);
      setError("An unexpected error occurred");
    }
  };

  // Submit pass to server
  const submitPass = async () => {
    setError("");

    try {
      if (soundEnabled) {
        playSoundEffect("button_click");
      }

      const result = await actions.performGameAction("pass");

      if (!result.success) {
        setError(result.error || "Failed to pass");
      }
    } catch (err) {
      console.error("Error passing:", err);
      setError("An unexpected error occurred");
    }
  };

  // Handle confirmation dialog
  const handleConfirmAction = () => {
    setShowConfirmation(false);

    if (!pendingAction) return;

    const { type, data } = pendingAction;

    switch (type) {
      case "declaration":
        submitDeclaration(data);
        break;
      case "challenge":
        submitChallenge();
        break;
      case "pass":
        submitPass();
        break;
      default:
        break;
    }

    setPendingAction(null);
  };

  // Handle card selection
  const handleCardSelect = (cards) => {
    setSelectedCards(cards);
  };

  // Leave game and return to lobby
  const handleLeaveGame = async () => {
    try {
      navigate(`/lobby/${roomId}`);
    } catch (err) {
      console.error("Error leaving game:", err);
    }
  };

  // Get current game phase
  const getCurrentPhase = () => {
    return gameState?.phase || "waiting";
  };

  // Check if current player can make a declaration
  const canDeclare = () => {
    return gameState && getCurrentPhase() === "declaration" && gameState.currentPlayerId === player?.id;
  };

  // Check if current player can challenge
  const canChallenge = () => {
    return gameState && getCurrentPhase() === "challenge" && gameState.currentPlayerId !== player?.id;
  };

  // Get player name by ID
  const getPlayerName = (id) => {
    if (!gameState || !gameState.players) return id;

    const playerObj = gameState.players.find((p) => p.id === id);
    return playerObj ? playerObj.name : id === player?.id ? "You" : "Player";
  };

  // Toggle chat visibility
  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <h1>Liers Poker</h1>
        <div className="game-room-info">
          <span className="room-id">Room: {roomId}</span>
        </div>
        <div className="game-controls">
          <button className="chat-toggle-button" onClick={toggleChat}>
            {chatVisible ? "Hide Chat" : "Show Chat"}
          </button>
          <button className="leave-game-button" onClick={handleLeaveGame}>
            Leave Game
          </button>
        </div>
      </div>

      <div className="game-content">
        <div className={`game-main ${chatVisible ? "with-chat" : ""}`}>
          {gameState ? (
            <React.Fragment>
              {/* Main game board component */}
              <GameBoard
                gameState={gameState}
                players={gameState.players || []}
                currentPlayerId={player?.id}
                onDeclare={handleDeclare}
                onChallenge={handleChallenge}
                onPass={handlePass}
              />

              {/* Action controls - show based on game phase */}
              <div className="action-controls">
                {canDeclare() && <DeclarationControls currentDeclaration={gameState.currentDeclaration} onDeclare={handleDeclare} />}

                {canChallenge() && (
                  <ChallengeControls
                    currentDeclaration={gameState.currentDeclaration}
                    declaringPlayerId={gameState.currentPlayerId}
                    declaringPlayerName={getPlayerName(gameState.currentPlayerId)}
                    onChallenge={handleChallenge}
                    onPass={handlePass}
                  />
                )}
              </div>
            </React.Fragment>
          ) : (
            <div className="loading-game">
              <div className="loading-message">Loading game state...</div>
            </div>
          )}
        </div>

        {chatVisible && (
          <div className="game-chat">
            <div className="chat-header">
              <h3>Game Chat</h3>
              <button className="close-chat-button" onClick={toggleChat}>
                ×
              </button>
            </div>
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="chat-placeholder">No messages yet.</div>
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
        )}
      </div>

      {/* Round result overlay */}
      {roundResult && (
        <div className="round-result-overlay">
          <div className="round-result-container">
            <h2 className="result-title">Round Result</h2>
            <div className="result-content">
              <div className="challenge-result">
                <div className="result-player">{getPlayerName(roundResult.winner)}</div>
                <div className="result-outcome">{roundResult.winner === player?.id ? "won" : "wins"} the challenge!</div>
              </div>

              <div className="revelation-section">
                <h3>Cards Revealed:</h3>
                <div className="revealed-cards">
                  {roundResult.revelation.map((card, index) => (
                    <div key={index} className="revealed-card">
                      {card.rank} of {card.suit}
                    </div>
                  ))}
                </div>
              </div>

              <div className="challenge-explanation">{roundResult.reason}</div>
            </div>
            <button className="close-result-button" onClick={() => setRoundResult(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h2>Confirm Action</h2>
            <div className="confirmation-message">
              {pendingAction?.type === "declaration" && "Are you sure you want to make this declaration?"}
              {pendingAction?.type === "challenge" && "Are you sure you want to challenge? If you're wrong, you'll receive a card."}
              {pendingAction?.type === "pass" && "Are you sure you want to pass? The next player will make a declaration."}
            </div>
            <div className="confirmation-buttons">
              <button className="confirm-button" onClick={handleConfirmAction}>
                Confirm
              </button>
              <button className="cancel-button" onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification display */}
      {notification && (
        <div className="notification-overlay">
          <div className={`notification-container ${notification.type}`}>
            <h2 className="notification-title">{notification.title}</h2>
            <div className="notification-message">{notification.message}</div>
            {gameEnded && (
              <button className="back-to-lobby-button" onClick={handleLeaveGame}>
                Back to Lobby
              </button>
            )}
            {!gameEnded && (
              <button className="close-notification-button" onClick={() => setNotification(null)}>
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button className="close-error-button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
