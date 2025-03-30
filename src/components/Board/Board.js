import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GameTable from "./GameTable";
import { useGame } from "../../contexts/GameContext";
import { useSettings } from "../../contexts/SettingsContext";
import "./Board.css";

/**
 * Game board component that coordinates the entire game display
 */
const Board = ({ players, currentPlayerId, roundNumber, phase }) => {
  const { gameState, actions } = useGame();
  const { tableColor, showAnimations, showTimer } = useSettings();
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [activePlayerId, setActivePlayerId] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // Set up timer when active player changes
  useEffect(() => {
    if (gameState && gameState.currentPlayerId) {
      setActivePlayerId(gameState.currentPlayerId);

      // Reset timer
      if (showTimer) {
        setTimeRemaining(60);
        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [gameState?.currentPlayerId, showTimer]);

  // Update logs when they change
  useEffect(() => {
    if (gameState && gameState.logs) {
      setRecentLogs(gameState.logs.slice(-5)); // Show the 5 most recent logs
    }
  }, [gameState?.logs]);

  // Handle phase transitions
  useEffect(() => {
    if (phase === "result") {
      setShowResults(true);

      // Auto-hide results after 3 seconds
      const hideTimer = setTimeout(() => {
        setShowResults(false);
      }, 3000);

      return () => clearTimeout(hideTimer);
    } else {
      setShowResults(false);
    }
  }, [phase]);

  // Handle player actions
  const handlePlayerAction = (action, data) => {
    setLastAction({
      playerId: currentPlayerId,
      action,
      data,
    });

    // Send action to game context
    if (actions && actions.performGameAction) {
      actions.performGameAction(action, data);
    }
  };

  // Get player positions based on number of players
  const getPlayerPositions = () => {
    const playerCount = players.length;
    const positions = [];

    // Position calculation for different player counts
    if (playerCount <= 2) {
      positions.push("bottom", "top");
    } else if (playerCount <= 4) {
      positions.push("bottom", "left", "top", "right");
    } else if (playerCount <= 6) {
      positions.push("bottom", "bottom-left", "left", "top", "right", "bottom-right");
    } else {
      positions.push("bottom", "bottom-left", "left", "top-left", "top", "top-right", "right", "bottom-right");
    }

    return positions.slice(0, playerCount);
  };

  // Get player information with positions
  const getPositionedPlayers = () => {
    const positions = getPlayerPositions();
    return players.map((player, index) => ({
      ...player,
      position: positions[index] || "spectator",
    }));
  };

  // Timer display formatting
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="board-container" style={{ backgroundColor: `${tableColor}40` }}>
      {/* Game information bar */}
      <div className="game-info-bar">
        <div className="game-phase">
          <span className="label">Phase:</span>
          <span className="value">{phase}</span>
        </div>

        <div className="round-info">
          <span className="label">Round:</span>
          <span className="value">{roundNumber}</span>
        </div>

        {showTimer && (
          <div className={`timer ${timeRemaining < 15 ? "timer-low" : ""}`}>
            <span className="label">Time:</span>
            <span className="value">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Main game table */}
      <GameTable
        players={getPositionedPlayers()}
        currentPlayerId={currentPlayerId}
        activePlayerId={activePlayerId}
        currentDeclaration={gameState?.currentDeclaration}
        showAnimations={showAnimations}
        onAction={handlePlayerAction}
      />

      {/* Game log */}
      <div className="game-log">
        <h3 className="log-title">Game Log</h3>
        <div className="log-entries">
          {recentLogs.map((log, index) => (
            <div key={index} className="log-entry">
              {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Results overlay */}
      {showResults && (
        <div className="results-overlay">
          <div className="results-container">
            <h2 className="results-title">Round Result</h2>
            <div className="results-content">
              {lastAction && (
                <div className="action-result">
                  <span className="player-name">{players.find((p) => p.id === lastAction.playerId)?.name || "Player"}</span>
                  <span className="action-description">{lastAction.action === "challenge" ? "challenged" : "declared"}</span>
                  <span className="result-status">{gameState?.lastRoundWinner === lastAction.playerId ? "Successfully!" : "Unsuccessfully."}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Board.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      handSize: PropTypes.number,
      inGame: PropTypes.bool,
    })
  ).isRequired,
  currentPlayerId: PropTypes.string.isRequired,
  roundNumber: PropTypes.number.isRequired,
  phase: PropTypes.string.isRequired,
};

export default Board;
