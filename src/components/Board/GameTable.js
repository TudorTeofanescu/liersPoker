import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Hand from "../Hand/Hand";
import { HAND_NAMES, HAND_RANKINGS } from "../../utils/constants";
import "./GameTable.css";

/**
 * Game table component that displays player hands and central declaration area
 */
const GameTable = ({ players, currentPlayerId, activePlayerId, currentDeclaration, showAnimations, onAction }) => {
  const [centerMessage, setCenterMessage] = useState("Waiting for declarations...");
  const [lastActionTime, setLastActionTime] = useState(null);
  const [tableFocus, setTableFocus] = useState(null);

  // Update the center message based on game state
  useEffect(() => {
    if (currentDeclaration) {
      setCenterMessage(formatDeclaration(currentDeclaration));
      setLastActionTime(Date.now());

      // If animations enabled, briefly focus on the active player
      if (showAnimations) {
        setTableFocus(activePlayerId);

        const timer = setTimeout(() => {
          setTableFocus(null);
        }, 1500);

        return () => clearTimeout(timer);
      }
    } else {
      setCenterMessage("Waiting for declarations...");
    }
  }, [currentDeclaration, activePlayerId, showAnimations]);

  // Format the declaration for display
  const formatDeclaration = (declaration) => {
    if (!declaration) return "No declaration";

    const handType = HAND_NAMES[HAND_RANKINGS[declaration.type]];

    // Show additional details based on hand type
    let details = "";

    if (declaration.cards && declaration.cards.length > 0) {
      // For high card declarations, show the rank
      if (declaration.type === "HIGH_CARD") {
        details = ` (${declaration.cards[0].rank} high)`;
      }
      // For pair-based declarations, show the rank of the pair
      else if (["ONE_PAIR", "TWO_PAIR", "THREE_OF_A_KIND", "FULL_HOUSE", "FOUR_OF_A_KIND"].includes(declaration.type)) {
        details = ` of ${declaration.cards[0].rank}s`;
      }
    }

    // Get the declaring player's name
    const declaringPlayer = players.find((p) => p.id === activePlayerId);
    const playerName = declaringPlayer?.name || "Player";

    return `${playerName} declares: ${handType}${details}`;
  };

  // Handle player selection events
  const handleCardSelect = (playerId, cards) => {
    if (playerId !== currentPlayerId) return;

    // Notify parent component of card selection
    if (onAction) {
      onAction("cardSelect", { cards });
    }
  };

  // Get turn status label for a player
  const getPlayerTurnStatus = (player) => {
    if (player.id === activePlayerId) {
      return "Active Turn";
    }
    if (!player.inGame) {
      return "Eliminated";
    }
    return null;
  };

  // Check if the spotlight should be on a specific player
  const isSpotlight = (playerId) => {
    return tableFocus === playerId;
  };

  // Get the dealer icon/badge for the UI
  const getDealerBadge = (player) => {
    if (player.isDealer) {
      return (
        <div className="dealer-badge" title="Dealer">
          D
        </div>
      );
    }
    return null;
  };

  return (
    <div className="game-table">
      {/* Center area with current declaration */}
      <div className="table-center">
        <div className={`declaration-display ${lastActionTime && Date.now() - lastActionTime < 2000 ? "highlight-declaration" : ""}`}>{centerMessage}</div>
      </div>

      {/* Player hands positioned around the table */}
      <div className="players-container">
        {players.map((player) => (
          <div key={player.id} className={`player-position ${player.position} ${isSpotlight(player.id) ? "spotlight" : ""}`}>
            <Hand
              playerId={player.id}
              playerName={player.name || `Player ${player.id}`}
              cards={
                player.id === currentPlayerId
                  ? player.cards || []
                  : Array(player.handSize || 0).fill({
                      id: `hidden_${player.id}_${Math.random()}`,
                      suit: "back",
                      rank: "back",
                    })
              }
              isSelf={player.id === currentPlayerId}
              isDealer={player.isDealer}
              isActive={player.id === activePlayerId}
              isEliminated={!player.inGame}
              maxSelectable={player.id === currentPlayerId && activePlayerId === currentPlayerId ? 5 : 0}
              onCardSelect={(cards) => handleCardSelect(player.id, cards)}
              turnStatus={getPlayerTurnStatus(player)}
              dealerBadge={getDealerBadge(player)}
            />
          </div>
        ))}
      </div>

      {/* Table decorations and visual elements */}
      <div className="table-decorations">
        <div className="table-logo">Liers Poker</div>
        <div className="table-pattern"></div>
      </div>
    </div>
  );
};

GameTable.propTypes = {
  players: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      cards: PropTypes.array,
      handSize: PropTypes.number,
      inGame: PropTypes.bool,
      position: PropTypes.string.isRequired,
      isDealer: PropTypes.bool,
    })
  ).isRequired,
  currentPlayerId: PropTypes.string.isRequired,
  activePlayerId: PropTypes.string,
  currentDeclaration: PropTypes.shape({
    type: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        suit: PropTypes.string.isRequired,
        rank: PropTypes.string.isRequired,
      })
    ),
  }),
  showAnimations: PropTypes.bool,
  onAction: PropTypes.func,
};

GameTable.defaultProps = {
  showAnimations: true,
};

export default GameTable;
