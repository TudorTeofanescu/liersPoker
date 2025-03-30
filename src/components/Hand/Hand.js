import React, { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import Card from "../Card/Card";
import "./Hand.css";

/**
 * Hand component for displaying a player's cards
 */
const Hand = memo(
  ({ playerId, playerName, cards = [], isSelf = false, isDealer = false, isActive = false, isEliminated = false, maxSelectable = 0, onCardSelect }) => {
    const [selectedCards, setSelectedCards] = useState([]);

    // Reset selected cards when cards change
    useEffect(() => {
      setSelectedCards([]);
    }, [cards]);

    // Determine layout style based on number of cards
    const layoutStyle = cards.length >= 5 ? "stack-layout" : "fan-layout";

    // Handle card selection - memoized to preserve reference
    const handleCardClick = useCallback(
      (card) => {
        if (maxSelectable <= 0 || isEliminated) return;

        setSelectedCards((prevSelected) => {
          const isSelected = prevSelected.some((c) => c.id === card.id);

          let newSelection;
          if (isSelected) {
            // Deselect the card
            newSelection = prevSelected.filter((c) => c.id !== card.id);
          } else if (prevSelected.length < maxSelectable) {
            // Select the card if under the limit
            newSelection = [...prevSelected, card];
          } else {
            // Already at selection limit
            return prevSelected;
          }

          // Notify parent component about selection
          if (onCardSelect) {
            onCardSelect(newSelection);
          }

          return newSelection;
        });
      },
      [maxSelectable, isEliminated, onCardSelect]
    );

    // Determine if the player has 5 cards (at risk of elimination)
    const isAtRisk = cards.length === 5 && !isEliminated;

    return (
      <div className={`hand ${isSelf ? "self" : ""} ${isActive ? "active" : ""} ${isEliminated ? "eliminated" : ""}`}>
        {/* Player info section */}
        <div className="player-info">
          <div className="player-name">
            {playerName || (isSelf ? "You" : `Player ${playerId}`)}
            {isDealer && <span className="dealer-badge">D</span>}
          </div>
          <div className="player-status">{isEliminated ? "Eliminated" : `${cards.length} cards`}</div>
        </div>

        {/* Card container */}
        {cards.length > 0 ? (
          <div className={`card-container ${layoutStyle}`}>
            {cards.map((card, index) => {
              // Generate a unique key for each card
              const cardKey = card.id || `card_${playerId}_${index}`;

              return (
                <div
                  key={cardKey}
                  className="card-position"
                  style={{
                    transform: getCardTransform(index, cards.length, layoutStyle),
                    zIndex: index + 1,
                  }}
                >
                  <Card
                    card={card}
                    faceUp={isSelf || card.suit !== "back"} // Face up if it's the player's own hand or not a back card
                    selectable={isSelf && maxSelectable > 0 && !isEliminated}
                    selected={selectedCards.some((c) => c.id === card.id)}
                    onClick={handleCardClick}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-hand-message">No cards</div>
        )}

        {/* Warning indicator for players with 5 cards */}
        {isAtRisk && <div className="warning-indicator">⚠️ Risk of Elimination</div>}

        {/* Eliminated overlay */}
        {isEliminated && <div className="eliminated-overlay">ELIMINATED</div>}
      </div>
    );
  }
);

/**
 * Calculate the transform for a card based on its position in the hand
 */
const getCardTransform = (index, totalCards, layout) => {
  if (layout === "fan-layout") {
    // For fan layout, rotate cards slightly
    const baseRotation = -15; // Start with a negative rotation
    const rotationStep = totalCards > 1 ? 30 / (totalCards - 1) : 0; // Distribute over 30 degrees
    const rotation = baseRotation + index * rotationStep;

    return `rotate(${rotation}deg)`;
  } else {
    // For stack layout, offset cards slightly
    return `translateX(${index * 5}px) translateY(${index * 2}px)`;
  }
};

Hand.propTypes = {
  playerId: PropTypes.string.isRequired,
  playerName: PropTypes.string,
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      suit: PropTypes.string.isRequired,
      rank: PropTypes.string.isRequired,
    })
  ),
  isSelf: PropTypes.bool,
  isDealer: PropTypes.bool,
  isActive: PropTypes.bool,
  isEliminated: PropTypes.bool,
  maxSelectable: PropTypes.number,
  onCardSelect: PropTypes.func,
};

Hand.displayName = "Hand"; // For React DevTools

export default Hand;
