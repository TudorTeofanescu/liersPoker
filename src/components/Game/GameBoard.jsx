import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Hand from "../Hand/Hand";
import DeclarationControls from "./DeclarationControls";
import ChallengeControls from "./ChallengeControls";
import "./GameBoard.css";

/**
 * Game board component for LiersPoker
 */
const GameBoard = ({ gameState, players, currentPlayerId, onDeclare, onChallenge, onPass }) => {
  const [selectedCards, setSelectedCards] = useState([]);

  // Update game phase when game state changes
  useEffect(() => {
    if (gameState && gameState.phase === "declaration") {
      // Reset any selected cards when entering declaration phase
      setSelectedCards([]);
    }
  }, [gameState?.phase]);

  // Handle card selection in player's hand
  const handleCardSelect = useCallback((cards) => {
    setSelectedCards(cards);
  }, []);

  // Determine if the current player can make a declaration
  const canDeclare = useMemo(() => {
    return gameState.phase === "declaration" && gameState.currentPlayerId === currentPlayerId;
  }, [gameState.phase, gameState.currentPlayerId, currentPlayerId]);

  // Determine if the current player can challenge
  const canChallenge = useMemo(() => {
    return gameState.phase === "challenge" && gameState.currentPlayerId !== currentPlayerId;
  }, [gameState.phase, gameState.currentPlayerId, currentPlayerId]);

  // Get player name by ID - memoized to avoid recalculations
  const getPlayerName = useCallback(
    (id) => {
      const player = players.find((p) => p.id === id);
      return player ? player.name : id === currentPlayerId ? "You" : `Player ${id.substring(0, 5)}`;
    },
    [players, currentPlayerId]
  );

  // Determine the layout based on number of players - memoized
  const playerPositions = useMemo(() => {
    const positions = {
      2: ["bottom", "top"],
      3: ["bottom", "top-left", "top-right"],
      4: ["bottom", "left", "top", "right"],
      5: ["bottom", "bottom-left", "left", "top", "right"],
      6: ["bottom", "bottom-left", "left", "top-left", "top-right", "right"],
      7: ["bottom", "bottom-left", "left", "top-left", "top", "top-right", "right"],
      8: ["bottom", "bottom-left", "left-bottom", "left-top", "top", "right-top", "right-bottom", "bottom-right"],
    };

    return positions[players.length] || positions[2];
  }, [players.length]);

  // Handle declaration
  const handleDeclare = useCallback(
    (handType, cards) => {
      if (onDeclare) {
        onDeclare(handType, cards);
      }
    },
    [onDeclare]
  );

  return (
    <div className="game-board">
      {/* Game info bar */}
      <div className="game-info-bar">
        <div className="game-phase">Phase: {gameState.phase.charAt(0).toUpperCase() + gameState.phase.slice(1)}</div>
        <div className="round-number">Round: {gameState.roundNumber}</div>
        <div className="active-player">Active Player: {getPlayerName(gameState.currentPlayerId)}</div>
      </div>

      {/* Main game area */}
      <div className="game-table">
        {/* Display center area with current declaration */}
        <div className="table-center">
          {gameState.currentDeclaration ? (
            <div className="current-declaration-display">
              <div className="display-label">Current Declaration:</div>
              <div className="display-value">
                {/* This would be formatted based on the declaration */}
                {gameState.currentDeclaration.type}
              </div>
            </div>
          ) : (
            <div className="waiting-for-declaration">Waiting for declaration...</div>
          )}
        </div>

        {/* Display player hands */}
        {players.map((player, index) => {
          // Determine if this is the current player (self)
          const isSelf = player.id === currentPlayerId;

          // Use actual cards if available, otherwise empty array
          const playerCards = isSelf && gameState.hand ? gameState.hand : [];

          return (
            <div key={player.id} className={`player-position ${playerPositions[index]}`}>
              <Hand
                playerId={player.id}
                playerName={player.name}
                cards={playerCards}
                isSelf={isSelf}
                isDealer={player.id === gameState.dealerPlayerId}
                isActive={player.id === gameState.currentPlayerId}
                isEliminated={!player.inGame}
                maxSelectable={isSelf && gameState.phase === "declaration" ? 5 : 0}
                onCardSelect={handleCardSelect}
              />
            </div>
          );
        })}
      </div>

      {/* Action area - show appropriate controls based on game phase */}
      <div className="action-area">
        {canDeclare && <DeclarationControls currentDeclaration={gameState.currentDeclaration} onDeclare={handleDeclare} />}

        {canChallenge && (
          <ChallengeControls
            currentDeclaration={gameState.currentDeclaration}
            declaringPlayerId={gameState.currentPlayerId}
            declaringPlayerName={getPlayerName(gameState.currentPlayerId)}
            onChallenge={onChallenge}
            onPass={onPass}
          />
        )}

        {!canDeclare && !canChallenge && (
          <div className="waiting-message">
            Waiting for {getPlayerName(gameState.currentPlayerId)} to {gameState.phase === "declaration" ? "make a declaration" : "be challenged"}...
          </div>
        )}
      </div>

      {/* Game log */}
      <div className="game-log">
        <h3 className="log-title">Game Log</h3>
        <div className="log-entries">
          {gameState.logs &&
            gameState.logs.map((log, index) => (
              <div key={`log-${index}`} className="log-entry">
                {log.message}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

GameBoard.propTypes = {
  gameState: PropTypes.shape({
    phase: PropTypes.string.isRequired,
    currentPlayerId: PropTypes.string.isRequired,
    dealerPlayerId: PropTypes.string,
    roundNumber: PropTypes.number,
    currentDeclaration: PropTypes.object,
    hand: PropTypes.array,
    logs: PropTypes.arrayOf(
      PropTypes.shape({
        message: PropTypes.string.isRequired,
        timestamp: PropTypes.number,
      })
    ),
  }).isRequired,
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      handSize: PropTypes.number,
      inGame: PropTypes.bool,
    })
  ).isRequired,
  currentPlayerId: PropTypes.string.isRequired,
  onDeclare: PropTypes.func.isRequired,
  onChallenge: PropTypes.func.isRequired,
  onPass: PropTypes.func.isRequired,
};

export default GameBoard;
